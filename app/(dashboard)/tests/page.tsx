'use client'

import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { DEMO_TESTS, DEMO_BATCHES } from '@/lib/demo/data'

export default function TestsPage() {
  return (
    <div className="space-y-6 p-6">
      <PageHeader title="Tests" description="Manage tests and exams"
        action={<Link href="/tests/new"><Button size="sm"><Plus size={14} className="mr-1" />New Test</Button></Link>}
      />
      <div className="grid grid-cols-1 gap-3">
        {DEMO_TESTS.map(t => {
          const batch = DEMO_BATCHES.find(b => b.id === t.batch_id)
          return (
            <Link key={t.id} href={`/tests/${t.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4 flex items-center justify-between">
                  <div><p className="font-medium">{t.name}</p><p className="text-xs text-muted-foreground">{t.test_type} · {batch?.name ?? '—'} · {t.test_date}</p></div>
                  <div className="text-right"><p className="text-sm font-medium">{t.max_marks} marks</p><Badge variant="outline" className="text-xs">{t.test_type}</Badge></div>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
