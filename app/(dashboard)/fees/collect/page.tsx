import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PageHeader } from '@/components/shared/PageHeader'
import { FeeCollectClient } from './FeeCollectClient'

interface SearchParams { record?: string; student?: string }

export default async function CollectFeePage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: institute } = await supabase.from('institutes').select('id').eq('owner_id', user.id).single()
  if (!institute) redirect('/signup')

  // Fetch pending fee records for the institute
  const { data: feeRecords } = await supabase
    .from('fee_records')
    .select('id, total_amount, amount_paid, due_date, status, fee_structures(name), students(id, full_name, enrollment_no)')
    .eq('institute_id', institute.id)
    .in('status', ['pending', 'partial', 'overdue'])
    .order('due_date')

  const preselectedRecord = params.record

  return (
    <div className="space-y-6">
      <PageHeader title="Collect Fee" description="Record a fee payment" />
      <FeeCollectClient feeRecords={(feeRecords ?? []) as unknown as Parameters<typeof FeeCollectClient>[0]['feeRecords']} preselectedId={preselectedRecord} />
    </div>
  )
}
