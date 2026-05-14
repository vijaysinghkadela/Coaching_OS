'use client'

import { useState } from 'react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Sparkles, FileText } from 'lucide-react'
import { DEMO_STUDENTS } from '@/lib/demo/data'

export default function AIReportsPage() {
  const [studentId, setStudentId] = useState('')
  const [report, setReport] = useState('')
  const [loading, setLoading] = useState(false)
  const student = DEMO_STUDENTS.find(s => s.id === studentId)

  const generate = async () => {
    if (!studentId) return
    setLoading(true)
    await new Promise(r => setTimeout(r, 2000))
    setReport(`${student?.full_name} has shown consistent progress this term. Attendance is strong at 91%. Key areas for improvement include Chemistry. Continue with regular practice and revision.`)
    setLoading(false)
  }

  return (
    <div className="space-y-6 p-6">
      <PageHeader title="AI Reports" description="Generate parent progress reports using AI" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-sm">Generate Report</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><Label>Student</Label><Select value={studentId} onValueChange={v => v && setStudentId(v)}><SelectTrigger><SelectValue placeholder="Select student" /></SelectTrigger><SelectContent>{DEMO_STUDENTS.map(s => <SelectItem key={s.id} value={s.id}>{s.full_name}</SelectItem>)}</SelectContent></Select></div>
            <Button onClick={generate} disabled={loading || !studentId} className="w-full"><Sparkles size={14} className="mr-2" />{loading ? 'Generating...' : 'Generate Report'}</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm flex items-center gap-2"><FileText size={14} /> Report</CardTitle></CardHeader>
          <CardContent>
            {report ? <p className="text-sm leading-relaxed">{report}</p> : <p className="text-sm text-muted-foreground">Select a student and generate a report.</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
