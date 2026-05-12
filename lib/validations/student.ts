import { z } from 'zod'

export const studentSchema = z.object({
  full_name:    z.string().min(2, 'Name must be at least 2 characters'),
  phone:        z.string().min(10, 'Enter a valid phone number').max(15),
  parent_phone: z.string().min(10, 'Enter a valid parent phone number').max(15),
  parent_name:  z.string().optional(),
  email:        z.string().email().optional().or(z.literal('')),
  gender:       z.enum(['male', 'female', 'other']).optional(),
  date_of_birth: z.string().optional(),
  address:      z.string().optional(),
  city:         z.string().optional(),
  aadhar_number: z.string().optional(),
  batch_id:       z.string().uuid().optional(),
  course_id:      z.string().uuid().optional(),
  admission_date: z.string().optional(),
  notes:          z.string().optional(),
})

export type StudentFormData = z.infer<typeof studentSchema>
