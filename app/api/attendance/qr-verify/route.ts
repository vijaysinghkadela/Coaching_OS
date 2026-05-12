import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token')
  if (!token) return NextResponse.json({ error: 'Missing token' }, { status: 400 })

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    // Redirect to login with return URL for unauthenticated student
    return NextResponse.redirect(new URL(`/login?redirect=/api/attendance/qr-verify?token=${token}`, request.url))
  }

  const { data: session } = await supabase
    .from('attendance_sessions')
    .select('id, batch_id, qr_expires_at, qr_token')
    .eq('qr_token', token)
    .single()

  if (!session) {
    return new Response('<html><body><h2>Invalid QR code.</h2></body></html>', { headers: { 'Content-Type': 'text/html' } })
  }

  if (new Date(session.qr_expires_at) < new Date()) {
    return new Response('<html><body><h2>QR code has expired. Ask your teacher to regenerate.</h2></body></html>', { headers: { 'Content-Type': 'text/html' } })
  }

  // Find student linked to this user
  const { data: student } = await supabase
    .from('students')
    .select('id')
    .eq('user_id', user.id)
    .eq('batch_id', session.batch_id)
    .single()

  if (!student) {
    return new Response('<html><body><h2>You are not enrolled in this batch.</h2></body></html>', { headers: { 'Content-Type': 'text/html' } })
  }

  await supabase
    .from('attendance_records')
    .upsert(
      { session_id: session.id, student_id: student.id, status: 'present', marked_at: new Date().toISOString() },
      { onConflict: 'session_id,student_id' }
    )

  return new Response(
    '<html><body style="font-family:sans-serif;text-align:center;padding:40px"><h2>✅ Attendance marked!</h2><p>You are marked present for today.</p></body></html>',
    { headers: { 'Content-Type': 'text/html' } }
  )
}
