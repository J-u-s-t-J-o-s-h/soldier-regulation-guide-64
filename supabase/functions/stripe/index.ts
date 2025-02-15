import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { stripe } from './stripe.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { Database } from '../_shared/database.types.ts'

interface WebhookRequest {
  type: string;
  data: {
    object: any;
  };
}

interface CreateCheckoutBody {
  priceId: string;
  successUrl: string;
  cancelUrl: string;
}

interface CreateCustomerPortalBody {
  returnUrl: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const supabaseClient = createClient<Database>(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? ''
  )

  const authHeader = req.headers.get('Authorization')
  if (!authHeader) {
    return new Response('No authorization header', {
      status: 401,
      headers: corsHeaders,
    })
  }

  const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
    authHeader.replace('Bearer ', '')
  )

  if (authError || !user) {
    return new Response('Unauthorized', {
      status: 401,
      headers: corsHeaders,
    })
  }

  try {
    switch (req.method) {
      case 'POST': {
        const path = new URL(req.url).pathname
        console.log('Received request for path:', path)

        if (path.includes('/stripe/checkout')) {
          const { priceId, successUrl, cancelUrl } = await req.json()
          console.log('Checkout request received:', { priceId, successUrl, cancelUrl })

          let { data: customers } = await supabaseClient
            .from('customers')
            .select('stripe_customer_id')
            .eq('id', user.id)
            .single()

          if (!customers?.stripe_customer_id) {
            console.log('Creating new Stripe customer for user:', user.id)
            const customer = await stripe.customers.create({
              email: user.email,
              metadata: {
                supabase_id: user.id,
              },
            })

            const { error } = await supabaseClient
              .from('customers')
              .insert([{ id: user.id, stripe_customer_id: customer.id }])

            if (error) throw error
            customers = { stripe_customer_id: customer.id }
          }

          const session = await stripe.checkout.sessions.create({
            customer: customers.stripe_customer_id,
            line_items: [{ price: priceId, quantity: 1 }],
            mode: 'subscription',
            success_url: successUrl,
            cancel_url: cancelUrl,
          })

          return new Response(
            JSON.stringify({ sessionId: session.url }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        if (path.includes('/stripe/portal')) {
          const { returnUrl }: CreateCustomerPortalBody = await req.json()

          const { data: customer } = await supabaseClient
            .from('customers')
            .select('stripe_customer_id')
            .eq('id', user.id)
            .single()

          if (!customer?.stripe_customer_id) {
            return new Response(
              'Customer not found',
              { status: 404, headers: corsHeaders }
            )
          }

          const portalSession = await stripe.billingPortal.sessions.create({
            customer: customer.stripe_customer_id,
            return_url: returnUrl,
          })

          return new Response(
            JSON.stringify({ url: portalSession.url }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        if (path.includes('/stripe/webhook')) {
          const signature = req.headers.get('stripe-signature')
          if (!signature) {
            return new Response('No signature', {
              status: 401,
              headers: corsHeaders,
            })
          }

          const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')
          if (!webhookSecret) {
            return new Response('Webhook secret not configured', {
              status: 500,
              headers: corsHeaders,
            })
          }

          const body = await req.text()
          let event

          try {
            event = stripe.webhooks.constructEvent(
              body,
              signature,
              webhookSecret
            )
          } catch (err) {
            return new Response(`Webhook Error: ${err.message}`, {
              status: 400,
              headers: corsHeaders,
            })
          }

          const webhook = event as WebhookRequest

          try {
            switch (webhook.type) {
              case 'customer.subscription.created':
              case 'customer.subscription.updated':
              case 'customer.subscription.deleted': {
                const subscription = webhook.data.object
                const { error } = await supabaseClient.from('subscriptions').upsert({
                  id: subscription.id,
                  user_id: subscription.metadata.supabase_id,
                  status: subscription.status,
                  price_id: subscription.items.data[0].price.id,
                  quantity: subscription.items.data[0].quantity,
                  cancel_at_period_end: subscription.cancel_at_period_end,
                  cancel_at: subscription.cancel_at
                    ? new Date(subscription.cancel_at * 1000).toISOString()
                    : null,
                  canceled_at: subscription.canceled_at
                    ? new Date(subscription.canceled_at * 1000).toISOString()
                    : null,
                  current_period_start: new Date(
                    subscription.current_period_start * 1000
                  ).toISOString(),
                  current_period_end: new Date(
                    subscription.current_period_end * 1000
                  ).toISOString(),
                  created_at: new Date(subscription.created * 1000).toISOString(),
                  ended_at: subscription.ended_at
                    ? new Date(subscription.ended_at * 1000).toISOString()
                    : null,
                  trial_start: subscription.trial_start
                    ? new Date(subscription.trial_start * 1000).toISOString()
                    : null,
                  trial_end: subscription.trial_end
                    ? new Date(subscription.trial_end * 1000).toISOString()
                    : null,
                })

                if (error) throw error
                break
              }
            }

            return new Response(JSON.stringify({ received: true }), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            })
          } catch (error) {
            return new Response(
              `Webhook error: ${error.message}`,
              { status: 400, headers: corsHeaders }
            )
          }
        }

        return new Response('Unknown path', {
          status: 404,
          headers: corsHeaders,
        })
      }
      default:
        return new Response('Method not allowed', {
          status: 405,
          headers: corsHeaders,
        })
    }
  } catch (error) {
    console.error('Error processing request:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
