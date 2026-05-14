'use client'

import { useState, useEffect } from 'react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { AlertTriangle, TrendingDown } from 'lucide-react'
import { RISK_ATTENDANCE_THRESHOLD, RISK_SCORE_THRESHOLD } from '@/lib/constants'

interface AtRiskStudent {
  student_id: string; full_name: string; enrollment_no: string
  attendance_pct: number; avg_score_pct: number; batch_name: string
}

export default function PredictionsPage() {
  const [students, setStudents] = useState<AtRiskStudent[]>([])

  useEffect(() => {
    import('@/lib/demo/client').then(({ createDemoClient }) => {
      (createDemoClient().rpc('get_at_risk_students') as Promise<{ data: AtRiskStudent[] | null }>)
        .then(r => setStudents(r.data ?? []))
    })
  }, [])

  return (
    <div className="space-y-6 p-6">
      <PageHeader title="At-Risk Predictions" description={`Students flagged by attendance or score thresholds`} />
      {students.length === 0 ? (
        <Card><CardContent className="py-12 text-center"><p className="text-muted-foreground">No at-risk students detected.</p></CardContent></Card>
      ) : (
        <div className="space-y-3">
          {students.map(s => (
            <Card key={s.student_id}>
              <CardContent className="py-3 px-4 flex items-center gap-4">
                <AlertTriangle size={14} className="text-red-600 shrink-0" />
                <div className="flex-1 min-w-0">
                  <Link href={`/students/${s.student_id}`} className="font-medium hover:underline">{s.full_name}</Link>
                  <p className="text-xs text-muted-foreground">{s.batch_name}</p>
                </div>
                <div className="flex gap-2">
                  {s.attendance_pct < RISK_ATTENDANCE_THRESHOLD && <Badge variant="destructive"><TrendingDown size={10} className="mr-1" />{Math.round(s.attendance_pct)}%</Badge>}
                  {s.avg_score_pct < RISK_SCORE_THRESHOLD && <Badge variant="destructive">Score: {Math.round(s.avg_score_pct)}%</Badge>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
