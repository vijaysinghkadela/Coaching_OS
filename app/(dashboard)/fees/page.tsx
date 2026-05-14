'use client'

import { PageHeader } from '@/components/shared/PageHeader'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { DEMO_FEE_RECORDS, DEMO_STUDENTS, DEMO_PAYMENT_TRANSACTIONS } from '@/lib/demo/data'
import { formatCurrency } from '@/lib/utils'

export default function FeesPage() {
  const totalCollected = DEMO_FEE_RECORDS.reduce((a, r) => a + r.amount_paid, 0)
  const totalDue = DEMO_FEE_RECORDS.reduce((a, r) => a + r.total_amount - r.amount_paid, 0)
  const defaulters = DEMO_FEE_RECORDS.filter(r => r.status === 'overdue')

  return (
    <div className="space-y-6 p-6">
      <PageHeader title="Fees" description="Track fee collections and dues"
        action={<Link href="/fees/collect"><Button size="sm"><Plus size={14} className="mr-1" />Collect Fee</Button></Link>}
      />
      <div className="grid grid-cols-3 gap-3">
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-emerald-600">{formatCurrency(totalCollected)}</p><p className="text-xs text-muted-foreground mt-1">Collected</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-orange-600">{formatCurrency(totalDue)}</p><p className="text-xs text-muted-foreground mt-1">Due</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-red-600">{defaulters.length}</p><p className="text-xs text-muted-foreground mt-1">Defaulters</p></CardContent></Card>
      </div>
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm font-medium text-muted-foreground">Recent Transactions</CardTitle></CardHeader>
        <CardContent className="pt-0">
          <div className="divide-y text-sm">
            {DEMO_PAYMENT_TRANSACTIONS.slice(0, 5).map(t => {
              const student = DEMO_STUDENTS.find(s => DEMO_FEE_RECORDS.find(r => r.id === t.fee_record_id)?.student_id === s.id)
              return (
                <div key={t.id} className="py-3 flex justify-between items-center">
                  <div>
                    <p className="font-medium text-foreground">{student?.full_name ?? 'Student'}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{t.payment_method} · {t.payment_date?.slice(0, 10)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-foreground">{formatCurrency(t.amount)}</p>
                    <StatusBadge status={t.status} className="mt-1" />
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
