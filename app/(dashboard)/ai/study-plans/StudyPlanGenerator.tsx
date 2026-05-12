'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { Sparkles, Copy, Calendar } from 'lucide-react'

interface Student {
  id: string
  full_name: string
  enrollment_no: string
  batches: { name: string } | null
  courses: { name: string } | null
}

interface StudyPlanGeneratorProps {
  students: Student[]
}

export function StudyPlanGenerator({ students }: StudyPlanGeneratorProps) {
  const [studentId, setStudentId] = useState('')
  const [examDate, setExamDate] = useState('')
  const [focusAreas, setFocusAreas] = useState('')
  const [plan, setPlan] = useState('')
  const [loading, setLoading] = useState(false)

  const handleGenerate = async () => {
    if (!studentId) { toast.error('Select a student'); return }
    if (!examDate) { toast.error('Enter exam date'); return }
    setLoading(true)
    setPlan('')
    try {
      const res = await fetch('/api/ai/study-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, examDate, focusAreas }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Generation failed')
      setPlan(data.plan)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to generate study plan')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(plan)
    toast.success('Copied to clipboard!')
  }

  const selected = students.find((s) => s.id === studentId)

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Configure Study Plan</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Student</Label>
            <Select value={studentId} onValueChange={(v) => setStudentId(v ?? '')}>
              <SelectTrigger><SelectValue placeholder="Choose a student" /></SelectTrigger>
              <SelectContent>
                {students.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.full_name} ({s.enrollment_no})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selected && (
            <div className="rounded-lg bg-muted/50 p-3 text-sm space-y-1">
              <p><span className="text-muted-foreground">Course:</span> {selected.courses?.name ?? '—'}</p>
              <p><span className="text-muted-foreground">Batch:</span> {selected.batches?.name ?? '—'}</p>
            </div>
          )}

          <div className="space-y-1.5">
            <Label>Exam / Target Date *</Label>
            <Input
              type="date"
              value={examDate}
              onChange={(e) => setExamDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Focus Areas (optional)</Label>
            <Textarea
              value={focusAreas}
              onChange={(e) => setFocusAreas(e.target.value)}
              rows={2}
              placeholder="e.g. Weak in Organic Chemistry, strong in Maths"
            />
          </div>

              <p className="text-xs text-muted-foreground">
                Claude AI will analyze the student&apos;s test history and generate a week-by-week study schedule up to the exam date.
              </p>


          <Button className="w-full" onClick={handleGenerate} disabled={loading || !studentId || !examDate}>
            <Sparkles size={14} className="mr-2" />
            {loading ? 'Generating with Claude…' : 'Generate Study Plan'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-sm">Generated Plan</CardTitle>
          {plan && (
            <Button variant="ghost" size="icon" onClick={copyToClipboard}>
              <Copy size={14} />
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="animate-pulse space-y-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-3 bg-muted rounded" style={{ width: `${70 + (i % 4) * 8}%` }} />
              ))}
            </div>
          ) : plan ? (
            <Textarea value={plan} readOnly rows={16} className="text-sm resize-none font-mono text-xs" />
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Calendar size={32} className="text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">Select a student, set the exam date, and click Generate to create a personalized study plan</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
