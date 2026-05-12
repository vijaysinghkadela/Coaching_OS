import { z } from 'zod'

export const testSchema = z.object({
  name:          z.string().min(2, 'Test name is required'),
  subject:       z.string().min(1, 'Subject is required'),
  batch_id:      z.string().uuid().optional(),
  course_id:     z.string().uuid().optional(),
  test_date:     z.string(),
  max_marks:     z.coerce.number().min(1, 'Max marks must be positive'),
  passing_marks: z.coerce.number().optional(),
  test_type:     z.enum(['unit', 'chapter', 'mock', 'half_yearly', 'annual', 'jee_mock', 'neet_mock']),
  instructions:  z.string().optional(),
})

export type TestFormData = z.infer<typeof testSchema>
