'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Phone, Mail, Award } from 'lucide-react'
import { DEMO_STUDENTS, DEMO_BATCHES, DEMO_COURSES, DEMO_FEE_RECORDS, DEMO_TEST_SCORES, DEMO_TESTS } from '@/lib/demo/data'

export default function StudentProfilePage() {
  const params = useParams()
  const student = DEMO_STUDENTS.find(s => s.id === params.id)
  if (!student) return <div className="p-6 text-muted-foreground">Student not found</div>

  const batch = DEMO_BATCHES.find(b => b.id === student.batch_id)
  const course = DEMO_COURSES.find(c => c.id === student.course_id)
  const fees = DEMO_FEE_RECORDS.filter(f => f.student_id === student.id)
  const totalPaid = fees.reduce((a, f) => a + f.amount_paid, 0)
  const totalDue = fees.reduce((a, f) => a + f.total_amount, 0)
  const scores = DEMO_TEST_SCORES.filter(s => s.student_id === student.id)

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <Link href="/students"><Button variant="ghost" size="icon"><ArrowLeft size={16} /></Button></Link>
        <PageHeader title={student.full_name} description={`${student.enrollment_no} · ${batch?.name ?? '—'}`} />
        <Badge variant={student.status === 'active' ? 'default' : 'secondary'}>{student.status}</Badge>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-4">
          <Card><CardHeader><CardTitle className="text-sm">Contact</CardTitle></CardHeader><CardContent className="space-y-2 text-sm">
            <p className="flex items-center gap-2"><Phone size={14} />{student.phone}</p>
            <p className="flex items-center gap-2"><Mail size={14} />student@example.com</p>
            <p className="text-muted-foreground">Parent: {student.parent_phone}</p>
          </CardContent></Card>
          <Card><CardHeader><CardTitle className="text-sm">Enrollment</CardTitle></CardHeader><CardContent className="space-y-1 text-sm">
            <p>Batch: {batch?.name ?? '—'}</p>
            <p>Course: {course?.name ?? '—'}</p>
            <p>Gender: {student.gender}</p>
            <p>Enrolled: {student.created_at?.slice(0, 10) ?? '—'}</p>
          </CardContent></Card>
        </div>
        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <Card><CardContent className="p-3 text-center"><p className="text-lg font-bold text-green-600">₹{(totalPaid / 1000).toFixed(1)}k</p><p className="text-xs text-muted-foreground">Paid</p></CardContent></Card>
            <Card><CardContent className="p-3 text-center"><p className="text-lg font-bold text-orange-600">₹{((totalDue - totalPaid) / 1000).toFixed(1)}k</p><p className="text-xs text-muted-foreground">Due</p></CardContent></Card>
            <Card><CardContent className="p-3 text-center"><p className="text-lg font-bold">{scores.length}</p><p className="text-xs text-muted-foreground">Tests</p></CardContent></Card>
          </div>
          <Card><CardHeader><CardTitle className="text-sm flex items-center gap-2"><Award size={14} /> Recent Tests</CardTitle></CardHeader><CardContent>
            {scores.length === 0 ? <p className="text-sm text-muted-foreground">No test scores recorded.</p> : (
              <div className="divide-y text-sm">
                {scores.slice(0, 5).map(s => {
                  const test = DEMO_TESTS.find(t => t.id === s.test_id)
                  const pct = s.max_marks > 0 ? Math.round((s.marks_obtained / s.max_marks) * 100) : 0
                  return <div key={`${s.test_id}-${s.student_id}`} className="py-2 flex justify-between"><span>{test?.name ?? 'Test'}</span><span className={pct >= 60 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>{s.marks_obtained}/{s.max_marks} ({pct}%)</span></div>
                })}
              </div>
            )}
          </CardContent></Card>
        </div>
      </div>
    </div>
  )
}
