
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { stripe } from '../stripe/stripe.ts'
import { corsHeaders } from '../_shared/cors.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL')
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const signature = req.headers.get('stripe-signature')
  if (!signature) {
    console.error('No stripe signature found in webhook request')
    return new Response('No signature', { status: 400 })
  }

  try {
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!)
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')
    if (!webhookSecret) {
      console.error('Missing STRIPE_WEBHOOK_SECRET environment variable')
      throw new Error('Missing STRIPE_WEBHOOK_SECRET')
    }

    // Get the raw body
    const body = await req.text()
    console.log('Received webhook with signature:', signature)
    
    // Verify the webhook signature
    let event
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        webhookSecret
      )
    } catch (err) {
      console.error(`Webhook signature verification failed:`, err)
      return new Response('Invalid signature', { status: 400 })
    }

    console.log(`Processing webhook event: ${event.type}`, { eventId: event.id })

    // Handle specific Stripe events
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object
        console.log('Processing subscription event:', {
          eventType: event.type,
          subscriptionId: subscription.id,
          customerId: subscription.customer,
          status: subscription.status
        })
        
        // Get the customer to find the user_id
        const { data: customerData, error: customerError } = await supabase
          .from('customers')
          .select('id')
          .eq('stripe_customer_id', subscription.customer)
          .single()

        if (customerError) {
          console.error('Error fetching customer:', customerError)
          throw new Error('Customer not found')
        }

        if (!customerData?.id) {
          console.error('Customer not found for stripe_customer_id:', subscription.customer)
          throw new Error('Customer not found')
        }

        console.log('Found customer:', customerData)

        // Upsert the subscription data
        const { error: upsertError } = await supabase
          .from('subscriptions')
          .upsert({
            id: subscription.id,
            user_id: customerData.id,
            status: subscription.status,
            price_id: subscription.items.data[0].price.id,
            quantity: subscription.items.data[0].quantity,
            cancel_at_period_end: subscription.cancel_at_period_end,
            cancel_at: subscription.cancel_at ? new Date(subscription.cancel_at * 1000).toISOString() : null,
            canceled_at: subscription.canceled_at ? new Date(subscription.canceled_at * 1000).toISOString() : null,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            created: new Date(subscription.created * 1000).toISOString(),
            ended_at: subscription.ended_at ? new Date(subscription.ended_at * 1000).toISOString() : null,
            trial_start: subscription.trial_start ? new Date(subscription.trial_start * 1000).toISOString() : null,
            trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
            metadata: subscription.metadata
          })

        if (upsertError) {
          console.error('Error upserting subscription:', upsertError)
          throw upsertError
        }

        console.log('Successfully processed subscription update')
        break
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
