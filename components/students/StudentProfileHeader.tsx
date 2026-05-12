import { getInitials, formatDate } from '@/lib/utils'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Badge } from '@/components/ui/badge'
import { Phone, Mail, Calendar, GraduationCap } from 'lucide-react'

interface StudentProfileHeaderProps {
  student: {
    id: string
    enrollment_no: string
    full_name: string
    phone: string
    parent_phone: string
    email: string | null
    gender: string | null
    date_of_birth: string | null
    status: string
    created_at: string
    batches: { name: string } | null
    courses: { name: string } | null
  }
}

export function StudentProfileHeader({ student }: StudentProfileHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6 p-6 rounded-xl border border-border bg-card">
      {/* Avatar */}
      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary text-xl font-bold shrink-0">
        {getInitials(student.full_name)}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <h1 className="text-xl font-bold text-foreground">{student.full_name}</h1>
          <StatusBadge status={student.status} />
          {student.gender && (
            <Badge variant="outline" className="capitalize text-xs">{student.gender}</Badge>
          )}
        </div>
        <p className="text-xs font-mono text-muted-foreground mb-3">{student.enrollment_no}</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Phone size={13} />
            <span>{student.phone}</span>
          </div>
          {student.email && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail size={13} />
              <span className="truncate">{student.email}</span>
            </div>
          )}
          {student.date_of_birth && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar size={13} />
              <span>{formatDate(student.date_of_birth)}</span>
            </div>
          )}
          {student.batches && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <GraduationCap size={13} />
              <span>{student.batches.name}</span>
            </div>
          )}
        </div>
      </div>

      {/* Parent info */}
      <div className="shrink-0 text-sm text-muted-foreground">
        <p className="font-medium text-foreground text-xs mb-1">Parent / Guardian</p>
        <div className="flex items-center gap-2">
          <Phone size={12} />
          <span>{student.parent_phone}</span>
        </div>
        <p className="text-xs mt-2">Enrolled {formatDate(student.created_at)}</p>
      </div>
    </div>
  )
}
