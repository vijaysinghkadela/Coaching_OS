'use client'

import dynamic from 'next/dynamic'
import { Users, BookOpen, ClipboardCheck, IndianRupee } from 'lucide-react'
import { KpiCard } from '@/components/dashboard/KpiCard'
import { QuickActions } from '@/components/dashboard/QuickActions'
import { RecentActivityFeed, type ActivityItem } from '@/components/dashboard/RecentActivityFeed'
import { formatCurrency } from '@/lib/utils'
import {
  DEMO_STUDENTS, DEMO_BATCHES, DEMO_PAYMENT_TRANSACTIONS,
  DEMO_MONTHLY_REVENUE, getDemoAttendanceTrend,
} from '@/lib/demo/data'

const AttendanceTrendChart = dynamic(() => import('@/components/dashboard/AttendanceTrendChart').then(m => ({ default: m.AttendanceTrendChart })), { ssr: false })
const RevenueBarChart = dynamic(() => import('@/components/dashboard/RevenueBarChart').then(m => ({ default: m.RevenueBarChart })), { ssr: false })

export default function DashboardPage() {
  const monthTotal = DEMO_PAYMENT_TRANSACTIONS
    .filter((t: { status: string }) => t.status === 'completed')
    .reduce((sum: number, t: { amount: number }) => sum + t.amount, 0)

  const items: ActivityItem[] = [
    { id: 'a1', type: 'payment', label: 'Arjun Mehta paid ₹18,000', sub: 'Fee payment', at: '2026-05-08T10:30:00Z' },
    { id: 'a2', type: 'enrollment', label: 'Kavya Rajput enrolled', sub: 'New student', at: '2026-05-05T09:00:00Z' },
  ]

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Overview of your institute</p>
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard title="Total Students" value={DEMO_STUDENTS.length} icon={Users} delta={12} deltaLabel="vs last month" />
        <KpiCard title="Active Batches" value={DEMO_BATCHES.filter((b: { status: string }) => b.status === 'active').length} icon={BookOpen} />
        <KpiCard title="Today's Attendance" value="84.7%" icon={ClipboardCheck} delta={-3} deltaLabel="vs yesterday" />
        <KpiCard title="Fees This Month" value={formatCurrency(monthTotal)} icon={IndianRupee} delta={8} deltaLabel="vs last month" />
      </div>
      <QuickActions />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <AttendanceTrendChart data={getDemoAttendanceTrend()} />
          <RevenueBarChart data={DEMO_MONTHLY_REVENUE} />
        </div>
        <div><RecentActivityFeed items={items} /></div>
      </div>
    </div>
  )
}
