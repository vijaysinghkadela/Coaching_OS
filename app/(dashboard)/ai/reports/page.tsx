import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PageHeader } from '@/components/shared/PageHeader'
import { ParentReportGenerator } from '@/components/ai/ParentReportGenerator'

export default async function AIReportsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: institute } = await supabase
    .from('institutes')
    .select('id')
    .eq('owner_id', user.id)
    .single()
  if (!institute) redirect('/signup')

  const { data: students } = await supabase
    .from('students')
    .select('id, full_name, enrollment_no, batches(name)')
    .eq('institute_id', institute.id)
    .eq('status', 'active')
    .order('full_name')

  return (
    <div className="space-y-6">
      <PageHeader title="AI Parent Reports" description="Generate personalized progress reports using Claude AI" />
      <ParentReportGenerator students={(students ?? []) as unknown as Parameters<typeof ParentReportGenerator>[0]['students']} />
    </div>
  )
}
