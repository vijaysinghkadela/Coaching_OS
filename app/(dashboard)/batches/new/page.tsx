'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { currentAcademicYear } from '@/lib/utils'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function NewBatchPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ name: '', academic_year: currentAcademicYear(), capacity: 30 })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await new Promise(r => setTimeout(r, 1000))
    toast.success('Batch created!')
    setLoading(false)
    router.push('/batches')
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <Link href="/batches"><Button variant="ghost" size="icon"><ArrowLeft size={16} /></Button></Link>
        <PageHeader title="New Batch" description="Create a new student batch" />
      </div>
      <Card className="max-w-xl">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><Label>Batch Name</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required placeholder="e.g. JEE 2027 Evening" /></div>
            <div><Label>Academic Year</Label><Input value={form.academic_year} onChange={e => setForm({ ...form, academic_year: e.target.value })} /></div>
            <div><Label>Capacity</Label><Input type="number" value={form.capacity} onChange={e => setForm({ ...form, capacity: +e.target.value })} /></div>
            <Button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create Batch'}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
