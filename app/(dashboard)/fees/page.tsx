import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { KpiCard } from '@/components/dashboard/KpiCard'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { formatCurrency, formatDate } from '@/lib/utils'
import { IndianRupee, AlertTriangle, CheckCircle2, Settings } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { startOfMonth } from 'date-fns'

export default async function FeesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: institute } = await supabase.from('institutes').select('id').eq('owner_id', user.id).single()
  if (!institute) redirect('/signup')
  const iid = institute.id

  const [allFeeRecords, thisMonthPayments, defaulters] = await Promise.all([
    supabase
      .from('fee_records')
      .select('total_amount, amount_paid, status')
      .eq('institute_id', iid),
    supabase
      .from('payment_transactions')
      .select('amount')
      .eq('institute_id', iid)
      .eq('status', 'completed')
      .gte('created_at', startOfMonth(new Date()).toISOString()),
    supabase
      .from('fee_records')
      .select('id, total_amount, amount_paid, due_date, status, students(full_name, enrollment_no, phone)')
      .eq('institute_id', iid)
      .in('status', ['overdue', 'pending'])
      .order('due_date'),
  ])

  const records = allFeeRecords.data ?? []
  const totalCollected = (thisMonthPayments.data ?? []).reduce((s, t) => s + (t.amount ?? 0), 0)
  const totalPending = records.filter((r) => r.status !== 'paid' && r.status !== 'waived')
    .reduce((s, r) => s + ((r.total_amount ?? 0) - (r.amount_paid ?? 0)), 0)
  const overdueCount = records.filter((r) => r.status === 'overdue').length

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fees"
        description="Fee collection and management"
        action={
          <div className="flex gap-2">
            <Link href="/fees/structures">
              <Button variant="outline"><Settings size={14} className="mr-2" />Structures</Button>
            </Link>
            <Link href="/fees/collect">
              <Button><IndianRupee size={14} className="mr-2" />Collect Fee</Button>
            </Link>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard title="Collected This Month" value={formatCurrency(totalCollected)} icon={CheckCircle2} />
        <KpiCard title="Total Pending" value={formatCurrency(totalPending)} icon={IndianRupee} />
        <KpiCard title="Overdue Count" value={overdueCount} icon={AlertTriangle} />
      </div>

      {/* Defaulters list */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Pending &amp; Overdue</CardTitle>
        </CardHeader>
        <CardContent>
          {!defaulters.data || defaulters.data.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">All fees collected!</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-xs text-muted-foreground">
                    <th className="text-left py-2">Student</th>
                    <th className="text-left py-2">Due Date</th>
                    <th className="text-left py-2">Pending</th>
                    <th className="text-left py-2">Status</th>
                    <th className="text-right py-2">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {defaulters.data.map((rec) => {
                    const student = (rec.students as unknown as { full_name: string; enrollment_no: string; phone: string }[] | null)?.[0] ?? null
                    const pending = (rec.total_amount ?? 0) - (rec.amount_paid ?? 0)
                    return (
                      <tr key={rec.id}>
                        <td className="py-2.5">
                          <p className="font-medium">{student?.full_name ?? '—'}</p>
                          <p className="text-xs text-muted-foreground font-mono">{student?.enrollment_no}</p>
                        </td>
                        <td className="py-2.5 text-muted-foreground">{formatDate(rec.due_date)}</td>
                        <td className="py-2.5 font-medium text-red-600">{formatCurrency(pending)}</td>
                        <td className="py-2.5"><StatusBadge status={rec.status} /></td>
                        <td className="py-2.5 text-right">
                          <Link href={`/fees/collect?record=${rec.id}`}>
                            <Button size="sm" variant="outline">Collect</Button>
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
