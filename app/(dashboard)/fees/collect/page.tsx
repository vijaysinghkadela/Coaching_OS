'use client'

import { useState } from 'react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { DEMO_STUDENTS, DEMO_FEE_STRUCTURES } from '@/lib/demo/data'
import { formatCurrency } from '@/lib/utils'

type Method = 'cash' | 'upi' | 'bank_transfer' | 'cheque'

export default function CollectFeePage() {
  const [studentId, setStudentId] = useState('')
  const [amount, setAmount] = useState(0)
  const [method, setMethod] = useState<Method>('cash')
  const [loading, setLoading] = useState(false)

  const student = DEMO_STUDENTS.find(s => s.id === studentId)
  const defaultAmount = DEMO_FEE_STRUCTURES[0]?.total_amount ?? 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!studentId) return toast.error('Select a student')
    setLoading(true)
    await new Promise(r => setTimeout(r, 1200))
    toast.success(`Payment of ${formatCurrency(amount || defaultAmount)} recorded for ${student?.full_name}`)
    setLoading(false)
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <Link href="/fees"><Button variant="ghost" size="icon"><ArrowLeft size={16} /></Button></Link>
        <PageHeader title="Collect Fee" description="Record a payment from a student" />
      </div>
      <Card className="max-w-lg">
        <CardHeader><CardTitle className="text-sm">Payment Details</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><Label>Student</Label><Select value={studentId} onValueChange={v => v && setStudentId(v)}><SelectTrigger><SelectValue placeholder="Select student" /></SelectTrigger><SelectContent>{DEMO_STUDENTS.map(s => <SelectItem key={s.id} value={s.id}>{s.full_name} ({s.enrollment_no})</SelectItem>)}</SelectContent></Select></div>
            {student && <p className="text-sm text-muted-foreground">Default fee: {formatCurrency(DEMO_FEE_STRUCTURES.find(f => f.course_id === student.course_id)?.total_amount ?? defaultAmount)}</p>}
            <div><Label>Amount</Label><Input type="number" value={amount || ''} onChange={e => setAmount(+e.target.value)} placeholder="Enter amount" /></div>
            <div><Label>Payment Method</Label><Select value={method} onValueChange={v => setMethod(v as Method)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="cash">Cash</SelectItem><SelectItem value="upi">UPI</SelectItem><SelectItem value="bank_transfer">Bank Transfer</SelectItem><SelectItem value="cheque">Cheque</SelectItem></SelectContent></Select></div>
            <Button type="submit" disabled={loading} className="w-full">{loading ? 'Recording...' : `Record Payment`}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
