'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Printer } from 'lucide-react'
import { DEMO_PAYMENT_TRANSACTIONS, DEMO_STUDENTS, DEMO_FEE_RECORDS, DEMO_INSTITUTE } from '@/lib/demo/data'
import { formatCurrency } from '@/lib/utils'

export default function ReceiptPage() {
  const params = useParams()
  const tx = DEMO_PAYMENT_TRANSACTIONS.find(t => t.id === params.id)
  if (!tx) return <div className="p-6 text-muted-foreground">Receipt not found</div>
  const student = DEMO_STUDENTS.find(s => DEMO_FEE_RECORDS.find(r => r.id === tx.fee_record_id)?.student_id === s.id)

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <Link href="/fees"><Button variant="ghost" size="icon"><ArrowLeft size={16} /></Button></Link>
        <PageHeader title="Payment Receipt" description={`#${tx.id}`} />
        <Button variant="outline" size="sm"><Printer size={14} className="mr-1" />Print</Button>
      </div>
      <Card className="max-w-lg mx-auto">
        <CardContent className="p-8">
          <div className="text-center mb-6"><p className="text-lg font-bold">{DEMO_INSTITUTE.name}</p><p className="text-xs text-muted-foreground">Bikaner, Rajasthan</p></div>
          <div className="border-t pt-4 space-y-2 text-sm">
            <p><span className="text-muted-foreground">Student:</span> {student?.full_name ?? '—'}</p>
            <p><span className="text-muted-foreground">Amount:</span> <span className="font-bold text-lg">{formatCurrency(tx.amount)}</span></p>
            <p><span className="text-muted-foreground">Method:</span> {tx.payment_method}</p>
            <p><span className="text-muted-foreground">Date:</span> {tx.payment_date?.slice(0, 10) ?? '—'}</p>
            <p><span className="text-muted-foreground">Status:</span> {tx.status}</p>
          </div>
          <div className="border-t mt-4 pt-4 text-center text-xs text-muted-foreground">Thank you for your payment!</div>
        </CardContent>
      </Card>
    </div>
  )
}
