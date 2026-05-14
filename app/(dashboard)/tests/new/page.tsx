'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { DEMO_BATCHES } from '@/lib/demo/data'

const TEST_TYPES = ['unit', 'half_yearly', 'full_syllabus', 'mock', 'weekly'] as const

export default function NewTestPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ name: '', batch_id: '', test_type: 'unit' as typeof TEST_TYPES[number], max_marks: 100, test_date: '' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await new Promise(r => setTimeout(r, 1000))
    toast.success('Test created!')
    setLoading(false)
    router.push('/tests')
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <Link href="/tests"><Button variant="ghost" size="icon"><ArrowLeft size={16} /></Button></Link>
        <PageHeader title="New Test" description="Schedule a new test" />
      </div>
      <Card className="max-w-xl">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><Label>Test Name</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required placeholder="e.g. Physics Unit Test 2" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Batch</Label><Select value={form.batch_id} onValueChange={v => v && setForm({ ...form, batch_id: v })}><SelectTrigger><SelectValue placeholder="Select batch" /></SelectTrigger><SelectContent>{DEMO_BATCHES.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent></Select></div>
              <div><Label>Type</Label><Select value={form.test_type} onValueChange={v => setForm({ ...form, test_type: v as typeof TEST_TYPES[number] })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{TEST_TYPES.map(t => <SelectItem key={t} value={t}>{t.replace('_', ' ')}</SelectItem>)}</SelectContent></Select></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Max Marks</Label><Input type="number" value={form.max_marks} onChange={e => setForm({ ...form, max_marks: +e.target.value })} /></div>
              <div><Label>Date</Label><Input type="date" value={form.test_date} onChange={e => setForm({ ...form, test_date: e.target.value })} /></div>
            </div>
            <Button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create Test'}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
