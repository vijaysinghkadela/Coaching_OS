'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'
import { createBrowserClient } from '@supabase/ssr'
import { cn } from '@/lib/utils'
import { Building2, BookOpen, Users, CheckCircle2 } from 'lucide-react'

const STEPS = [
  { title: 'Institute Details', icon: Building2, desc: 'Tell us about your coaching institute' },
  { title: 'Add Courses', icon: BookOpen, desc: 'Set up the courses you offer' },
  { title: 'Create First Batch', icon: Users, desc: 'Create your first student batch' },
  { title: 'All Set!', icon: CheckCircle2, desc: 'Your institute is ready to go' },
]

export default function OnboardingPage() {
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState({
    city: '',
    phone: '',
    courses: [{ name: '', subjects: '' }],
    batchName: '',
    academicYear: '2025-26',
    capacity: 30,
  })
  const router = useRouter()
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const getInstituteId = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null
    const { data } = await supabase.from('institutes').select('id').eq('owner_id', user.id).single()
    return data?.id
  }

  const handleStep0 = async () => {
    setLoading(true)
    const iid = await getInstituteId()
    if (iid) {
      await supabase.from('institutes').update({ city: data.city, phone: data.phone }).eq('id', iid)
    }
    setLoading(false)
    setStep(1)
  }

  const handleStep1 = async () => {
    setLoading(true)
    const iid = await getInstituteId()
    if (iid) {
      const rows = data.courses
        .filter((c) => c.name.trim())
        .map((c) => ({
          institute_id: iid,
          name: c.name,
          subjects: c.subjects.split(',').map((s) => s.trim()).filter(Boolean),
        }))
      if (rows.length > 0) await supabase.from('courses').insert(rows)
    }
    setLoading(false)
    setStep(2)
  }

  const handleStep2 = async () => {
    setLoading(true)
    const iid = await getInstituteId()
    if (iid && data.batchName.trim()) {
      await supabase.from('batches').insert({
        institute_id: iid,
        name: data.batchName,
        academic_year: data.academicYear,
        capacity: data.capacity,
      })
    }
    setLoading(false)
    setStep(3)
  }

  const handleFinish = async () => {
    setLoading(true)
    const iid = await getInstituteId()
    if (iid) await supabase.from('institutes').update({ onboarding_done: true }).eq('id', iid)
    setLoading(false)
    toast.success('Welcome to Coaching OS!')
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Step indicator */}
        <div className="flex items-center gap-1 mb-8 justify-center">
          {STEPS.map((s, i) => (
            <div key={s.title} className="flex items-center">
              <div className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold',
                i < step ? 'bg-primary text-primary-foreground' :
                i === step ? 'bg-primary text-primary-foreground ring-4 ring-primary/20' :
                'bg-muted text-muted-foreground'
              )}>
                {i < step ? '✓' : i + 1}
              </div>
              {i < STEPS.length - 1 && <div className={cn('w-8 h-px', i < step ? 'bg-primary' : 'bg-border')} />}
            </div>
          ))}
        </div>

        <Card>
          <CardContent className="pt-6 pb-6 space-y-6">
            <div className="text-center">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                {(() => { const Icon = STEPS[step].icon; return <Icon size={22} className="text-primary" /> })()}
              </div>
              <h2 className="text-xl font-bold text-foreground">{STEPS[step].title}</h2>
              <p className="text-sm text-muted-foreground mt-1">{STEPS[step].desc}</p>
            </div>

            {step === 0 && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label>City</Label>
                  <Input value={data.city} onChange={(e) => setData((d) => ({ ...d, city: e.target.value }))} placeholder="Bikaner" />
                </div>
                <div className="space-y-1.5">
                  <Label>Phone Number</Label>
                  <Input value={data.phone} onChange={(e) => setData((d) => ({ ...d, phone: e.target.value }))} placeholder="9876543210" maxLength={10} />
                </div>
                <Button className="w-full" onClick={handleStep0} disabled={loading}>Continue</Button>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-4">
                {data.courses.map((course, i) => (
                  <div key={i} className="space-y-2 p-3 border border-border rounded-lg">
                    <div className="space-y-1.5">
                      <Label>Course Name</Label>
                      <Input
                        value={course.name}
                        onChange={(e) => setData((d) => ({ ...d, courses: d.courses.map((c, j) => j === i ? { ...c, name: e.target.value } : c) }))}
                        placeholder="Class 11 Science"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Subjects (comma-separated)</Label>
                      <Input
                        value={course.subjects}
                        onChange={(e) => setData((d) => ({ ...d, courses: d.courses.map((c, j) => j === i ? { ...c, subjects: e.target.value } : c) }))}
                        placeholder="Physics, Chemistry, Maths"
                      />
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full" onClick={() => setData((d) => ({ ...d, courses: [...d.courses, { name: '', subjects: '' }] }))}>
                  + Add Another Course
                </Button>
                <Button className="w-full" onClick={handleStep1} disabled={loading}>Continue</Button>
                <Button variant="ghost" className="w-full text-muted-foreground" onClick={() => setStep(2)}>Skip</Button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Batch Name</Label>
                  <Input value={data.batchName} onChange={(e) => setData((d) => ({ ...d, batchName: e.target.value }))} placeholder="Class 11 Science A" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Academic Year</Label>
                    <Input value={data.academicYear} onChange={(e) => setData((d) => ({ ...d, academicYear: e.target.value }))} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Capacity</Label>
                    <Input type="number" value={data.capacity} onChange={(e) => setData((d) => ({ ...d, capacity: Number(e.target.value) }))} />
                  </div>
                </div>
                <Button className="w-full" onClick={handleStep2} disabled={loading}>Continue</Button>
                <Button variant="ghost" className="w-full text-muted-foreground" onClick={() => setStep(3)}>Skip</Button>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4 text-center">
                <p className="text-muted-foreground text-sm">
                  Your institute is set up and ready. You can now enroll students, create batches, mark attendance, and collect fees.
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {['Enroll Students', 'Mark Attendance', 'Collect Fees', 'Track Tests'].map((item) => (
                    <div key={item} className="rounded-lg bg-primary/10 text-primary font-medium py-2">{item}</div>
                  ))}
                </div>
                <Button className="w-full" onClick={handleFinish} disabled={loading}>
                  {loading ? 'Setting up…' : 'Go to Dashboard →'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
