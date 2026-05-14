'use client'

import { useState } from 'react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Check, X, Clock } from 'lucide-react'
import { DEMO_BATCHES, DEMO_STUDENTS } from '@/lib/demo/data'

type Status = 'present' | 'absent' | 'late'

export default function MarkAttendancePage() {
  const [batchId, setBatchId] = useState(DEMO_BATCHES[0]?.id ?? '')
  const [records, setRecords] = useState<Record<string, Status>>({})

  const students = DEMO_STUDENTS.filter(s => s.batch_id === batchId && s.status === 'active')

  const setStatus = (id: string, status: Status) => setRecords({ ...records, [id]: status })

  const markAll = (status: Status) => {
    const r: Record<string, Status> = {}
    students.forEach(s => { r[s.id] = status })
    setRecords(r)
  }

  const handleSubmit = () => {
    const present = Object.values(records).filter(s => s === 'present' || s === 'late').length
    alert(`Attendance saved: ${present}/${students.length} present`)
  }

  return (
    <div className="space-y-6 p-6">
      <PageHeader title="Mark Attendance" description="Select batch and mark attendance" />
      <div className="flex items-center gap-3">
        <Select value={batchId} onValueChange={v => v && setBatchId(v)}>
          <SelectTrigger className="w-64"><SelectValue /></SelectTrigger>
          <SelectContent>{DEMO_BATCHES.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent>
        </Select>
        <Button variant="outline" size="sm" onClick={() => markAll('present')}>All Present</Button>
        <Button variant="outline" size="sm" onClick={() => markAll('absent')}>All Absent</Button>
      </div>
      <Card>
        <CardHeader><CardTitle className="text-sm">{students.length} Students</CardTitle></CardHeader>
        <CardContent>
          <div className="divide-y text-sm">
            {students.map(s => {
              const status = records[s.id]
              return (
                <div key={s.id} className="py-2 flex items-center justify-between">
                  <span className="font-medium">{s.full_name} <span className="text-muted-foreground font-normal">({s.enrollment_no})</span></span>
                  <div className="flex gap-1">
                    <Button size="sm" variant={status === 'present' ? 'default' : 'outline'} className="h-7 w-7 p-0" onClick={() => setStatus(s.id, 'present')}><Check size={14} /></Button>
                    <Button size="sm" variant={status === 'absent' ? 'destructive' : 'outline'} className="h-7 w-7 p-0" onClick={() => setStatus(s.id, 'absent')}><X size={14} /></Button>
                    <Button size="sm" variant={status === 'late' ? 'secondary' : 'outline'} className="h-7 w-7 p-0" onClick={() => setStatus(s.id, 'late')}><Clock size={14} /></Button>
                  </div>
                </div>
              )
            })}
          </div>
          <Button className="mt-4 w-full" onClick={handleSubmit}>Save Attendance</Button>
        </CardContent>
      </Card>
    </div>
  )
}
