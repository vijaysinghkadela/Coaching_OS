'use client'

import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { IndianRupee } from 'lucide-react'
import { DEMO_FEE_STRUCTURES, DEMO_COURSES } from '@/lib/demo/data'
import { formatCurrency } from '@/lib/utils'

export default function FeeStructuresPage() {
  return (
    <div className="space-y-6 p-6">
      <PageHeader title="Fee Structures" description="Fee templates for courses" />
      <div className="grid grid-cols-1 gap-3">
        {DEMO_FEE_STRUCTURES.length === 0 ? (
          <Card><CardContent className="py-12 text-center"><IndianRupee size={32} className="mx-auto text-muted-foreground mb-3" /><p className="text-muted-foreground">No fee structures yet.</p></CardContent></Card>
        ) : DEMO_FEE_STRUCTURES.map(s => {
          const course = DEMO_COURSES.find(c => c.id === s.course_id)
          return (
            <Card key={s.id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div><p className="font-medium">{s.name}</p><p className="text-xs text-muted-foreground">{course?.name ?? '—'} · {s.installments} installment{s.installments > 1 ? 's' : ''} {s.gst_rate > 0 && <Badge variant="outline" className="ml-1">GST {s.gst_rate}%</Badge>}</p></div>
                <p className="text-lg font-bold">{formatCurrency(s.total_amount)}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
