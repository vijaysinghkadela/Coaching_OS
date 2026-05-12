import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PageHeader } from '@/components/shared/PageHeader'
import { StudyPlanGenerator } from './StudyPlanGenerator'

export default async function StudyPlansPage() {
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
    .select('id, full_name, enrollment_no, batches(name), courses(name)')
    .eq('institute_id', institute.id)
    .eq('status', 'active')
    .order('full_name')

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Study Plans"
        description="Generate personalized weekly study schedules using Claude AI"
      />
      <StudyPlanGenerator students={(students ?? []) as unknown as Parameters<typeof StudyPlanGenerator>[0]['students']} />
    </div>
  )
}
