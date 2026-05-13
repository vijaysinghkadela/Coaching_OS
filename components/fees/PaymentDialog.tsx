'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { recordPayment } from '@/lib/actions/fees'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatCurrency } from '@/lib/utils'

type PaymentMethod = 'cash' | 'upi' | 'bank_transfer' | 'cheque'

interface PaymentDialogProps {
  open: boolean
  onOpenChange: (_open: boolean) => void
  feeRecordId: string
  pendingAmount: number
  studentName: string
  onSuccess?: (_receiptNumber: string) => void
}

export function PaymentDialog({ open, onOpenChange, feeRecordId, pendingAmount, studentName, onSuccess }: PaymentDialogProps) {
  const [method, setMethod] = useState<PaymentMethod>('cash')
  const [amount, setAmount] = useState(pendingAmount)
  const [reference, setReference] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handlePay = async () => {
    if (amount <= 0) { toast.error('Enter a valid amount'); return }
    setLoading(true)
    const res = await recordPayment({
      fee_record_id: feeRecordId,
      amount,
      payment_method: method,
      reference_number: reference || undefined,
    })
    setLoading(false)
    if (res.error) {
      toast.error(res.error)
    } else {
      toast.success(`Payment recorded! Receipt: ${res.receiptNumber}`)
      onSuccess?.(res.receiptNumber!)
      onOpenChange(false)
      router.refresh()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Collect Payment</DialogTitle>
        </DialogHeader>
        <div className="text-sm text-muted-foreground mb-2">
          <span className="font-medium text-foreground">{studentName}</span> · Pending: {formatCurrency(pendingAmount)}
        </div>

        <Tabs value={method} onValueChange={(v) => setMethod(v as PaymentMethod)}>
          <TabsList className="w-full grid grid-cols-4">
            <TabsTrigger value="cash">Cash</TabsTrigger>
            <TabsTrigger value="upi">UPI</TabsTrigger>
            <TabsTrigger value="bank_transfer">Bank</TabsTrigger>
            <TabsTrigger value="cheque">Cheque</TabsTrigger>
          </TabsList>

          {(['cash', 'upi', 'bank_transfer', 'cheque'] as const).map((m) => (
            <TabsContent key={m} value={m} className="mt-4 space-y-3">
              <div className="space-y-1.5">
                <Label>Amount (₹)</Label>
                <Input
                  type="number"
                  min={1}
                  max={pendingAmount}
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                />
              </div>
              {m !== 'cash' && (
                <div className="space-y-1.5">
                  <Label>{m === 'upi' ? 'UPI Ref / UTR' : m === 'cheque' ? 'Cheque Number' : 'Transaction ID'}</Label>
                  <Input value={reference} onChange={(e) => setReference(e.target.value)} placeholder="Optional" />
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>

        <Button className="w-full mt-2" onClick={handlePay} disabled={loading}>
          {loading ? 'Processing…' : `Confirm ${formatCurrency(amount)} Payment`}
        </Button>
      </DialogContent>
    </Dialog>
  )
}
