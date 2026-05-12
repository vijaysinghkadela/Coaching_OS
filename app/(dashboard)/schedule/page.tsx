import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, Users, Plus, ChevronLeft, ChevronRight, MapPin } from 'lucide-react'

const TODAY_SESSIONS = [
  { id: 's-001', time: '07:00–09:00', subject: 'Physics — Rotational Motion', batch: 'JEE 2026 Morning', room: 'Room A', teacher: 'R. Kumar', students: 6, status: 'upcoming' },
  { id: 's-002', time: '09:30–11:30', subject: 'Chemistry — Organic Reactions', batch: 'JEE 2026 Morning', room: 'Room B', teacher: 'S. Joshi', students: 6, status: 'completed' },
  { id: 's-003', time: '11:00–13:00', subject: 'Biology — Human Physiology', batch: 'NEET 2026 Batch A', room: 'Room A', teacher: 'P. Meena', students: 4, status: 'ongoing' },
  { id: 's-004', time: '15:00–17:00', subject: 'Mathematics — Calculus', batch: '10th 2025-26', room: 'Room B', teacher: 'A. Sharma', students: 6, status: 'upcoming' },
  { id: 's-005', time: '17:00–19:00', subject: 'Science — Light & Optics', batch: '10th 2025-26', room: 'Lab (Physics)', teacher: 'R. Kumar', students: 6, status: 'upcoming' },
]

const WEEK_SCHEDULE = [
  { day: 'Mon', sessions: 4 }, { day: 'Tue', sessions: 5 }, { day: 'Wed', sessions: 3 },
  { day: 'Thu', sessions: 5 }, { day: 'Fri', sessions: 4 }, { day: 'Sat', sessions: 6 }, { day: 'Sun', sessions: 0 },
]

const UPCOMING_EVENTS = [
  { date: '2025-11-15', title: 'JEE Mock Test #8', type: 'test', batch: 'JEE 2026 Morning' },
  { date: '2025-11-20', title: 'Parent-Teacher Meeting', type: 'meeting', batch: 'All Batches' },
  { date: '2025-11-22', title: 'NEET Chapter Test — Ecology', type: 'test', batch: 'NEET 2026 Batch A' },
  { date: '2025-11-28', title: '10th Half-Yearly Exam', type: 'exam', batch: '10th 2025-26' },
  { date: '2025-12-01', title: 'Winter Break Begins', type: 'holiday', batch: 'All Batches' },
]

const statusColors: Record<string, string> = {
  upcoming: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  ongoing: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  completed: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
}

const eventColors: Record<string, string> = {
  test: 'bg-orange-100 text-orange-700',
  meeting: 'bg-blue-100 text-blue-700',
  exam: 'bg-red-100 text-red-700',
  holiday: 'bg-green-100 text-green-700',
}

export default async function SchedulePage() {
  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Schedule"
        description="Session calendar, bookings, and upcoming events"
        action={<Button size="sm"><Plus size={14} className="mr-1" /> Book Session</Button>}
      />

      {/* Week overview mini-bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium">This Week</p>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-7 w-7"><ChevronLeft size={13} /></Button>
              <span className="text-xs text-muted-foreground px-1">Nov 11–17, 2025</span>
              <Button variant="ghost" size="icon" className="h-7 w-7"><ChevronRight size={13} /></Button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-2">
            {WEEK_SCHEDULE.map((d, i) => (
              <div key={d.day} className={`flex flex-col items-center rounded-lg py-2 ${i === 0 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                <span className="text-xs font-medium">{d.day}</span>
                <span className={`text-lg font-bold ${d.sessions === 0 ? 'text-muted-foreground' : ''}`}>{d.sessions}</span>
                <span className="text-[10px] opacity-70">sessions</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Today's sessions */}
        <div className="lg:col-span-2 space-y-3">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Calendar size={14} />
            Today — {today}
          </h3>
          <div className="space-y-2">
            {TODAY_SESSIONS.map(s => (
              <Card key={s.id} className={s.status === 'ongoing' ? 'ring-1 ring-green-500' : ''}>
                <CardContent className="p-3 flex items-center gap-3">
                  <div className="text-center shrink-0 w-20">
                    <Clock size={12} className="mx-auto text-muted-foreground mb-0.5" />
                    <p className="text-xs font-medium">{s.time.split('–')[0]}</p>
                    <p className="text-[10px] text-muted-foreground">–{s.time.split('–')[1]}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{s.subject}</p>
                    <p className="text-xs text-muted-foreground">{s.batch}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-muted-foreground flex items-center gap-0.5"><MapPin size={10} />{s.room}</span>
                      <span className="text-xs text-muted-foreground flex items-center gap-0.5"><Users size={10} />{s.students}</span>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${statusColors[s.status]}`}>
                    {s.status}
                  </span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Upcoming events */}
        <div>
          <h3 className="text-sm font-semibold flex items-center gap-2 mb-3">
            <Calendar size={14} />
            Upcoming Events
          </h3>
          <div className="space-y-2">
            {UPCOMING_EVENTS.map(e => (
              <Card key={e.date + e.title}>
                <CardContent className="p-3">
                  <div className="flex items-start gap-2">
                    <span className={`text-xs px-1.5 py-0.5 rounded font-medium shrink-0 ${eventColors[e.type]}`}>
                      {e.type}
                    </span>
                    <div>
                      <p className="text-xs font-medium">{e.title}</p>
                      <p className="text-[10px] text-muted-foreground">{e.date} · {e.batch}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
