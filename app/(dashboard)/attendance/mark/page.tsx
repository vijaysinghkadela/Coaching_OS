import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PageHeader } from '@/components/shared/PageHeader'
import { AttendanceChecklist } from '@/components/attendance/AttendanceChecklist'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { format } from 'date-fns'

interface SearchParams { batch?: string; date?: string }

export default async function MarkAttendancePage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: institute } = await supabase.from('institutes').select('id').eq('owner_id', user.id).single()
  if (!institute) redirect('/signup')

  const { data: batches } = await supabase
    .from('batches').select('id, name').eq('institute_id', institute.id).eq('status', 'active').order('name')

  const selectedBatch = params.batch ?? batches?.[0]?.id
  const selectedDate = params.date ?? format(new Date(), 'yyyy-MM-dd')

  let students: { id: string; full_name: string; enrollment_no: string }[] = []
  const existingRecords: Record<string, 'present' | 'absent' | 'late' | 'excused'> = {}


  if (selectedBatch) {
    const [studentsRes, sessionRes] = await Promise.all([
      supabase
        .from('students')
        .select('id, full_name, enrollment_no')
        .eq('batch_id', selectedBatch)
        .eq('status', 'active')
        .order('full_name'),
      supabase
        .from('attendance_sessions')
        .select('id, attendance_records(student_id, status)')
        .eq('batch_id', selectedBatch)
        .eq('session_date', selectedDate)
        .single(),
    ])
    students = studentsRes.data ?? []
    if (sessionRes.data?.attendance_records) {
      for (const r of sessionRes.data.attendance_records) {
        existingRecords[r.student_id] = r.status as 'present' | 'absent' | 'late' | 'excused'
      }
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Mark Attendance" description="Select batch and date, then mark attendance" />

      <Card className="max-w-2xl">
        <CardContent className="pt-5">
          <form className="flex flex-wrap gap-4 mb-6">
            <div className="space-y-1.5 flex-1 min-w-40">
              <Label>Batch</Label>
              <Select name="batch" defaultValue={selectedBatch}>
                <SelectTrigger>
                  <SelectValue placeholder="Select batch" />
                </SelectTrigger>
                <SelectContent>
                  {(batches ?? []).map((b) => (
                    <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5 flex-1 min-w-40">
              <Label>Date</Label>
              <input
                name="date"
                type="date"
                defaultValue={selectedDate}
                max={format(new Date(), 'yyyy-MM-dd')}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
              />
            </div>
            <div className="flex items-end">
              <button type="submit" className="h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium">Apply</button>
            </div>
          </form>

          {selectedBatch && students.length > 0 ? (
            <AttendanceChecklist
              batchId={selectedBatch}
              sessionDate={selectedDate}
              students={students}
              existingRecords={existingRecords}
            />
          ) : selectedBatch ? (
            <p className="text-sm text-muted-foreground">No active students in this batch.</p>
          ) : (
            <p className="text-sm text-muted-foreground">Select a batch to start marking attendance.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
