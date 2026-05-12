import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const { phone, message, messageId } = await req.json()

  const WHATSAPP_API_URL = Deno.env.get('WHATSAPP_API_URL') ?? 'https://graph.facebook.com'
  const PHONE_NUMBER_ID = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID')
  const ACCESS_TOKEN = Deno.env.get('WHATSAPP_ACCESS_TOKEN')

  if (!PHONE_NUMBER_ID || !ACCESS_TOKEN) {
    return new Response(JSON.stringify({ error: 'WhatsApp not configured' }), { status: 500, headers: corsHeaders })
  }

  const res = await fetch(`${WHATSAPP_API_URL}/v17.0/${PHONE_NUMBER_ID}/messages`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${ACCESS_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: `91${phone}`,
      type: 'text',
      text: { body: message },
    }),
  })

  const data = await res.json()

  // Update message status in DB
  if (messageId) {
    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
    const status = res.ok ? 'sent' : 'failed'
    const waMessageId = data.messages?.[0]?.id
    await supabase
      .from('whatsapp_messages')
      .update({ status, wa_message_id: waMessageId })
      .eq('id', messageId)
  }

  return new Response(JSON.stringify(data), {
    status: res.ok ? 200 : 500,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
})
