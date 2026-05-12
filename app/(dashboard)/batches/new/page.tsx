'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { createBatch } from '@/lib/actions/batches'
import { currentAcademicYear } from '@/lib/utils'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function NewBatchPage() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const [form, setForm] = useState({
    name: '',
    academic_year: currentAcademicYear(),
    capacity: 30,
    start_date: '',
    end_date: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const res = await createBatch(form)
    setLoading(false)
    if (res.error) toast.error(res.error)
    else { toast.success('Batch created!'); router.push(`/batches/${res.id}`) }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="New Batch"
        description="Create a new student batch"
        action={
          <Link href="/batches">
            <Button variant="outline"><ArrowLeft size={14} className="mr-2" />Back</Button>
          </Link>
        }
      />
      <form onSubmit={handleSubmit} className="max-w-md space-y-5">
        <div className="space-y-1.5">
          <Label>Batch Name *</Label>
          <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Class 11 Science A" required />
        </div>
        <div className="space-y-1.5">
          <Label>Academic Year *</Label>
          <Input value={form.academic_year} onChange={(e) => setForm((f) => ({ ...f, academic_year: e.target.value }))} placeholder="2025-26" required />
        </div>
        <div className="space-y-1.5">
          <Label>Capacity *</Label>
          <Input type="number" min={1} max={500} value={form.capacity} onChange={(e) => setForm((f) => ({ ...f, capacity: Number(e.target.value) }))} required />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Start Date</Label>
            <Input type="date" value={form.start_date} onChange={(e) => setForm((f) => ({ ...f, start_date: e.target.value }))} />
          </div>
          <div className="space-y-1.5">
            <Label>End Date</Label>
            <Input type="date" value={form.end_date} onChange={(e) => setForm((f) => ({ ...f, end_date: e.target.value }))} />
          </div>
        </div>
        <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Creating…' : 'Create Batch'}</Button>
      </form>
    </div>
  )
}
