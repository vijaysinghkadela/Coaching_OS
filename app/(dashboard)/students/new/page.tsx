import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { PageHeader } from '@/components/shared/PageHeader'
import { EnrollmentForm } from '@/components/students/EnrollmentForm'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export default async function NewStudentPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: institute } = await supabase
    .from('institutes')
    .select('id')
    .eq('owner_id', user.id)
    .single()

  if (!institute) redirect('/signup')

  const [{ data: batches }, { data: courses }] = await Promise.all([
    supabase.from('batches').select('id, name').eq('institute_id', institute.id).eq('status', 'active').order('name'),
    supabase.from('courses').select('id, name').eq('institute_id', institute.id).eq('is_active', true).order('name'),
  ])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Enroll New Student"
        description="Fill in the details to enroll a new student"
        action={
          <Link href="/students">
            <Button variant="outline"><ArrowLeft size={14} className="mr-2" />Back</Button>
          </Link>
        }
      />
      <EnrollmentForm batches={batches ?? []} courses={courses ?? []} />
    </div>
  )
}
