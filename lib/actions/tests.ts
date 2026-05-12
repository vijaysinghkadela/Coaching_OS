'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const testSchema = z.object({
  name: z.string().min(2),
  batch_id: z.string().uuid(),
  test_type: z.enum(['unit', 'mock', 'half_yearly', 'annual', 'weekly']),
  test_date: z.string(),
  max_marks: z.coerce.number().min(1),
  subjects: z.array(z.string()).optional(),
})

const scoreSchema = z.array(z.object({
  student_id: z.string().uuid(),
  marks_obtained: z.coerce.number().min(0),
  is_absent: z.boolean().default(false),
  remarks: z.string().optional(),
}))

async function getInstituteId() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data } = await supabase.from('institutes').select('id').eq('owner_id', user.id).single()
  if (!data) redirect('/signup')
  return { supabase, instituteId: data.id }
}

export async function createTest(values: z.infer<typeof testSchema>) {
  const { supabase, instituteId } = await getInstituteId()
  const parsed = testSchema.safeParse(values)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const { data, error } = await supabase
    .from('tests')
    .insert({ ...parsed.data, institute_id: instituteId })
    .select('id')
    .single()

  if (error) return { error: error.message }
  revalidatePath('/tests')
  return { id: data.id }
}

export async function saveTestScores(testId: string, scores: z.infer<typeof scoreSchema>) {
  const { supabase, instituteId } = await getInstituteId()

  const { data: test } = await supabase
    .from('tests')
    .select('max_marks, institute_id')
    .eq('id', testId)
    .single()

  if (!test || test.institute_id !== instituteId) return { error: 'Test not found' }

  const rows = scores.map((s) => ({
    test_id: testId,
    student_id: s.student_id,
    marks_obtained: s.is_absent ? 0 : s.marks_obtained,
    max_marks: test.max_marks,
    is_absent: s.is_absent,
    remarks: s.remarks,
  }))

  const { error } = await supabase
    .from('test_scores')
    .upsert(rows, { onConflict: 'test_id,student_id' })

  if (error) return { error: error.message }

  // Trigger rank recomputation
  await supabase.rpc('recompute_test_ranks', { p_test_id: testId })

  revalidatePath(`/tests/${testId}`)
  return { success: true }
}
