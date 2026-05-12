import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { PageHeader } from '@/components/shared/PageHeader'
import { StudentTable } from '@/components/students/StudentTable'
import { Button } from '@/components/ui/button'
import { UserPlus } from 'lucide-react'

export default async function StudentsPage() {
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
    .select('id, enrollment_no, full_name, phone, gender, status, created_at, batches(name)')
    .eq('institute_id', institute.id)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Students"
        description="Manage enrolled students"
        action={
          <Link href="/students/new">
            <Button><UserPlus size={15} className="mr-2" />Enroll Student</Button>
          </Link>
        }
      />
      <StudentTable initialStudents={(students ?? []) as unknown as Parameters<typeof StudentTable>[0]['initialStudents']} />
    </div>
  )
}
