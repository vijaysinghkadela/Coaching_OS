'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PaymentDialog } from '@/components/fees/PaymentDialog'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDate } from '@/lib/utils'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface FeeRecord {
  id: string
  total_amount: number
  amount_paid: number
  due_date: string
  status: string
  fee_structures: { name: string } | null
  students: { id: string; full_name: string; enrollment_no: string } | null
}

interface FeeCollectClientProps {
  feeRecords: FeeRecord[]
  preselectedId?: string
}

export function FeeCollectClient({ feeRecords, preselectedId }: FeeCollectClientProps) {
  const [selectedId, setSelectedId] = useState(preselectedId ?? '')
  const [payDialogOpen, setPayDialogOpen] = useState(false)
  const [lastReceipt, setLastReceipt] = useState<string | null>(null)

  const selected = feeRecords.find((r) => r.id === selectedId)
  const pending = selected ? (selected.total_amount - selected.amount_paid) : 0

  return (
    <div className="max-w-md space-y-4">
      <div className="space-y-1.5">
        <Label>Select Fee Record</Label>
        <Select value={selectedId} onValueChange={(v) => setSelectedId(v ?? '')}>
          <SelectTrigger>
            <SelectValue placeholder="Choose student / fee" />
          </SelectTrigger>
          <SelectContent>
            {feeRecords.map((r) => (
              <SelectItem key={r.id} value={r.id}>
                {r.students?.full_name ?? '—'} — {r.fee_structures?.name ?? 'Fee'} ({formatCurrency(r.total_amount - r.amount_paid)} due)
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selected && (
        <Card>
          <CardContent className="pt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Student</span>
              <span className="font-medium">{selected.students?.full_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Fee</span>
              <span>{selected.fee_structures?.name ?? '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Due Date</span>
              <span>{formatDate(selected.due_date)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total</span>
              <span>{formatCurrency(selected.total_amount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Paid</span>
              <span className="text-green-600">{formatCurrency(selected.amount_paid)}</span>
            </div>
            <div className="flex justify-between font-medium border-t border-border pt-2">
              <span>Pending</span>
              <span className="text-red-600">{formatCurrency(pending)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status</span>
              <StatusBadge status={selected.status} />
            </div>

            {lastReceipt && (
              <div className="rounded bg-green-50 dark:bg-green-900/20 p-2 text-center text-xs text-green-700 dark:text-green-400">
                Payment recorded! Receipt: {lastReceipt}
                <Link href={`/fees/receipts/${selectedId}`} className="ml-2 underline">View Receipt</Link>
              </div>
            )}

            <Button className="w-full mt-2" onClick={() => setPayDialogOpen(true)} disabled={pending <= 0}>
              {pending <= 0 ? 'Fully Paid' : `Collect ${formatCurrency(pending)}`}
            </Button>
          </CardContent>
        </Card>
      )}

      {selected && (
        <PaymentDialog
          open={payDialogOpen}
          onOpenChange={setPayDialogOpen}
          feeRecordId={selected.id}
          pendingAmount={pending}
          studentName={selected.students?.full_name ?? ''}
          onSuccess={(receipt) => setLastReceipt(receipt)}
        />
      )}
    </div>
  )
}
