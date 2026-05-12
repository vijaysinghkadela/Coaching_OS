'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { createAttendanceSession, markAttendanceBulk } from '@/lib/actions/attendance'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Check, X, Clock, BookOpen } from 'lucide-react'

type AttStatus = 'present' | 'absent' | 'late' | 'excused'

interface Student {
  id: string
  full_name: string
  enrollment_no: string
}

interface AttendanceChecklistProps {
  batchId: string
  sessionDate: string
  students: Student[]
  existingRecords?: Record<string, AttStatus>
}

const STATUS_CONFIG: Record<AttStatus, { label: string; icon: React.ReactNode; cls: string }> = {
  present: { label: 'P', icon: <Check size={12} />, cls: 'bg-green-500 text-white' },
  late:    { label: 'L', icon: <Clock size={12} />, cls: 'bg-yellow-500 text-white' },
  excused: { label: 'E', icon: <BookOpen size={12} />, cls: 'bg-blue-500 text-white' },
  absent:  { label: 'A', icon: <X size={12} />,     cls: 'bg-red-500 text-white' },
}
const STATUSES: AttStatus[] = ['present', 'late', 'excused', 'absent']

export function AttendanceChecklist({ batchId, sessionDate, students, existingRecords = {} }: AttendanceChecklistProps) {
  const [records, setRecords] = useState<Record<string, AttStatus>>(() => {
    const init: Record<string, AttStatus> = {}
    students.forEach((s) => { init[s.id] = existingRecords[s.id] ?? 'present' })
    return init
  })
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const toggle = (studentId: string) => {
    setRecords((prev) => {
      const cur = STATUSES.indexOf(prev[studentId])
      return { ...prev, [studentId]: STATUSES[(cur + 1) % STATUSES.length] }
    })
  }

  const markAll = (status: AttStatus) => {
    setRecords(Object.fromEntries(students.map((s) => [s.id, status])))
  }

  const handleSave = async () => {
    setLoading(true)
    const sessionRes = await createAttendanceSession(batchId, sessionDate)
    if (sessionRes.error) { toast.error(sessionRes.error); setLoading(false); return }

    const entries = Object.entries(records).map(([studentId, status]) => ({ studentId, status }))
    const res = await markAttendanceBulk(sessionRes.sessionId!, entries)
    setLoading(false)

    if (res.error) toast.error(res.error)
    else { toast.success('Attendance saved!'); router.refresh() }
  }

  const counts = STATUSES.map((s) => ({ status: s, count: Object.values(records).filter((v) => v === s).length }))

  return (
    <div className="space-y-4">
      {/* Summary bar */}
      <div className="flex gap-3 flex-wrap">
        {counts.map(({ status, count }) => (
          <button
            key={status}
            onClick={() => markAll(status)}
            className={cn('flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium', STATUS_CONFIG[status].cls, 'opacity-90 hover:opacity-100')}
          >
            {STATUS_CONFIG[status].icon}
            {count} {status}
          </button>
        ))}
        <span className="ml-auto text-xs text-muted-foreground self-center">{students.length} students · click to cycle</span>
      </div>

      {/* Student list */}
      <div className="space-y-1">
        {students.map((student) => {
          const status = records[student.id]
          const cfg = STATUS_CONFIG[status]
          return (
            <div
              key={student.id}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-border hover:bg-muted/30 cursor-pointer transition-colors"
              onClick={() => toggle(student.id)}
            >
              <div className={cn('w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0', cfg.cls)}>
                {cfg.label}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{student.full_name}</p>
                <p className="text-xs text-muted-foreground font-mono">{student.enrollment_no}</p>
              </div>
              <span className="text-xs text-muted-foreground capitalize">{status}</span>
            </div>
          )
        })}
      </div>

      <Button className="w-full" onClick={handleSave} disabled={loading || students.length === 0}>
        {loading ? 'Saving…' : 'Save Attendance'}
      </Button>
    </div>
  )
}
