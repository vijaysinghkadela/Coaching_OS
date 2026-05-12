import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/shared/EmptyState'
import { Badge } from '@/components/ui/badge'
import { FileText, Plus } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export default async function TestsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: institute } = await supabase.from('institutes').select('id').eq('owner_id', user.id).single()
  if (!institute) redirect('/signup')

  const { data: tests } = await supabase
    .from('tests')
    .select('id, name, test_type, test_date, max_marks, batches(name)')
    .eq('institute_id', institute.id)
    .order('test_date', { ascending: false })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tests"
        description="Create and manage tests, track student performance"
        action={
          <Link href="/tests/new">
            <Button><Plus size={15} className="mr-2" />New Test</Button>
          </Link>
        }
      />

      {!tests || tests.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No tests yet"
          description="Create your first test to start tracking student performance."
          action={<Link href="/tests/new"><Button>Create Test</Button></Link>}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tests.map((test) => {
            const batch = (test.batches as unknown as { name: string }[] | null)?.[0] ?? null
            return (
              <Link key={test.id} href={`/tests/${test.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start gap-2">
                      <CardTitle className="text-base leading-tight">{test.name}</CardTitle>
                      <Badge variant="secondary" className="capitalize text-xs shrink-0">{test.test_type?.replace('_', ' ')}</Badge>
                    </div>
                    {batch && <p className="text-xs text-muted-foreground">{batch.name}</p>}
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground flex justify-between">
                    <span>{formatDate(test.test_date)}</span>
                    <span>Max: {test.max_marks}</span>
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
