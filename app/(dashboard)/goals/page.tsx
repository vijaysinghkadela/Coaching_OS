'use client'

import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'


const GOALS = [
  { id: 'g1', student: 'Arjun Mehta', goal: 'Complete JEE Mains syllabus', target: '2026-08-15', progress: 72, status: 'on_track' },
  { id: 'g2', student: 'Priya Sharma', goal: 'Improve Chemistry score to 80%', target: '2026-07-01', progress: 55, status: 'behind' },
  { id: 'g3', student: 'Rahul Verma', goal: 'Score 250+ in JEE Half Yearly', target: '2026-06-20', progress: 88, status: 'on_track' },
  { id: 'g4', student: 'Sneha Gupta', goal: 'Improve attendance to 90%', target: '2026-06-01', progress: 42, status: 'at_risk' },
  { id: 'g5', student: 'Ananya Singh', goal: 'Complete 50 practice sets', target: '2026-09-01', progress: 34, status: 'behind' },
]

export default function GoalsPage() {
  return (
    <div className="space-y-6 p-6">
      <PageHeader title="Goals & Progress" description="Track student academic goals" />
      <div className="grid grid-cols-1 gap-3">
        {GOALS.map(g => (
          <Card key={g.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div><p className="font-medium">{g.goal}</p><p className="text-xs text-muted-foreground">{g.student} · Due {g.target}</p></div>
                <Badge variant={g.status === 'on_track' ? 'default' : g.status === 'behind' ? 'secondary' : 'destructive'} className="text-xs">{g.status.replace('_', ' ')}</Badge>
              </div>
              <div className="flex items-center gap-3">
                <Progress value={g.progress} className="flex-1 h-2" />
                <span className="text-sm font-medium text-muted-foreground">{g.progress}%</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
