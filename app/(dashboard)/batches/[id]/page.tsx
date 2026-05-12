import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { PageHeader } from '@/components/shared/PageHeader'
import { TimetableGrid } from '@/components/batches/TimetableGrid'
import { StudentTable } from '@/components/students/StudentTable'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export default async function BatchDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: institute } = await supabase.from('institutes').select('id').eq('owner_id', user.id).single()
  if (!institute) redirect('/signup')

  const { data: batch } = await supabase
    .from('batches')
    .select('*, courses(name)')
    .eq('id', id)
    .eq('institute_id', institute.id)
    .single()

  if (!batch) notFound()

  const [slotsRes, studentsRes, teachersRes, roomsRes] = await Promise.all([
    supabase
      .from('timetable_slots')
      .select('id, subject, day_of_week, start_time, end_time, teachers(full_name), rooms(name)')
      .eq('batch_id', id)
      .order('day_of_week').order('start_time'),
    supabase
      .from('students')
      .select('id, enrollment_no, full_name, phone, gender, status, created_at, batches(name)')
      .eq('batch_id', id)
      .eq('institute_id', institute.id)
      .order('full_name'),
    supabase.from('teachers').select('id, full_name').eq('institute_id', institute.id).eq('is_active', true),
    supabase.from('rooms').select('id, name').eq('institute_id', institute.id).eq('is_active', true),
  ])

  const course = (batch.courses as unknown as { name: string }[] | null)?.[0] ?? null

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/batches">
          <Button variant="outline" size="sm"><ArrowLeft size={14} className="mr-1" />Batches</Button>
        </Link>
      </div>

      <PageHeader
        title={batch.name}
        description={`${batch.academic_year}${course ? ` · ${course.name}` : ''}`}
        action={<Badge variant={batch.status === 'active' ? 'default' : 'secondary'}>{batch.status}</Badge>}
      />

      <Tabs defaultValue="timetable">
        <TabsList>
          <TabsTrigger value="timetable">Timetable</TabsTrigger>
          <TabsTrigger value="students">Students ({studentsRes.data?.length ?? 0})</TabsTrigger>
        </TabsList>
        <TabsContent value="timetable" className="mt-4">
          <TimetableGrid
            batchId={id}
            slots={(slotsRes.data ?? []) as unknown as Parameters<typeof TimetableGrid>[0]['slots']}
            teachers={teachersRes.data ?? []}
            rooms={roomsRes.data ?? []}
          />
        </TabsContent>
        <TabsContent value="students" className="mt-4">
          <StudentTable initialStudents={(studentsRes.data ?? []) as unknown as Parameters<typeof StudentTable>[0]['initialStudents']} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
