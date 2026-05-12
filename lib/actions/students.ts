'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { studentSchema, type StudentFormData } from '@/lib/validations/student'
import { TIER_LIMITS } from '@/lib/constants'

async function getInstituteId() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data } = await supabase.from('institutes').select('id, plan_tier, max_students').eq('owner_id', user.id).single()
  if (!data) redirect('/signup')
  return { supabase, institute: data }
}

export async function createStudent(values: StudentFormData) {
  const { supabase, institute } = await getInstituteId()
  const parsed = studentSchema.safeParse(values)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  // Enforce tier student limit
  const { count } = await supabase
    .from('students')
    .select('*', { count: 'exact', head: true })
    .eq('institute_id', institute.id)
    .eq('status', 'active')

  const limit = institute.max_students ?? TIER_LIMITS[institute.plan_tier as keyof typeof TIER_LIMITS]?.maxStudents ?? 100
  if ((count ?? 0) >= limit) {
    return { error: `Student limit reached for your ${institute.plan_tier} plan. Upgrade to enroll more students.` }
  }

  const { data, error } = await supabase
    .from('students')
    .insert({ ...parsed.data, institute_id: institute.id })
    .select('id')
    .single()

  if (error) return { error: error.message }
  revalidatePath('/students')
  return { id: data.id }
}

export async function updateStudent(id: string, values: Partial<StudentFormData>) {
  const { supabase, institute } = await getInstituteId()
  const { error } = await supabase
    .from('students')
    .update(values)
    .eq('id', id)
    .eq('institute_id', institute.id)

  if (error) return { error: error.message }
  revalidatePath(`/students/${id}`)
  revalidatePath('/students')
  return { success: true }
}

export async function deactivateStudent(id: string) {
  const { supabase, institute } = await getInstituteId()
  const { error } = await supabase
    .from('students')
    .update({ status: 'inactive' })
    .eq('id', id)
    .eq('institute_id', institute.id)

  if (error) return { error: error.message }
  revalidatePath('/students')
  return { success: true }
}

export async function getStudents(search?: string, batchId?: string) {
  const { supabase, institute } = await getInstituteId()
  let query = supabase
    .from('students')
    .select('id, enrollment_no, full_name, phone, gender, status, created_at, batches(name)')
    .eq('institute_id', institute.id)
    .order('created_at', { ascending: false })

  if (search) query = query.ilike('full_name', `%${search}%`)
  if (batchId) query = query.eq('batch_id', batchId)

  const { data, error } = await query
  if (error) return []
  return data ?? []
}
