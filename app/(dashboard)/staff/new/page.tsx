import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PageHeader } from '@/components/shared/PageHeader'
import { AddStaffForm } from './AddStaffForm'

export default async function NewStaffPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: institute } = await supabase
    .from('institutes')
    .select('id, plan_tier')
    .eq('owner_id', user.id)
    .single()
  if (!institute) redirect('/signup')
  if (institute.plan_tier !== 'pro') redirect('/staff')

  return (
    <div className="space-y-6">
      <PageHeader title="Add Staff Member" description="Add a teacher or non-teaching staff member" />
      <AddStaffForm instituteId={institute.id} />
    </div>
  )
}
