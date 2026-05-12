'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

async function getInstituteId() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data } = await supabase.from('institutes').select('id').eq('owner_id', user.id).single()
  if (!data) redirect('/signup')
  return { supabase, instituteId: data.id }
}

export async function createAttendanceSession(batchId: string, sessionDate: string) {
  const { supabase, instituteId } = await getInstituteId()

  // Upsert session (idempotent per batch+date)
  const { data, error } = await supabase
    .from('attendance_sessions')
    .upsert(
      { batch_id: batchId, institute_id: instituteId, session_date: sessionDate },
      { onConflict: 'batch_id,session_date', ignoreDuplicates: false }
    )
    .select('id')
    .single()

  if (error) return { error: error.message }
  return { sessionId: data.id }
}

export async function markAttendanceBulk(
  sessionId: string,
  records: { studentId: string; status: 'present' | 'absent' | 'late' | 'excused' }[]
) {
  const { supabase } = await getInstituteId()

  const rows = records.map((r) => ({
    session_id: sessionId,
    student_id: r.studentId,
    status: r.status,
    marked_at: new Date().toISOString(),
  }))

  const { error } = await supabase
    .from('attendance_records')
    .upsert(rows, { onConflict: 'session_id,student_id' })

  if (error) return { error: error.message }

  // Check for consecutive absences after marking
  await supabase.rpc('trigger_absence_alerts', { p_session_id: sessionId })

  revalidatePath('/attendance')
  return { success: true }
}

export async function generateQRSession(batchId: string, sessionDate: string) {
  const { supabase, instituteId } = await getInstituteId()

  const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString()
  const { data, error } = await supabase
    .from('attendance_sessions')
    .upsert(
      {
        batch_id: batchId,
        institute_id: instituteId,
        session_date: sessionDate,
        qr_expires_at: expiresAt,
      },
      { onConflict: 'batch_id,session_date' }
    )
    .select('id, qr_token, qr_expires_at')
    .single()

  if (error) return { error: error.message }
  return { sessionId: data.id, qrToken: data.qr_token, expiresAt: data.qr_expires_at }
}
