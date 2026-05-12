import { z } from 'zod'

export const feeStructureSchema = z.object({
  course_id:    z.string().uuid('Select a course'),
  name:         z.string().min(2, 'Name is required'),
  total_amount: z.coerce.number().min(1, 'Amount must be positive'),
  installments: z.coerce.number().min(1).max(12).default(1),
  gst_rate:     z.coerce.number().min(0).max(28).default(0),
})

export type FeeStructureFormData = z.infer<typeof feeStructureSchema>

export const paymentSchema = z.object({
  student_id:    z.string().uuid(),
  fee_record_id: z.string().uuid(),
  amount:        z.coerce.number().min(1, 'Amount must be positive'),
  payment_mode:  z.enum(['cash', 'upi', 'razorpay', 'cheque', 'neft']),
  payment_date:  z.string(),
  reference_no:  z.string().optional(),
  notes:         z.string().optional(),
})

export type PaymentFormData = z.infer<typeof paymentSchema>
