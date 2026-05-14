'use client'

import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { BookOpen } from 'lucide-react'
import { DEMO_COURSES } from '@/lib/demo/data'

const PROGRAMS = DEMO_COURSES.map(c => ({
  ...c,
  students: Math.floor(Math.random() * 40) + 10,
  progress: Math.floor(Math.random() * 60) + 30,
}))

export default function ProgramsPage() {
  return (
    <div className="space-y-6 p-6">
      <PageHeader title="Programs" description="Courses and academic programs" />
      <div className="grid grid-cols-1 gap-3">
        {PROGRAMS.map(p => (
          <Card key={p.id}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <BookOpen size={20} className="text-primary shrink-0" />
                <div className="flex-1">
                  <p className="font-medium">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.students} students · {p.subjects?.length ?? 0} subjects</p>
                  <div className="flex items-center gap-3 mt-2">
                    <Progress value={p.progress} className="flex-1 h-1.5" />
                    <span className="text-xs text-muted-foreground">{p.progress}%</span>
                  </div>
                </div>
                <Badge variant="outline">{p.duration_months ?? 12}m</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
