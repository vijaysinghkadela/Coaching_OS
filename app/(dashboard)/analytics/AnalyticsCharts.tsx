'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const SUBJECT_PERFORMANCE = [
  { subject: 'Physics',  avg: 71 },
  { subject: 'Chemistry', avg: 74 },
  { subject: 'Maths',    avg: 68 },
  { subject: 'Biology',  avg: 78 },
  { subject: 'English',  avg: 82 },
]

const ATTENDANCE_TREND = [
  { week: 'W1', pct: 88 }, { week: 'W2', pct: 85 }, { week: 'W3', pct: 90 },
  { week: 'W4', pct: 82 }, { week: 'W5', pct: 87 }, { week: 'W6', pct: 84 },
  { week: 'W7', pct: 89 }, { week: 'W8', pct: 91 },
]

interface Props {
  monthlyRevenue: { month: string; amount: number }[]
}

export function AnalyticsCharts({ monthlyRevenue }: Props) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card>
        <CardHeader><CardTitle className="text-sm">Monthly Revenue (₹)</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthlyRevenue}>
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v) => typeof v === 'number' ? [`₹${v.toLocaleString()}`, 'Revenue'] : [v, 'Revenue']} />
              <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-sm">Weekly Attendance Trend (%)</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={ATTENDANCE_TREND}>
              <XAxis dataKey="week" tick={{ fontSize: 11 }} />
              <YAxis domain={[70, 100]} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => [`${v}%`, 'Attendance']} />
              <Area type="monotone" dataKey="pct" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.15)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-sm">Subject-wise Average Score (%)</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={SUBJECT_PERFORMANCE} layout="vertical">
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
              <YAxis dataKey="subject" type="category" width={70} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => [`${v}%`, 'Average']} />
              <Bar dataKey="avg" fill="hsl(142 71% 45%)" radius={[0, 3, 3, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-sm">Fee Collection Status</CardTitle></CardHeader>
        <CardContent className="flex flex-col gap-3 pt-2">
          {[
            { label: 'Paid', value: 8, color: 'bg-green-500' },
            { label: 'Partial', value: 4, color: 'bg-orange-400' },
            { label: 'Pending', value: 2, color: 'bg-yellow-400' },
            { label: 'Overdue', value: 1, color: 'bg-red-500' },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground w-14">{item.label}</span>
              <div className="flex-1 bg-muted rounded-full h-2">
                <div className={`${item.color} h-2 rounded-full`} style={{ width: `${(item.value / 15) * 100}%` }} />
              </div>
              <span className="text-xs font-medium w-4">{item.value}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
