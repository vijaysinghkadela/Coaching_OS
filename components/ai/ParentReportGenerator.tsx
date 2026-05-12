'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { Sparkles, Copy } from 'lucide-react'

interface Student { id: string; full_name: string; enrollment_no: string; batches: { name: string } | null }

interface ParentReportGeneratorProps {
  students: Student[]
}

export function ParentReportGenerator({ students }: ParentReportGeneratorProps) {
  const [studentId, setStudentId] = useState('')
  const [report, setReport] = useState('')
  const [loading, setLoading] = useState(false)

  const handleGenerate = async () => {
    if (!studentId) { toast.error('Select a student'); return }
    setLoading(true)
    setReport('')
    try {
      const res = await fetch('/api/ai/parent-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Generation failed')
      setReport(data.report)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to generate report')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(report)
    toast.success('Copied to clipboard!')
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Select Student</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Student</Label>
            <Select value={studentId} onValueChange={(v) => setStudentId(v ?? '')}>
              <SelectTrigger><SelectValue placeholder="Choose a student" /></SelectTrigger>
              <SelectContent>
                {students.map((s) => {
                  const batch = s.batches as { name: string } | null
                  return (
                    <SelectItem key={s.id} value={s.id}>
                      {s.full_name} {batch ? `(${batch.name})` : ''}
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>
          <p className="text-xs text-muted-foreground">
            Claude AI will analyze attendance, test scores, and fee patterns to generate a personalized narrative report for parents.
          </p>
          <Button className="w-full" onClick={handleGenerate} disabled={loading || !studentId}>
            <Sparkles size={14} className="mr-2" />
            {loading ? 'Generating with Claude…' : 'Generate Report'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-sm">Generated Report</CardTitle>
          {report && (
            <Button variant="ghost" size="icon" onClick={copyToClipboard}>
              <Copy size={14} />
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="animate-pulse space-y-2">
              {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-3 bg-muted rounded w-full" style={{ width: `${80 + (i % 3) * 10}%` }} />)}
            </div>
          ) : report ? (
            <Textarea value={report} readOnly rows={12} className="text-sm resize-none" />
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Sparkles size={32} className="text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">Select a student and click Generate to create a personalized parent report.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
