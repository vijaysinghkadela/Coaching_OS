'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createTest } from '@/lib/actions/tests'
import { toast } from 'sonner'
import { format } from 'date-fns'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

const TEST_TYPES = ['weekly', 'unit', 'mock', 'half_yearly', 'annual'] as const

export default function NewTestPage() {
  const [loading, setLoading] = useState(false)
  const [batchId, setBatchId] = useState('')
  const [testType, setTestType] = useState<typeof TEST_TYPES[number]>('unit')
  const [form, setForm] = useState({
    name: '',
    test_date: format(new Date(), 'yyyy-MM-dd'),
    max_marks: 100,
  })
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!batchId) { toast.error('Select a batch'); return }
    setLoading(true)
    const res = await createTest({ ...form, batch_id: batchId, test_type: testType })
    setLoading(false)
    if (res.error) toast.error(res.error)
    else { toast.success('Test created!'); router.push(`/tests/${res.id}`) }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="New Test"
        description="Create a new test and enter marks"
        action={<Link href="/tests"><Button variant="outline"><ArrowLeft size={14} className="mr-2" />Back</Button></Link>}
      />
      <form onSubmit={handleSubmit} className="max-w-md space-y-5">
        <div className="space-y-1.5">
          <Label>Test Name *</Label>
          <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Physics Unit Test 1" required />
        </div>
        <div className="space-y-1.5">
          <Label>Test Type</Label>
          <Select value={testType} onValueChange={(v) => setTestType(v as typeof testType)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {TEST_TYPES.map((t) => <SelectItem key={t} value={t} className="capitalize">{t.replace('_', ' ')}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Batch *</Label>
          <BatchSelectAsync value={batchId} onChange={setBatchId} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Test Date</Label>
            <Input type="date" value={form.test_date} onChange={(e) => setForm((f) => ({ ...f, test_date: e.target.value }))} />
          </div>
          <div className="space-y-1.5">
            <Label>Max Marks</Label>
            <Input type="number" min={1} value={form.max_marks} onChange={(e) => setForm((f) => ({ ...f, max_marks: Number(e.target.value) }))} />
          </div>
        </div>
        <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Creating…' : 'Create Test'}</Button>
      </form>
    </div>
  )
}

// Client-side batch fetcher using a server action pattern via API
function BatchSelectAsync({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  // In real use, this would be populated server-side; for now a placeholder
  return (
    <Input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Batch UUID (from /batches)"
      className="font-mono text-xs"
    />
  )
}
