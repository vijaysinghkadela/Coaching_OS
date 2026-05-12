'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { calculateGST } from '@/lib/utils'

async function getInstituteId() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data } = await supabase.from('institutes').select('id, gstin, name, city').eq('owner_id', user.id).single()
  if (!data) redirect('/signup')
  return { supabase, institute: data }
}

const feeStructureSchema = z.object({
  name: z.string().min(2),
  course_id: z.string().uuid().optional(),
  total_amount: z.coerce.number().min(1),
  gst_rate: z.coerce.number().min(0).max(28).default(0),
  installments: z.coerce.number().min(1).max(12).default(1),
  description: z.string().optional(),
})

const paymentSchema = z.object({
  fee_record_id: z.string().uuid(),
  amount: z.coerce.number().min(1),
  payment_method: z.enum(['cash', 'upi', 'bank_transfer', 'razorpay', 'cheque']),
  reference_number: z.string().optional(),
  notes: z.string().optional(),
})

export async function createFeeStructure(values: z.infer<typeof feeStructureSchema>) {
  const { supabase, institute } = await getInstituteId()
  const parsed = feeStructureSchema.safeParse(values)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const gst = calculateGST(parsed.data.total_amount, parsed.data.gst_rate)

  const { data, error } = await supabase
    .from('fee_structures')
    .insert({ ...parsed.data, institute_id: institute.id, base_amount: gst.base, gst_amount: gst.cgst + gst.sgst })
    .select('id')
    .single()

  if (error) return { error: error.message }
  revalidatePath('/fees/structures')
  return { id: data.id }
}

export async function assignFeeToStudent(studentId: string, feeStructureId: string, dueDate: string) {
  const { supabase, institute } = await getInstituteId()

  const { data: structure } = await supabase
    .from('fee_structures')
    .select('total_amount')
    .eq('id', feeStructureId)
    .single()

  if (!structure) return { error: 'Fee structure not found' }

  const { data, error } = await supabase
    .from('fee_records')
    .insert({
      student_id: studentId,
      institute_id: institute.id,
      fee_structure_id: feeStructureId,
      total_amount: structure.total_amount,
      due_date: dueDate,
    })
    .select('id')
    .single()

  if (error) return { error: error.message }
  revalidatePath('/fees')
  return { id: data.id }
}

export async function recordPayment(values: z.infer<typeof paymentSchema>) {
  const { supabase, institute } = await getInstituteId()
  const parsed = paymentSchema.safeParse(values)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const { data, error } = await supabase
    .from('payment_transactions')
    .insert({
      ...parsed.data,
      institute_id: institute.id,
      status: 'completed',
      payment_date: new Date().toISOString(),
    })
    .select('id, receipt_number')
    .single()

  if (error) return { error: error.message }
  revalidatePath('/fees')
  return { id: data.id, receiptNumber: data.receipt_number }
}
