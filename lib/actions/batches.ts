'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const batchSchema = z.object({
  name: z.string().min(2).max(100),
  course_id: z.string().uuid().optional(),
  academic_year: z.string().min(4),
  capacity: z.coerce.number().min(1).max(500),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
})

const slotSchema = z.object({
  batch_id: z.string().uuid(),
  teacher_id: z.string().uuid().optional(),
  room_id: z.string().uuid().optional(),
  subject: z.string().min(1).max(100),
  day_of_week: z.coerce.number().min(0).max(6),
  start_time: z.string().regex(/^\d{2}:\d{2}$/),
  end_time: z.string().regex(/^\d{2}:\d{2}$/),
})

async function getInstituteId() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data } = await supabase.from('institutes').select('id').eq('owner_id', user.id).single()
  if (!data) redirect('/signup')
  return { supabase, instituteId: data.id }
}

export async function createBatch(values: z.infer<typeof batchSchema>) {
  const { supabase, instituteId } = await getInstituteId()
  const parsed = batchSchema.safeParse(values)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const { data, error } = await supabase
    .from('batches')
    .insert({ ...parsed.data, institute_id: instituteId })
    .select('id')
    .single()

  if (error) return { error: error.message }
  revalidatePath('/batches')
  return { id: data.id }
}

export async function createTimetableSlot(values: z.infer<typeof slotSchema>) {
  const { supabase, instituteId } = await getInstituteId()
  const parsed = slotSchema.safeParse(values)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const { error } = await supabase
    .from('timetable_slots')
    .insert({ ...parsed.data, institute_id: instituteId })

  if (error) {
    if (error.code === '23505') return { error: 'This slot conflicts with an existing booking (teacher or room already in use).' }
    return { error: error.message }
  }
  revalidatePath('/batches')
  return { success: true }
}

export async function deleteTimetableSlot(slotId: string) {
  const { supabase, instituteId } = await getInstituteId()
  const { error } = await supabase
    .from('timetable_slots')
    .delete()
    .eq('id', slotId)
    .eq('institute_id', instituteId)

  if (error) return { error: error.message }
  revalidatePath('/batches')
  return { success: true }
}
