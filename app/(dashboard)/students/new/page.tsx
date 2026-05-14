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
import { DEMO_BATCHES, DEMO_COURSES } from '@/lib/demo/data'

export default function NewStudentPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ full_name: '', phone: '', parent_phone: '', gender: 'male', batch_id: '', course_id: '' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await new Promise(r => setTimeout(r, 1000))
    toast.success('Student enrolled successfully!')
    setLoading(false)
    router.push('/students')
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <Link href="/students"><Button variant="ghost" size="icon"><ArrowLeft size={16} /></Button></Link>
        <PageHeader title="Enroll New Student" description="Add a student to the institute" />
      </div>
      <Card className="max-w-2xl">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><Label>Full Name</Label><Input value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} required placeholder="e.g. Rahul Sharma" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Phone</Label><Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} required placeholder="9876543210" /></div>
              <div><Label>Parent Phone</Label><Input value={form.parent_phone} onChange={e => setForm({ ...form, parent_phone: e.target.value })} placeholder="9876543211" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Gender</Label><Select value={form.gender} onValueChange={v => v && setForm({ ...form, gender: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="male">Male</SelectItem><SelectItem value="female">Female</SelectItem></SelectContent></Select></div>
              <div><Label>Batch</Label><Select value={form.batch_id} onValueChange={v => v && setForm({ ...form, batch_id: v })}><SelectTrigger><SelectValue placeholder="Select batch" /></SelectTrigger><SelectContent>{DEMO_BATCHES.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent></Select></div>
            </div>
            <div><Label>Course</Label><Select value={form.course_id} onValueChange={v => v && setForm({ ...form, course_id: v })}><SelectTrigger><SelectValue placeholder="Select course" /></SelectTrigger><SelectContent>{DEMO_COURSES.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select></div>
            <Button type="submit" disabled={loading}>{loading ? 'Enrolling...' : 'Enroll Student'}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
