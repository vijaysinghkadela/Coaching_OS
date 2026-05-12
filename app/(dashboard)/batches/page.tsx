import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Users, BookOpen } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/shared/EmptyState'

export default async function BatchesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: institute } = await supabase.from('institutes').select('id').eq('owner_id', user.id).single()
  if (!institute) redirect('/signup')

  const { data: batches } = await supabase
    .from('batches')
    .select('id, name, academic_year, capacity, status, courses(name)')
    .eq('institute_id', institute.id)
    .order('created_at', { ascending: false })

  // Get student count per batch
  const { data: studentCounts } = await supabase
    .from('students')
    .select('batch_id')
    .eq('institute_id', institute.id)
    .eq('status', 'active')
    .not('batch_id', 'is', null)

  const countMap = new Map<string, number>()
  for (const s of studentCounts ?? []) {
    if (s.batch_id) countMap.set(s.batch_id, (countMap.get(s.batch_id) ?? 0) + 1)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Batches"
        description="Manage course batches and timetables"
        action={
          <Link href="/batches/new">
            <Button><Plus size={15} className="mr-2" />New Batch</Button>
          </Link>
        }
      />

      {!batches || batches.length === 0 ? (
        <EmptyState icon={BookOpen} title="No batches yet" description="Create your first batch to start organizing students and timetables."
          action={<Link href="/batches/new"><Button>Create Batch</Button></Link>}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {batches.map((batch) => {
            const enrolled = countMap.get(batch.id) ?? 0
            const course = (batch.courses as unknown as { name: string }[] | null)?.[0] ?? null
            return (
              <Link key={batch.id} href={`/batches/${batch.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-base">{batch.name}</CardTitle>
                      <Badge variant={batch.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                        {batch.status}
                      </Badge>
                    </div>
                    {course && <p className="text-xs text-muted-foreground">{course.name}</p>}
                  </CardHeader>
                  <CardContent className="flex gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users size={13} />
                      <span>{enrolled}/{batch.capacity}</span>
                    </div>
                    <span>{batch.academic_year}</span>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
