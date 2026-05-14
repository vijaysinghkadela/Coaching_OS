'use client'

import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar } from 'lucide-react'
import { DEMO_BATCHES } from '@/lib/demo/data'

const EVENTS = [
  { id: 'e1', title: 'Physics Unit Test 2', date: '2026-05-20', batch: DEMO_BATCHES[0]?.name, type: 'test' },
  { id: 'e2', title: 'Chemistry Revision Class', date: '2026-05-22', batch: DEMO_BATCHES[1]?.name, type: 'class' },
  { id: 'e3', title: 'Parent-Teacher Meeting', date: '2026-05-25', batch: 'All Batches', type: 'meeting' },
  { id: 'e4', title: 'JEE Full Syllabus Mock', date: '2026-05-28', batch: DEMO_BATCHES[0]?.name, type: 'test' },
  { id: 'e5', title: 'Fee Deadline Reminder', date: '2026-05-30', batch: 'All Batches', type: 'admin' },
  { id: 'e6', title: 'NEET Biology Crash Course', date: '2026-06-01', batch: DEMO_BATCHES[1]?.name, type: 'class' },
]

export default function SchedulePage() {
  return (
    <div className="space-y-6 p-6">
      <PageHeader title="Schedule" description="Upcoming events and classes" />
      <div className="grid grid-cols-1 gap-3">
        {EVENTS.map(e => (
          <Card key={e.id}>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Calendar size={20} className="text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium">{e.title}</p>
                <p className="text-xs text-muted-foreground">{e.batch} · {e.date}</p>
              </div>
              <Badge variant={e.type === 'test' ? 'default' : e.type === 'class' ? 'secondary' : 'outline'} className="text-xs">{e.type}</Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
