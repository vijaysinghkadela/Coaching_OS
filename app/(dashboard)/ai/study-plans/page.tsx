'use client'

import { useState } from 'react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Sparkles, BookOpen } from 'lucide-react'
import { DEMO_STUDENTS } from '@/lib/demo/data'

export default function StudyPlansPage() {
  const [studentId, setStudentId] = useState('')
  const [examDate, setExamDate] = useState('')
  const [plan, setPlan] = useState('')
  const [loading, setLoading] = useState(false)

  const generate = async () => {
    if (!studentId || !examDate) return
    setLoading(true)
    await new Promise(r => setTimeout(r, 2500))
    const student = DEMO_STUDENTS.find(s => s.id === studentId)
    setPlan(`Study Plan for ${student?.full_name ?? 'Student'}\nExam Date: ${examDate}\n\nWeek 1: Focus on Mechanics & Organic Chemistry foundations. Complete NCERT reading.\nWeek 2: Practice numerical problems. Take a mock test.\nWeek 3: Revision of weak areas. Solve previous year papers.\nWeek 4: Final revision. Take 2 full-length mocks.`)
    setLoading(false)
  }

  return (
    <div className="space-y-6 p-6">
      <PageHeader title="AI Study Plans" description="Generate personalized study plans" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-sm">Plan Parameters</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><Label>Student</Label><Select value={studentId} onValueChange={v => v && setStudentId(v)}><SelectTrigger><SelectValue placeholder="Select student" /></SelectTrigger><SelectContent>{DEMO_STUDENTS.map(s => <SelectItem key={s.id} value={s.id}>{s.full_name}</SelectItem>)}</SelectContent></Select></div>
            <div><Label>Exam Date</Label><Input type="date" value={examDate} onChange={e => setExamDate(e.target.value)} /></div>
            <Button onClick={generate} disabled={loading || !studentId || !examDate} className="w-full"><Sparkles size={14} className="mr-2" />{loading ? 'Generating...' : 'Generate Plan'}</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm flex items-center gap-2"><BookOpen size={14} /> Study Plan</CardTitle></CardHeader>
          <CardContent>
            {plan ? <pre className="text-sm whitespace-pre-wrap font-sans">{plan}</pre> : <p className="text-sm text-muted-foreground">Set parameters and generate a plan.</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
