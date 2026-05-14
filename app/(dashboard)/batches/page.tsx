'use client'

import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Plus, Users, BookOpen } from 'lucide-react'
import Link from 'next/link'
import { DEMO_BATCHES, DEMO_STUDENTS, DEMO_COURSES } from '@/lib/demo/data'

export default function BatchesPage() {
  return (
    <div className="space-y-6 p-6">
      <PageHeader title="Batches" description="Manage your institute batches"
        action={<Link href="/batches/new"><Button size="sm"><Plus size={14} className="mr-1" />New Batch</Button></Link>}
      />
      <div className="grid grid-cols-2 gap-3">
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold">{DEMO_BATCHES.length}</p><p className="text-xs text-muted-foreground mt-1">Total Batches</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-emerald-600">{DEMO_BATCHES.filter(b => b.status === 'active').length}</p><p className="text-xs text-muted-foreground mt-1">Active</p></CardContent></Card>
      </div>
      <div className="grid grid-cols-1 gap-3">
        {DEMO_BATCHES.map(b => {
          const students = DEMO_STUDENTS.filter(s => s.batch_id === b.id)
          const course = DEMO_COURSES.find(c => c.id === b.course_id)
          return (
            <Link key={b.id} href={`/batches/${b.id}`}>
              <Card className="hover:bg-accent/30 transition-all duration-150 cursor-pointer group">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-150">
                    <BookOpen size={20} className="text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground">{b.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{course?.name ?? '—'} · {b.academic_year} · Capacity: {b.capacity}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1.5 text-sm text-muted-foreground bg-muted/50 px-2.5 py-1 rounded-full">
                      <Users size={14} /> {students.length}
                    </span>
                    <Badge variant={b.status === 'active' ? 'default' : 'secondary'} className="text-xs cursor-default">{b.status === 'active' ? 'Active' : b.status}</Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
