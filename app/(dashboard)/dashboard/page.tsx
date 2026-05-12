import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Users, BookOpen, ClipboardCheck, IndianRupee } from 'lucide-react'
import { KpiCard } from '@/components/dashboard/KpiCard'
import { AttendanceTrendChart } from '@/components/dashboard/AttendanceTrendChart'
import { RevenueBarChart } from '@/components/dashboard/RevenueBarChart'
import { RecentActivityFeed, type ActivityItem } from '@/components/dashboard/RecentActivityFeed'
import { QuickActions } from '@/components/dashboard/QuickActions'
import { formatCurrency } from '@/lib/utils'
import { subDays, format, subMonths, startOfMonth, endOfMonth } from 'date-fns'
import {
  DEMO_STUDENTS,
  DEMO_BATCHES,
  DEMO_PAYMENT_TRANSACTIONS,
  DEMO_MONTHLY_REVENUE,
  getDemoAttendanceTrend,
} from '@/lib/demo/data'

const IS_DEMO = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'

export default async function DashboardPage() {
  if (IS_DEMO) {
    const monthTotal = DEMO_PAYMENT_TRANSACTIONS
      .filter(t => t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0)

    const demoActivity: ActivityItem[] = [
      { id: 'a1', type: 'payment', label: 'Arjun Mehta paid ₹18,000', sub: 'Fee payment', at: '2026-05-08T10:30:00Z' },
      { id: 'a2', type: 'enrollment', label: 'Kavya Rajput enrolled', sub: 'New student', at: '2026-05-05T09:00:00Z' },
      { id: 'a3', type: 'payment', label: 'Ananya Singh paid ₹34,000', sub: 'Fee payment', at: '2026-05-03T11:00:00Z' },
      { id: 'a4', type: 'enrollment', label: 'Mohit Sharma enrolled', sub: 'New student', at: '2026-04-28T09:00:00Z' },
      { id: 'a5', type: 'payment', label: 'Pooja Choudhary paid ₹34,000', sub: 'Fee payment', at: '2026-04-25T14:00:00Z' },
      { id: 'a6', type: 'payment', label: 'Arjun Mehta paid ₹18,000', sub: 'Fee payment', at: '2026-04-20T10:00:00Z' },
    ]

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-1">Sharma Classes, Bikaner</p>
          </div>
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700 border border-amber-200">
            Demo Mode
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <KpiCard title="Total Students" value={DEMO_STUDENTS.length} icon={Users} />
          <KpiCard title="Active Batches" value={DEMO_BATCHES.filter(b => b.status === 'active').length} icon={BookOpen} />
          <KpiCard title="Today&apos;s Attendance" value="84.7%" icon={ClipboardCheck} delta={9.7} deltaLabel="vs target" />
          <KpiCard title="Fees This Month" value={formatCurrency(97000)} icon={IndianRupee} />
        </div>

        <QuickActions />

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <AttendanceTrendChart data={getDemoAttendanceTrend()} />
            <RevenueBarChart data={DEMO_MONTHLY_REVENUE} />
          </div>
          <div>
            <RecentActivityFeed items={demoActivity} />
          </div>
        </div>
      </div>
    )
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: institute } = await supabase
    .from('institutes')
    .select('id')
    .eq('owner_id', user.id)
    .single()

  if (!institute) redirect('/signup')
  const iid = (institute as { id: string }).id

  const [
    { count: totalStudents },
    { count: activeBatches },
    attendanceToday,
    feesThisMonth,
    attendance30d,
    revenue6m,
    recentPayments,
    recentEnrollments,
  ] = await Promise.all([
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from('students') as any).select('*', { count: 'exact', head: true }).eq('institute_id', iid).eq('status', 'active'),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from('batches') as any).select('*', { count: 'exact', head: true }).eq('institute_id', iid).eq('status', 'active'),
    supabase.rpc('get_today_attendance_pct', { p_institute_id: iid }),
    supabase
      .from('payment_transactions')
      .select('amount')
      .eq('institute_id', iid)
      .eq('status', 'completed')
      .gte('created_at', startOfMonth(new Date()).toISOString())
      .lte('created_at', endOfMonth(new Date()).toISOString()),
    supabase
      .from('attendance_sessions')
      .select('session_date, attendance_records(status)')
      .eq('institute_id', iid)
      .gte('session_date', format(subDays(new Date(), 29), 'yyyy-MM-dd'))
      .order('session_date'),
    supabase
      .from('payment_transactions')
      .select('amount, created_at')
      .eq('institute_id', iid)
      .eq('status', 'completed')
      .gte('created_at', subMonths(startOfMonth(new Date()), 5).toISOString()),
    supabase
      .from('payment_transactions')
      .select('id, amount, created_at, fee_records(students(full_name))')
      .eq('institute_id', iid)
      .eq('status', 'completed')
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('students')
      .select('id, full_name, created_at')
      .eq('institute_id', iid)
      .order('created_at', { ascending: false })
      .limit(5),
  ])

   const todayPct = (attendanceToday?.data as number | null) ?? 0
   // eslint-disable-next-line @typescript-eslint/no-unused-vars
   const monthTotal = ((feesThisMonth as { data: { amount: number }[] | null }).data ?? []).reduce((sum, t) => sum + (t.amount ?? 0), 0)

  const attendanceMap = new Map<string, { present: number; total: number }>()
  for (const session of (attendance30d as { data: { session_date: string; attendance_records: { status: string }[] }[] | null }).data ?? []) {
    const day = session.session_date
    if (!attendanceMap.has(day)) attendanceMap.set(day, { present: 0, total: 0 })
    const entry = attendanceMap.get(day)!
    for (const rec of session.attendance_records ?? []) {
      entry.total++
      if (rec.status === 'present' || rec.status === 'late') entry.present++
    }
  }
  const trendData = Array.from({ length: 30 }, (_, i) => {
    const d = format(subDays(new Date(), 29 - i), 'yyyy-MM-dd')
    const entry = attendanceMap.get(d)
    const pct = entry && entry.total > 0 ? Math.round((entry.present / entry.total) * 100) : 0
    return { date: format(subDays(new Date(), 29 - i), 'dd MMM'), pct }
  })

  const revenueMap = new Map<string, number>()
  for (let i = 5; i >= 0; i--) {
    const d = subMonths(new Date(), i)
    revenueMap.set(format(d, 'MMM yy'), 0)
  }
  for (const t of (revenue6m as { data: { amount: number; created_at: string }[] | null }).data ?? []) {
    const key = format(new Date(t.created_at), 'MMM yy')
    if (revenueMap.has(key)) revenueMap.set(key, (revenueMap.get(key) ?? 0) + (t.amount ?? 0))
  }
   const revenueData = Array.from(revenueMap.entries()).map(([month, amount]) => ({ month, amount }))

  const activityItems: ActivityItem[] = [
    ...((recentEnrollments as { data: { id: string; full_name: string; created_at: string }[] | null }).data ?? []).map((s) => ({
      id: `enroll-${s.id}`,
      type: 'enrollment' as const,
      label: `${s.full_name} enrolled`,
      sub: 'New student',
      at: s.created_at,
    })),
    ...((recentPayments as { data: { id: string; amount: number; created_at: string; fee_records: unknown }[] | null }).data ?? []).map((p) => {
      const feeRecord = (p.fee_records as unknown as { students: { full_name: string }[] | null }[] | null)?.[0]
      const name = feeRecord?.students?.[0]?.full_name ?? 'Student'
      return {
        id: `payment-${p.id}`,
        type: 'payment' as const,
        label: `${name} paid ${formatCurrency(p.amount ?? 0)}`,
        sub: 'Fee payment',
        at: p.created_at,
      }
    }),
  ].sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime()).slice(0, 8)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Overview of your institute</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard title="Total Students" value={totalStudents ?? 0} icon={Users} />
        <KpiCard title="Active Batches" value={activeBatches ?? 0} icon={BookOpen} />
        <KpiCard title="Today&apos;s Attendance" value={`${todayPct}%`} icon={ClipboardCheck} delta={todayPct - 75} deltaLabel="vs target" />
        <KpiCard title="Fees This Month" value={formatCurrency(monthTotal)} icon={IndianRupee} />
      </div>

      <QuickActions />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <AttendanceTrendChart data={trendData} />
          <RevenueBarChart data={revenueData} />
        </div>
        <div>
          <RecentActivityFeed items={activityItems} />
        </div>
      </div>
    </div>
  )
}
