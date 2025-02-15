
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const openAIApiKey = Deno.env.get('OPENAI_API_KEY')
const assistantId = Deno.env.get('OPENAI_ASSISTANT_ID')
const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Validate environment variables
    if (!openAIApiKey) {
      throw new Error('OPENAI_API_KEY is not set')
    }
    if (!assistantId) {
      throw new Error('OPENAI_ASSISTANT_ID is not set')
    }

    const { prompt, userId } = await req.json()

    if (!prompt) throw new Error('Prompt is required')
    if (!userId) throw new Error('User ID is required')

    console.log('Creating thread with prompt:', prompt)

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Store user's message
    await supabase.from('chat_messages').insert({
      user_id: userId,
      content: prompt,
      is_user: true
    })

    // Create a thread
    const threadResponse = await fetch('https://api.openai.com/v1/threads', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'assistants=v1'
      }
    })

    if (!threadResponse.ok) {
      const errorData = await threadResponse.text()
      console.error('Thread creation failed:', {
        status: threadResponse.status,
        statusText: threadResponse.statusText,
        error: errorData
      })
      throw new Error(`Failed to create thread: ${errorData}`)
    }

    const thread = await threadResponse.json()
    console.log('Thread created successfully:', thread.id)

    // Add message to thread
    const messageResponse = await fetch(`https://api.openai.com/v1/threads/${thread.id}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'assistants=v1'
      },
      body: JSON.stringify({
        role: 'user',
        content: prompt
      })
    })

    if (!messageResponse.ok) {
      const errorData = await messageResponse.text()
      console.error('Message creation failed:', {
        status: messageResponse.status,
        statusText: messageResponse.statusText,
        error: errorData
      })
      throw new Error('Failed to add message to thread')
    }

    console.log('Message added to thread successfully')

    // Run the assistant
    const runResponse = await fetch(`https://api.openai.com/v1/threads/${thread.id}/runs`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'assistants=v1'
      },
      body: JSON.stringify({
        assistant_id: assistantId
      })
    })

    if (!runResponse.ok) {
      const errorData = await runResponse.text()
      console.error('Run creation failed:', {
        status: runResponse.status,
        statusText: runResponse.statusText,
        error: errorData
      })
      throw new Error('Failed to run assistant')
    }

    const run = await runResponse.json()
    console.log('Assistant run started:', run.id)

    // Poll for completion
    let runStatus = run.status
    let attempts = 0
    const maxAttempts = 30 // Maximum 30 attempts (30 seconds)

    while (runStatus !== 'completed' && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 1000)) // Wait 1 second

      const statusResponse = await fetch(`https://api.openai.com/v1/threads/${thread.id}/runs/${run.id}`, {
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'OpenAI-Beta': 'assistants=v1'
        }
      })

      if (!statusResponse.ok) {
        const errorData = await statusResponse.text()
        console.error('Status check failed:', {
          status: statusResponse.status,
          statusText: statusResponse.statusText,
          error: errorData
        })
        throw new Error('Failed to check run status')
      }

      const statusData = await statusResponse.json()
      runStatus = statusData.status
      attempts++
      console.log('Run status:', runStatus, 'Attempt:', attempts)

      if (statusData.status === 'failed') {
        throw new Error('Assistant run failed')
      }
    }

    if (runStatus !== 'completed') {
      throw new Error('Assistant run timed out')
    }

    console.log('Run completed successfully')

    // Get messages
    const messagesResponse = await fetch(`https://api.openai.com/v1/threads/${thread.id}/messages`, {
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'OpenAI-Beta': 'assistants=v1'
      }
    })

    if (!messagesResponse.ok) {
      const errorData = await messagesResponse.text()
      console.error('Messages retrieval failed:', {
        status: messagesResponse.status,
        statusText: messagesResponse.statusText,
        error: errorData
      })
      throw new Error('Failed to retrieve messages')
    }

    const messages = await messagesResponse.json()
    const assistantMessage = messages.data[0] // Get the latest message (assistant's response)
    const generatedText = assistantMessage.content[0].text.value

    console.log('Retrieved assistant response successfully')

    // Store AI's response
    await supabase.from('chat_messages').insert({
      user_id: userId,
      content: generatedText,
      is_user: false
    })

    return new Response(JSON.stringify({ generatedText }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error in generate-with-ai function:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
