import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { PageHeader } from '@/components/shared/PageHeader'
import { MarksEntryGrid } from '@/components/tests/MarksEntryGrid'
import { ClassRankTable } from '@/components/tests/ClassRankTable'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'

export default async function TestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: institute } = await supabase.from('institutes').select('id').eq('owner_id', user.id).single()
  if (!institute) redirect('/signup')

  const { data: test } = await supabase
    .from('tests')
    .select('*, batches(name)')
    .eq('id', id)
    .eq('institute_id', institute.id)
    .single()

  if (!test) notFound()

  const [studentsRes, scoresRes] = await Promise.all([
    supabase
      .from('students')
      .select('id, full_name, enrollment_no')
      .eq('batch_id', test.batch_id)
      .eq('status', 'active')
      .order('full_name'),
    supabase
      .from('test_scores')
      .select('student_id, marks_obtained, max_marks, rank_in_batch, percentile, is_absent, students(full_name, enrollment_no)')
      .eq('test_id', id),
  ])

  const batch = (test.batches as unknown as { name: string }[] | null)?.[0] ?? null

  return (
    <div className="space-y-6">
      <Link href="/tests">
        <Button variant="outline" size="sm"><ArrowLeft size={14} className="mr-1" />Tests</Button>
      </Link>

      <PageHeader
        title={test.name}
        description={`${batch?.name ?? ''} · ${formatDate(test.test_date)} · Max: ${test.max_marks}`}
        action={<Badge variant="secondary" className="capitalize">{test.test_type?.replace('_', ' ')}</Badge>}
      />

      <Tabs defaultValue="entry">
        <TabsList>
          <TabsTrigger value="entry">Enter Marks</TabsTrigger>
          <TabsTrigger value="ranks">Results &amp; Ranks</TabsTrigger>
        </TabsList>
        <TabsContent value="entry" className="mt-4">
          <MarksEntryGrid
            testId={id}
            maxMarks={test.max_marks}
            students={studentsRes.data ?? []}
            existing={(scoresRes.data ?? []).map((s) => ({
              student_id: s.student_id,
              marks_obtained: s.marks_obtained,
              is_absent: s.is_absent ?? false,
            }))}
          />
        </TabsContent>
        <TabsContent value="ranks" className="mt-4">
          {scoresRes.data && scoresRes.data.length > 0 ? (
            <ClassRankTable scores={scoresRes.data as unknown as Parameters<typeof ClassRankTable>[0]['scores']} />
          ) : (
            <p className="text-sm text-muted-foreground">Enter marks first to see the rank table.</p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
