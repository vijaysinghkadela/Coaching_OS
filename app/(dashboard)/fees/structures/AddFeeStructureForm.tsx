'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { createFeeStructure } from '@/lib/actions/fees'

interface Course { id: string; name: string }

export function AddFeeStructureForm({ courses }: { courses: Course[] }) {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '',
    course_id: '',
    total_amount: '',
    gst_rate: '0',
    installments: '1',
    description: '',
  })
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const res = await createFeeStructure({
      name: form.name,
      course_id: form.course_id || undefined,
      total_amount: Number(form.total_amount),
      gst_rate: Number(form.gst_rate),
      installments: Number(form.installments),
      description: form.description || undefined,
    })
    setLoading(false)
    if (res.error) {
      toast.error(res.error)
    } else {
      toast.success('Fee structure created')
      setForm({ name: '', course_id: '', total_amount: '', gst_rate: '0', installments: '1', description: '' })
      router.refresh()
    }
  }

  return (
    <Card>
      <CardHeader className="pb-2"><CardTitle className="text-sm">New Fee Structure</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1.5">
            <Label>Name *</Label>
            <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Annual Fee 2025-26" required />
          </div>
          <div className="space-y-1.5">
            <Label>Course (optional)</Label>
            <Select value={form.course_id} onValueChange={(v) => setForm((f) => ({ ...f, course_id: v ?? '' }))}>
              <SelectTrigger><SelectValue placeholder="Any course" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any course</SelectItem>
                {courses.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Total Amount (₹) *</Label>
            <Input type="number" min={1} value={form.total_amount} onChange={(e) => setForm((f) => ({ ...f, total_amount: e.target.value }))} placeholder="12000" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>GST Rate %</Label>
              <Select value={form.gst_rate} onValueChange={(v) => setForm((f) => ({ ...f, gst_rate: v ?? '0' }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">0% (Exempt)</SelectItem>
                  <SelectItem value="5">5%</SelectItem>
                  <SelectItem value="12">12%</SelectItem>
                  <SelectItem value="18">18%</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Installments</Label>
              <Select value={form.installments} onValueChange={(v) => setForm((f) => ({ ...f, installments: v ?? '1' }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[1,2,3,4,6,12].map((n) => (
                    <SelectItem key={n} value={String(n)}>{n === 1 ? 'One-time' : `${n} payments`}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Description</Label>
            <Textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={2} placeholder="Optional notes" />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Creating…' : 'Create Fee Structure'}</Button>
        </form>
      </CardContent>
    </Card>
  )
}
