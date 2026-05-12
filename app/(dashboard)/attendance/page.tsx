import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ClipboardCheck, QrCode } from 'lucide-react'

export default async function AttendancePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

   const { data: institute } = await supabase.from('institutes').select('id').eq('owner_id', user.id).single()
   if (!institute) redirect('/signup')

  return (
    <div className="space-y-6">
      <PageHeader title="Attendance" description="Mark and track student attendance" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 max-w-2xl">
        <Link href="/attendance/mark">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="pb-2">
              <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center mb-2">
                <ClipboardCheck size={20} className="text-green-600" />
              </div>
              <CardTitle className="text-base">Manual Attendance</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Select batch and date, then mark each student present/absent/late.</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/attendance/qr">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="pb-2">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center mb-2">
                <QrCode size={20} className="text-blue-600" />
              </div>
              <CardTitle className="text-base">QR Attendance</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Generate a QR code. Students scan to self-mark attendance (30-min expiry).</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent sessions */}
      <div className="mt-4">
        <h2 className="text-base font-semibold text-foreground mb-3">Recent Sessions</h2>
        <RecentSessionsTable instituteId={institute.id} supabase={supabase} />
      </div>
    </div>
  )
}

async function RecentSessionsTable({ instituteId, supabase }: { instituteId: string; supabase: ReturnType<typeof createClient> extends Promise<infer T> ? T : never }) {
   const { data: sessions } = await supabase
     .from('attendance_sessions')
     .select('id, session_date, attendance_records(status)')
     .eq('institute_id', instituteId)
     .order('session_date', { ascending: false })
     .limit(10)

  if (!sessions || sessions.length === 0) return <p className="text-sm text-muted-foreground">No sessions recorded yet.</p>

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-muted/50 border-b border-border">
            <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Date</th>
            <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Batch</th>
            <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Present</th>
            <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Total</th>
            <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">%</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {sessions.map((s) => {
            const records = s.attendance_records ?? []
            const present = records.filter((r) => r.status === 'present' || r.status === 'late').length
            const total = records.length
            const pct = total > 0 ? Math.round((present / total) * 100) : 0
            const batch = (s.batches as unknown as { name: string }[] | null)?.[0] ?? null
            return (
              <tr key={s.id}>
                <td className="px-4 py-2.5">{s.session_date}</td>
                <td className="px-4 py-2.5 text-muted-foreground">{batch?.name ?? '—'}</td>
                <td className="px-4 py-2.5 text-green-600 font-medium">{present}</td>
                <td className="px-4 py-2.5">{total}</td>
                <td className="px-4 py-2.5 font-medium">{total > 0 ? `${pct}%` : '—'}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
