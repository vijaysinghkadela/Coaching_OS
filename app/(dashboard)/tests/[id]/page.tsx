'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { DEMO_TESTS, DEMO_BATCHES, DEMO_STUDENTS, DEMO_TEST_SCORES } from '@/lib/demo/data'

export default function TestDetailPage() {
  const params = useParams()
  const test = DEMO_TESTS.find(t => t.id === params.id)
  if (!test) return <div className="p-6 text-muted-foreground">Test not found</div>
  const batch = DEMO_BATCHES.find(b => b.id === test.batch_id)
  const scores = DEMO_TEST_SCORES.filter(s => s.test_id === test.id).sort((a, b) => b.marks_obtained - a.marks_obtained)
  const avg = scores.length ? Math.round(scores.reduce((a, s) => a + (s.marks_obtained / s.max_marks) * 100, 0) / scores.length) : 0

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <Link href="/tests"><Button variant="ghost" size="icon"><ArrowLeft size={16} /></Button></Link>
        <PageHeader title={test.name} description={`${batch?.name ?? '—'} · ${test.test_date}`} />
        <Badge variant="outline">{test.test_type}</Badge>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <Card><CardContent className="p-3 text-center"><p className="text-lg font-bold">{scores.length}</p><p className="text-xs text-muted-foreground">Students</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-lg font-bold text-green-600">{avg}%</p><p className="text-xs text-muted-foreground">Average</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-lg font-bold">{test.max_marks}</p><p className="text-xs text-muted-foreground">Max Marks</p></CardContent></Card>
      </div>
      <Card>
        <CardHeader><CardTitle className="text-sm">Scorecard</CardTitle></CardHeader>
        <CardContent>
          {scores.length === 0 ? <p className="text-sm text-muted-foreground">No scores entered yet.</p> : (
            <div className="divide-y text-sm">
              {scores.map((s, i) => {
                const student = DEMO_STUDENTS.find(st => st.id === s.student_id)
                const pct = Math.round((s.marks_obtained / s.max_marks) * 100)
                return (
                  <div key={`${s.test_id}-${s.student_id}`} className="py-2 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="w-5 text-center text-muted-foreground text-xs">#{i + 1}</span>
                      <span className="font-medium">{student?.full_name ?? '—'}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={pct >= 60 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>{s.marks_obtained}/{s.max_marks}</span>
                      <span className="text-muted-foreground text-xs">({pct}%)</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
