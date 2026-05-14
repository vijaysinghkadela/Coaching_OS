'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { PageHeader } from '@/components/shared/PageHeader'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { DEMO_BATCHES, DEMO_STUDENTS, DEMO_COURSES } from '@/lib/demo/data'

export default function BatchDetailPage() {
  const params = useParams()
  const id = params.id as string
  const batch = DEMO_BATCHES.find(b => b.id === id)
  if (!batch) return <div className="p-6 text-muted-foreground">Batch not found</div>
  const students = DEMO_STUDENTS.filter(s => s.batch_id === id)
  const course = DEMO_COURSES.find(c => c.id === batch.course_id)

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Link href="/batches"><Button variant="ghost" size="icon"><ArrowLeft size={16} /></Button></Link>
        <PageHeader title={batch.name} description={`${course?.name ?? 'Course'} · ${batch.academic_year}`} />
        <Badge variant={batch.status === 'active' ? 'default' : 'secondary'}>{batch.status}</Badge>
      </div>
      <Tabs defaultValue="students">
        <TabsList>
          <TabsTrigger value="students">Students ({students.length})</TabsTrigger>
          <TabsTrigger value="info">Info</TabsTrigger>
        </TabsList>
        <TabsContent value="students" className="mt-4">
          <div className="rounded-lg border">
            <table className="w-full text-sm">
              <thead><tr className="border-b"><th className="text-left p-3">Name</th><th className="text-left p-3">Phone</th><th className="text-left p-3">Status</th></tr></thead>
              <tbody className="divide-y">
                {students.map(s => (
                  <tr key={s.id}>
                    <td className="p-3 font-medium">{s.full_name}</td>
                    <td className="p-3 text-muted-foreground">{s.phone}</td>
                    <td className="p-3"><Badge variant={s.status === 'active' ? 'default' : 'secondary'}>{s.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
        <TabsContent value="info" className="mt-4 text-muted-foreground text-sm">
          Capacity: {batch.capacity} students · Course: {course?.name ?? '—'}
        </TabsContent>
      </Tabs>
    </div>
  )
}
