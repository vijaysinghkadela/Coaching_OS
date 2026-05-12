import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { BookMarked, Plus, CheckCircle2, Circle, Clock } from 'lucide-react'

const PROGRAMS = [
  {
    id: 'prog-001',
    name: 'JEE Mains 2026 — Complete Prep',
    course: 'JEE Mains + Advanced',
    students: 6,
    status: 'active',
    start_date: '2024-06-10',
    end_date: '2026-01-15',
    progress: 62,
    milestones: [
      { title: 'Phase 1: Foundation (Class 11 syllabus)', done: true, due: '2024-09-30' },
      { title: 'Phase 2: Advanced Topics (Class 12)', done: true, due: '2025-01-31' },
      { title: 'Phase 3: Revision + Mock Tests', done: false, due: '2025-09-30' },
      { title: 'Phase 4: Final Preparation', done: false, due: '2025-12-31' },
    ],
  },
  {
    id: 'prog-002',
    name: 'NEET 2026 — Biology Intensive',
    course: 'NEET Preparation',
    students: 4,
    status: 'active',
    start_date: '2024-07-05',
    end_date: '2026-05-10',
    progress: 55,
    milestones: [
      { title: 'Unit 1: Diversity in Living World', done: true, due: '2024-08-31' },
      { title: 'Unit 2: Structural Organisation', done: true, due: '2024-10-31' },
      { title: 'Unit 3: Cell Structure & Function', done: false, due: '2025-01-31' },
      { title: 'Unit 4: Plant Physiology', done: false, due: '2025-04-30' },
      { title: 'Unit 5: Human Physiology', done: false, due: '2025-08-31' },
    ],
  },
  {
    id: 'prog-003',
    name: '10th Board Excellence Program',
    course: '10th Board Excellence',
    students: 6,
    status: 'active',
    start_date: '2024-07-15',
    end_date: '2025-03-20',
    progress: 78,
    milestones: [
      { title: 'Term 1 Syllabus Completion', done: true, due: '2024-09-30' },
      { title: 'Half-yearly Exams', done: true, due: '2024-11-15' },
      { title: 'Term 2 Syllabus Completion', done: true, due: '2025-01-31' },
      { title: 'Pre-Board Mock Tests (3 rounds)', done: false, due: '2025-02-28' },
    ],
  },
  {
    id: 'prog-004',
    name: 'JEE Advanced 2026 — Problem Solving',
    course: 'JEE Mains + Advanced',
    students: 3,
    status: 'draft',
    start_date: '2025-12-01',
    end_date: '2026-05-15',
    progress: 0,
    milestones: [
      { title: 'Olympiad-level Physics problems', done: false, due: '2026-01-31' },
      { title: 'Advanced Organic Chemistry', done: false, due: '2026-02-28' },
      { title: 'JEE Advanced mock series', done: false, due: '2026-04-30' },
    ],
  },
]

const ASSIGNMENTS = [
  { id: 'a-001', title: 'Motion in 2D — 50 problems', program: 'JEE Mains 2026', due: '2025-11-20', submitted: 5, total: 6, status: 'open' },
  { id: 'a-002', title: 'NCERT Biology Ch 8 summary', program: 'NEET 2026', due: '2025-11-18', submitted: 4, total: 4, status: 'closed' },
  { id: 'a-003', title: 'Algebra practice set #12', program: '10th Board Excellence', due: '2025-11-22', submitted: 3, total: 6, status: 'open' },
]

export default async function ProgramsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Programs"
        description="Structured coaching programs with milestones and assignments"
        action={<Button size="sm"><Plus size={14} className="mr-1" /> New Program</Button>}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {PROGRAMS.map(prog => (
          <Card key={prog.id} className="flex flex-col">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <CardTitle className="text-sm">{prog.name}</CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">{prog.course} · {prog.students} students</p>
                </div>
                <Badge variant={prog.status === 'active' ? 'default' : 'secondary'} className="text-xs shrink-0">
                  {prog.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="flex-1 space-y-3">
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Overall progress</span>
                  <span>{prog.progress}%</span>
                </div>
                <Progress value={prog.progress} className="h-1.5" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{prog.start_date}</span>
                  <span>→ {prog.end_date}</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Milestones</p>
                {prog.milestones.map((m, i) => (
                  <div key={i} className="flex items-start gap-2">
                    {m.done
                      ? <CheckCircle2 size={13} className="text-green-500 mt-0.5 shrink-0" />
                      : <Circle size={13} className="text-muted-foreground mt-0.5 shrink-0" />}
                    <div className="flex-1">
                      <p className={`text-xs ${m.done ? 'line-through text-muted-foreground' : ''}`}>{m.title}</p>
                      <p className="text-[10px] text-muted-foreground flex items-center gap-0.5"><Clock size={9} /> Due {m.due}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Assignments */}
      <Card>
        <CardHeader><CardTitle className="text-sm">Recent Assignments</CardTitle></CardHeader>
        <CardContent>
          <div className="divide-y">
            {ASSIGNMENTS.map(a => (
              <div key={a.id} className="py-3 flex items-center gap-3">
                <BookMarked size={14} className="text-muted-foreground shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{a.title}</p>
                  <p className="text-xs text-muted-foreground">{a.program} · Due {a.due}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{a.submitted}/{a.total}</p>
                  <p className="text-xs text-muted-foreground">submitted</p>
                </div>
                <Badge variant={a.status === 'open' ? 'default' : 'secondary'} className="text-xs">{a.status}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
