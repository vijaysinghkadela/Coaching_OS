import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: institute } = await supabase.from('institutes').select('id').eq('owner_id', user.id).single()
  if (!institute) return NextResponse.json({ error: 'Institute not found' }, { status: 404 })

  const { batchId, audience, message } = await request.json()

  // Fetch phone numbers based on audience
  let query = supabase.from('students').select('id, phone, parent_phone').eq('institute_id', institute.id).eq('status', 'active')
  if (batchId) query = query.eq('batch_id', batchId)

  const { data: students } = await query
  if (!students || students.length === 0) return NextResponse.json({ error: 'No students found' }, { status: 400 })

  // Collect phone numbers
  const phones: string[] = []
  for (const s of students) {
    if (audience === 'students' || audience === 'all') if (s.phone) phones.push(s.phone)
    if (audience === 'parents' || audience === 'all') if (s.parent_phone) phones.push(s.parent_phone)
  }

  // Log messages in DB
  const msgRows = students.map((s) => ({
    institute_id: institute.id,
    student_id: s.id,
    message_type: 'broadcast',
    content: message,
    status: 'queued',
    phone: s.phone,
  }))
  await supabase.from('whatsapp_messages').insert(msgRows)

  // Call WhatsApp API (non-blocking — actual sending done via Edge Function or background job)
  if (process.env.WHATSAPP_ACCESS_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID) {
    for (const phone of phones.slice(0, 5)) {
      fetch(`${process.env.WHATSAPP_API_URL}/v17.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: `91${phone}`,
          type: 'text',
          text: { body: message },
        }),
      }).catch(() => {})
    }
  }

  return NextResponse.json({ success: true, count: phones.length })
}
