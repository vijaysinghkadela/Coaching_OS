import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { ReceiptTemplate } from '@/components/fees/ReceiptTemplate'
import { PrintWrapper } from '@/components/shared/PrintWrapper'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function ReceiptPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: institute } = await supabase
    .from('institutes')
    .select('id, name, city, gstin')
    .eq('owner_id', user.id)
    .single()
  if (!institute) redirect('/signup')

  // Get the latest payment transaction for this fee record
  const { data: transaction } = await supabase
    .from('payment_transactions')
    .select('*, fee_records(total_amount, amount_paid, due_date, fee_structures(name, gst_rate, base_amount, gst_amount), students(full_name, enrollment_no))')
    .eq('fee_record_id', id)
    .eq('status', 'completed')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (!transaction) notFound()

  const feeRecord = transaction.fee_records as {
    total_amount: number
    amount_paid: number
    fee_structures: { name: string; gst_rate: number; base_amount: number; gst_amount: number } | null
    students: { full_name: string; enrollment_no: string } | null
  } | null

  const receiptData = {
    receiptNumber: transaction.receipt_number ?? '',
    paymentDate: transaction.payment_date ?? transaction.created_at,
    studentName: feeRecord?.students?.full_name ?? '—',
    enrollmentNo: feeRecord?.students?.enrollment_no ?? '—',
    instituteName: institute.name,
    instituteAddress: institute.city,
    gstin: institute.gstin ?? undefined,
    feeName: feeRecord?.fee_structures?.name ?? 'Fee',
    baseAmount: feeRecord?.fee_structures?.base_amount ?? (feeRecord?.total_amount ?? 0),
    gstRate: feeRecord?.fee_structures?.gst_rate ?? 0,
    gstAmount: feeRecord?.fee_structures?.gst_amount ?? 0,
    totalAmount: feeRecord?.total_amount ?? 0,
    amountPaid: transaction.amount ?? 0,
    paymentMethod: transaction.payment_method ?? 'cash',
    referenceNumber: transaction.reference_number ?? undefined,
  }

  return (
    <div className="space-y-4">
      <Link href="/fees">
        <Button variant="outline" size="sm"><ArrowLeft size={14} className="mr-1" />Fees</Button>
      </Link>
      <PrintWrapper>
        <ReceiptTemplate data={receiptData} />
      </PrintWrapper>
    </div>
  )
}
