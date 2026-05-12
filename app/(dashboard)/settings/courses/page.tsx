import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PageHeader } from '@/components/shared/PageHeader'
import { CoursesManager } from './CoursesManager'

export default async function CoursesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: institute } = await supabase
    .from('institutes')
    .select('id')
    .eq('owner_id', user.id)
    .single()
  if (!institute) redirect('/signup')

  const { data: courses } = await supabase
    .from('courses')
    .select('id, name, subjects, duration_months, is_active')
    .eq('institute_id', institute.id)
    .order('name')

  return (
    <div className="space-y-6">
      <PageHeader title="Courses" description="Manage the courses offered at your institute" />
      <CoursesManager courses={courses ?? []} instituteId={institute.id} />
    </div>
  )
}
