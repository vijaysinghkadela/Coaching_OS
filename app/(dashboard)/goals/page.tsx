import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Target, Plus, CheckCircle2, Clock, TrendingUp, Star } from 'lucide-react'
import Link from 'next/link'
import { DEMO_STUDENTS } from '@/lib/demo/data'

const DEMO_GOALS = [
  { id: 'goal-001', student_id: 'stu-001', student: 'Arjun Mehta', title: 'Score 150+ in JEE Mains Physics', category: 'academic', target: 150, current: 127, unit: 'marks', due_date: '2026-01-15', status: 'in_progress', priority: 'high' },
  { id: 'goal-002', student_id: 'stu-002', student: 'Priya Sharma', title: 'Complete 500 JEE practice problems', category: 'practice', target: 500, current: 342, unit: 'problems', due_date: '2025-12-31', status: 'in_progress', priority: 'medium' },
  { id: 'goal-003', student_id: 'stu-006', student: 'Ananya Singh', title: 'Achieve 90%+ in Biology chapter tests', category: 'academic', target: 90, current: 86, unit: '%', due_date: '2025-11-30', status: 'in_progress', priority: 'high' },
  { id: 'goal-004', student_id: 'stu-003', student: 'Rohit Agarwal', title: 'Maintain 85%+ attendance this semester', category: 'attendance', target: 85, current: 72, unit: '%', due_date: '2025-12-31', status: 'at_risk', priority: 'high' },
  { id: 'goal-005', student_id: 'stu-010', student: 'Divya Joshi', title: 'Score 95% in 10th Maths board', category: 'academic', target: 95, current: 95, unit: '%', due_date: '2025-03-15', status: 'achieved', priority: 'high' },
  { id: 'goal-006', student_id: 'stu-007', student: 'Vikram Rao', title: 'Complete NCERT Biology revision twice', category: 'revision', target: 2, current: 1, unit: 'rounds', due_date: '2025-12-15', status: 'in_progress', priority: 'medium' },
  { id: 'goal-007', student_id: 'stu-004', student: 'Sneha Gupta', title: 'Master Organic Chemistry reactions', category: 'academic', target: 120, current: 97, unit: 'reactions', due_date: '2026-01-01', status: 'in_progress', priority: 'medium' },
  { id: 'goal-008', student_id: 'stu-011', student: 'Amit Saini', title: 'Score 90+ in all 5 subjects', category: 'academic', target: 90, current: 78, unit: '%', due_date: '2025-03-20', status: 'in_progress', priority: 'high' },
]

const HABITS = [
  { id: 'h-001', student: 'Arjun Mehta', habit: 'Daily 2-hour Physics practice', streak: 18, target: 30, status: 'active' },
  { id: 'h-002', student: 'Priya Sharma', habit: 'Morning revision (6–7 AM)', streak: 24, target: 30, status: 'active' },
  { id: 'h-003', student: 'Ananya Singh', habit: 'Weekly mock test on Sundays', streak: 8, target: 12, status: 'active' },
  { id: 'h-004', student: 'Divya Joshi', habit: 'Reading comprehension daily', streak: 30, target: 30, status: 'completed' },
]

const statusColors: Record<string, string> = {
  in_progress: 'bg-blue-100 text-blue-700',
  at_risk: 'bg-red-100 text-red-700',
  achieved: 'bg-green-100 text-green-700',
  paused: 'bg-gray-100 text-gray-600',
}

export default async function GoalsPage() {
  const achieved = DEMO_GOALS.filter(g => g.status === 'achieved').length
  const atRisk = DEMO_GOALS.filter(g => g.status === 'at_risk').length
  const inProgress = DEMO_GOALS.filter(g => g.status === 'in_progress').length

  return (
    <div className="space-y-6">
      <PageHeader
        title="Goals & Progress Tracking"
        description="SMART goals, habit trackers, and milestone management"
        action={<Button size="sm"><Plus size={14} className="mr-1" /> Add Goal</Button>}
      />

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <SummaryCard label="Total Goals" value={DEMO_GOALS.length} color="text-foreground" icon={<Target size={15} />} />
        <SummaryCard label="In Progress" value={inProgress} color="text-blue-600" icon={<TrendingUp size={15} />} />
        <SummaryCard label="At Risk" value={atRisk} color="text-red-600" icon={<Clock size={15} />} />
        <SummaryCard label="Achieved" value={achieved} color="text-green-600" icon={<CheckCircle2 size={15} />} />
      </div>

      {/* Goals list */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Active Goals</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {DEMO_GOALS.map(goal => {
            const progressPct = Math.min(100, Math.round((goal.current / goal.target) * 100))
            return (
              <div key={goal.id} className="border rounded-lg p-3 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{goal.title}</p>
                    <p className="text-xs text-muted-foreground">{goal.student} · Due {goal.due_date}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {goal.priority === 'high' && <Star size={12} className="text-yellow-500 fill-yellow-400" />}
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[goal.status]}`}>
                      {goal.status === 'in_progress' ? 'In Progress' : goal.status === 'at_risk' ? 'At Risk' : goal.status === 'achieved' ? 'Achieved ✓' : 'Paused'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Progress value={progressPct} className="flex-1 h-2" />
                  <span className="text-xs font-medium shrink-0">{goal.current}/{goal.target} {goal.unit} ({progressPct}%)</span>
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* Habit tracker */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Habit Tracker</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {HABITS.map(h => {
            const pct = Math.min(100, Math.round((h.streak / h.target) * 100))
            return (
              <div key={h.id} className="flex items-center gap-3">
                <div className="flex-1">
                  <p className="text-sm font-medium">{h.habit}</p>
                  <p className="text-xs text-muted-foreground">{h.student}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold">{h.streak}<span className="text-xs font-normal text-muted-foreground">/{h.target} days</span></p>
                  {h.status === 'completed' && <span className="text-xs text-green-600 font-medium">Goal hit!</span>}
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>
    </div>
  )
}

function SummaryCard({ label, value, color, icon }: { label: string; value: number; color: string; icon: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="p-3 flex items-center gap-2">
        <span className={`${color}`}>{icon}</span>
        <div>
          <p className={`text-xl font-bold ${color}`}>{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  )
}
