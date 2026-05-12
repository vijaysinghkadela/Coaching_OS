'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { studentSchema, type StudentFormData } from '@/lib/validations/student'
import { createStudent } from '@/lib/actions/students'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

interface Batch { id: string; name: string }
interface Course { id: string; name: string }

interface EnrollmentFormProps {
  batches: Batch[]
  courses: Course[]
}

const STEPS = ['Personal Info', 'Course & Batch', 'Review']

export function EnrollmentForm({ batches, courses }: EnrollmentFormProps) {
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const form = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema),
    defaultValues: { gender: 'male' },
  })

  const { register, handleSubmit, formState: { errors }, setValue, watch, trigger } = form
  // eslint-disable-next-line react-hooks/incompatible-library
  const values = watch()

  const nextStep = async () => {
    const fields: Array<keyof StudentFormData> = step === 0
      ? ['full_name', 'phone', 'parent_phone', 'gender']
      : ['batch_id', 'course_id']
    const ok = await trigger(fields)
    if (ok) setStep((s) => s + 1)
  }

  const onSubmit = async (data: StudentFormData) => {
    setLoading(true)
    const result = await createStudent(data)
    setLoading(false)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Student enrolled successfully!')
      router.push(`/students/${result.id}`)
    }
  }

  return (
    <div className="max-w-xl mx-auto">
      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center gap-2 flex-1 last:flex-none">
            <div className={cn(
              'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0',
              i < step ? 'bg-primary text-primary-foreground' :
              i === step ? 'bg-primary text-primary-foreground ring-2 ring-primary/30' :
              'bg-muted text-muted-foreground'
            )}>
              {i + 1}
            </div>
            <span className={cn('text-xs hidden sm:inline', i === step ? 'text-foreground font-medium' : 'text-muted-foreground')}>
              {label}
            </span>
            {i < STEPS.length - 1 && <div className="flex-1 h-px bg-border" />}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Step 0: Personal Info */}
        {step === 0 && (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="full_name">Full Name *</Label>
                <Input id="full_name" {...register('full_name')} placeholder="Rahul Sharma" />
                {errors.full_name && <p className="text-xs text-destructive">{errors.full_name.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone">Student Phone *</Label>
                <Input id="phone" {...register('phone')} placeholder="9876543210" maxLength={10} />
                {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="parent_phone">Parent Phone *</Label>
                <Input id="parent_phone" {...register('parent_phone')} placeholder="9876543210" maxLength={10} />
                {errors.parent_phone && <p className="text-xs text-destructive">{errors.parent_phone.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Gender *</Label>
                <Select value={values.gender} onValueChange={(v) => setValue('gender', v as StudentFormData['gender'])}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="date_of_birth">Date of Birth</Label>
                <Input id="date_of_birth" type="date" {...register('date_of_birth')} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">Email (optional)</Label>
                <Input id="email" type="email" {...register('email')} placeholder="rahul@example.com" />
                {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="address">Address</Label>
                <Textarea id="address" {...register('address')} rows={2} placeholder="Full address" />
              </div>
            </div>
            <Button type="button" className="w-full" onClick={nextStep}>Next: Course &amp; Batch</Button>
          </>
        )}

        {/* Step 1: Course & Batch */}
        {step === 1 && (
          <>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label>Course</Label>
                <Select value={values.course_id ?? ''} onValueChange={(v) => setValue('course_id', v ?? undefined)}>
                  <SelectTrigger><SelectValue placeholder="Select course" /></SelectTrigger>
                  <SelectContent>
                    {courses.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Batch</Label>
                <Select value={values.batch_id ?? ''} onValueChange={(v) => setValue('batch_id', v ?? undefined)}>
                  <SelectTrigger><SelectValue placeholder="Select batch" /></SelectTrigger>
                  <SelectContent>
                    {batches.map((b) => (
                      <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="admission_date">Admission Date</Label>
                <Input id="admission_date" type="date" {...register('admission_date')} defaultValue={new Date().toISOString().split('T')[0]} />
              </div>
            </div>
            <div className="flex gap-3">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setStep(0)}>Back</Button>
              <Button type="button" className="flex-1" onClick={nextStep}>Review</Button>
            </div>
          </>
        )}

        {/* Step 2: Review */}
        {step === 2 && (
          <>
            <div className="rounded-lg border border-border divide-y divide-border text-sm">
              {[
                ['Name', values.full_name],
                ['Phone', values.phone],
                ['Parent Phone', values.parent_phone],
                ['Email', values.email || '—'],
                ['Gender', values.gender],
                ['Date of Birth', values.date_of_birth || '—'],
                ['Course', courses.find((c) => c.id === values.course_id)?.name || '—'],
                ['Batch', batches.find((b) => b.id === values.batch_id)?.name || '—'],
              ].map(([label, val]) => (
                <div key={label} className="flex justify-between px-4 py-2.5">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="font-medium capitalize">{val}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setStep(1)}>Back</Button>
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading ? 'Enrolling…' : 'Confirm Enrollment'}
              </Button>
            </div>
          </>
        )}
      </form>
    </div>
  )
}
