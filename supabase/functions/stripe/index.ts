
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { stripe } from './stripe.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { Database } from '../_shared/database.types.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient<Database>(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (req.method === 'POST') {
      const { priceId, successUrl, cancelUrl } = await req.json()
      console.log('Request received:', { priceId, successUrl, cancelUrl })

      if (!priceId || !successUrl || !cancelUrl) {
        return new Response(
          JSON.stringify({ error: 'Missing required parameters' }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        )
      }

      // Get or create customer
      const { data: customerData } = await supabaseClient
        .from('customers')
        .select('stripe_customer_id')
        .eq('id', user.id)
        .single()

      let stripeCustomerId = customerData?.stripe_customer_id

      if (!stripeCustomerId) {
        console.log('Creating new customer for user:', user.id)
        const customer = await stripe.customers.create({
          email: user.email,
          metadata: {
            supabase_id: user.id,
          },
        })

        const { error: insertError } = await supabaseClient
          .from('customers')
          .insert([{ id: user.id, stripe_customer_id: customer.id }])

        if (insertError) {
          throw new Error('Failed to create customer record')
        }

        stripeCustomerId = customer.id
      }

      console.log('Creating checkout session for customer:', stripeCustomerId)
      
      const session = await stripe.checkout.sessions.create({
        customer: stripeCustomerId,
        line_items: [{ price: priceId, quantity: 1 }],
        mode: 'subscription',
        success_url: successUrl,
        cancel_url: cancelUrl,
      })

      console.log('Checkout session created:', session)

      return new Response(
        JSON.stringify({ url: session.url }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
