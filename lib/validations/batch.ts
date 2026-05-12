import { z } from 'zod'

export const batchSchema = z.object({
  name:          z.string().min(2, 'Batch name is required'),
  course_id:     z.string().uuid('Select a course'),
  academic_year: z.string().min(4),
  max_students:  z.coerce.number().min(1).max(500).default(60),
  start_date:    z.string().optional(),
  end_date:      z.string().optional(),
})

export type BatchFormData = z.infer<typeof batchSchema>

export const timetableSlotSchema = z.object({
  batch_id:    z.string().uuid(),
  day_of_week: z.coerce.number().min(0).max(6),
  start_time:  z.string(),
  end_time:    z.string(),
  subject:     z.string().min(1, 'Subject is required'),
  teacher_id:  z.string().uuid().optional(),
  room_id:     z.string().uuid().optional(),
})

export type TimetableSlotFormData = z.infer<typeof timetableSlotSchema>
