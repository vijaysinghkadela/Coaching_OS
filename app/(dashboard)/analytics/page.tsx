import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  DEMO_STUDENTS, DEMO_BATCHES, DEMO_FEE_RECORDS,
  DEMO_ATTENDANCE_RECORDS, DEMO_TEST_SCORES, DEMO_MONTHLY_REVENUE,
} from '@/lib/demo/data'
import { TrendingUp, TrendingDown, Users, IndianRupee, CalendarCheck, Award } from 'lucide-react'
import { AnalyticsCharts } from './AnalyticsCharts'

function pct(n: number, d: number) { return d ? Math.round((n / d) * 100) : 0 }

export default async function AnalyticsPage() {
  const totalStudents = DEMO_STUDENTS.length
  const activeStudents = DEMO_STUDENTS.filter(s => s.status === 'active').length

  const totalFees = DEMO_FEE_RECORDS.reduce((a, r) => a + r.total_amount, 0)
  const collectedFees = DEMO_FEE_RECORDS.reduce((a, r) => a + r.amount_paid, 0)
  const collectionRate = pct(collectedFees, totalFees)

  const totalPresent = DEMO_ATTENDANCE_RECORDS.filter(r => r.status === 'present').length
  const totalRecords = DEMO_ATTENDANCE_RECORDS.length
  const attendancePct = pct(totalPresent, totalRecords)

   const totalRevenue = DEMO_MONTHLY_REVENUE.reduce((a, r) => a + (r.amount ?? 0), 0)


  const batchStats = DEMO_BATCHES.map(b => {
    const students = DEMO_STUDENTS.filter(s => s.batch_id === b.id)
    const scores = DEMO_TEST_SCORES.filter(s => students.some(st => st.id === s.student_id))
    const avgScore = scores.length ? Math.round(scores.reduce((a, s) => a + (s.marks_obtained / s.max_marks) * 100, 0) / scores.length) : 0
    const present = DEMO_ATTENDANCE_RECORDS.filter(r => students.some(s => s.id === r.student_id) && r.status === 'present').length
    const total = DEMO_ATTENDANCE_RECORDS.filter(r => students.some(s => s.id === r.student_id)).length
    return { name: b.name, students: students.length, avgScore, attendance: pct(present, total) }
  })

  const topStudents = DEMO_STUDENTS.slice(0, 5).map(s => {
    const scores = DEMO_TEST_SCORES.filter(sc => sc.student_id === s.id)
    const avg = scores.length ? Math.round(scores.reduce((a, sc) => a + (sc.marks_obtained / sc.max_marks) * 100, 0) / scores.length) : 0
    return { name: s.full_name, batch: s.batches?.name ?? '—', avg }
  }).sort((a, b) => b.avg - a.avg)

  return (
    <div className="space-y-6">
      <PageHeader title="Analytics" description="Performance, attendance, and revenue insights" />

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Total Students" value={String(totalStudents)} sub={`${activeStudents} active`} icon={<Users size={16} />} trend="up" />
        <MetricCard label="Fee Collection" value={`${collectionRate}%`} sub={`₹${(collectedFees / 1000).toFixed(0)}k collected`} icon={<IndianRupee size={16} />} trend={collectionRate >= 80 ? 'up' : 'down'} />
        <MetricCard label="Avg Attendance" value={`${attendancePct}%`} sub="across all batches" icon={<CalendarCheck size={16} />} trend={attendancePct >= 75 ? 'up' : 'down'} />
        <MetricCard label="Annual Revenue" value={`₹${(totalRevenue / 100000).toFixed(1)}L`} sub="this academic year" icon={<IndianRupee size={16} />} trend="up" />
      </div>

      {/* Charts */}
      <AnalyticsCharts monthlyRevenue={DEMO_MONTHLY_REVENUE} />

      {/* Batch performance table */}
      <Card>
        <CardHeader><CardTitle className="text-sm">Batch Performance Overview</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-muted-foreground">
                  <th className="text-left pb-2 font-medium">Batch</th>
                  <th className="text-center pb-2 font-medium">Students</th>
                  <th className="text-center pb-2 font-medium">Avg Score</th>
                  <th className="text-center pb-2 font-medium">Attendance</th>
                  <th className="text-center pb-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {batchStats.map(b => (
                  <tr key={b.name}>
                    <td className="py-2 font-medium">{b.name}</td>
                    <td className="py-2 text-center">{b.students}</td>
                    <td className="py-2 text-center">{b.avgScore}%</td>
                    <td className="py-2 text-center">{b.attendance}%</td>
                    <td className="py-2 text-center">
                      <Badge variant={b.attendance >= 75 ? 'default' : 'destructive'} className="text-xs">
                        {b.attendance >= 75 ? 'On Track' : 'Needs Attention'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Top performers */}
      <Card>
        <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Award size={15} /> Top Performers</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {topStudents.map((s, i) => (
              <div key={s.name} className="flex items-center gap-3 py-1">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-yellow-100 text-yellow-700' : i === 1 ? 'bg-gray-100 text-gray-600' : i === 2 ? 'bg-orange-100 text-orange-600' : 'bg-muted text-muted-foreground'}`}>
                  {i + 1}
                </span>
                <div className="flex-1">
                  <p className="text-sm font-medium">{s.name}</p>
                  <p className="text-xs text-muted-foreground">{s.batch}</p>
                </div>
                <span className="text-sm font-semibold">{s.avg}%</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function MetricCard({ label, value, sub, icon, trend }: { label: string; value: string; sub: string; icon: React.ReactNode; trend: 'up' | 'down' }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-muted-foreground">{icon}</span>
          {trend === 'up' ? <TrendingUp size={14} className="text-green-500" /> : <TrendingDown size={14} className="text-red-500" />}
        </div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-xs text-muted-foreground mt-1">{label}</p>
        <p className="text-xs text-muted-foreground">{sub}</p>
      </CardContent>
    </Card>
  )
}
