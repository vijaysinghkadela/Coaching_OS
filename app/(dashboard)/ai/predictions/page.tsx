import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { AlertTriangle, TrendingDown } from 'lucide-react'
import { RISK_ATTENDANCE_THRESHOLD, RISK_SCORE_THRESHOLD } from '@/lib/constants'

export default async function PredictionsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: institute } = await supabase.from('institutes').select('id').eq('owner_id', user.id).single()
  if (!institute) redirect('/signup')

  // Get at-risk students via attendance summary view
  const { data: atRisk } = await supabase.rpc('get_at_risk_students', { p_institute_id: institute.id })

  return (
    <div className="space-y-6">
      <PageHeader title="At-Risk Predictions" description={`Students with attendance < ${RISK_ATTENDANCE_THRESHOLD}% or avg score < ${RISK_SCORE_THRESHOLD}%`} />
      <AtRiskList students={atRisk ?? []} />
    </div>
  )
}

interface AtRiskStudent {
  student_id: string
  full_name: string
  enrollment_no: string
  attendance_pct: number
  avg_score_pct: number
  batch_name: string
}

function AtRiskList({ students }: { students: AtRiskStudent[] }) {
  if (students.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">No at-risk students detected. Great work!</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">{students.length} students flagged as at-risk</p>
      {students.map((s) => {
        const lowAtt = s.attendance_pct < RISK_ATTENDANCE_THRESHOLD
        const lowScore = s.avg_score_pct < RISK_SCORE_THRESHOLD
        return (
          <Card key={s.student_id}>
            <CardContent className="py-3 px-4 flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
                <AlertTriangle size={14} className="text-red-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Link href={`/students/${s.student_id}`} className="font-medium hover:underline">{s.full_name}</Link>
                  <span className="text-xs text-muted-foreground font-mono">{s.enrollment_no}</span>
                </div>
                <p className="text-xs text-muted-foreground">{s.batch_name}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                {lowAtt && (
                  <Badge variant="destructive" className="text-xs">
                    <TrendingDown size={10} className="mr-1" />Att: {Math.round(s.attendance_pct)}%
                  </Badge>
                )}
                {lowScore && (
                  <Badge variant="destructive" className="text-xs">
                    Score: {Math.round(s.avg_score_pct)}%
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
