'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

const ROLES = [
  { value: 'teacher', label: 'Teacher' },
  { value: 'admin', label: 'Admin' },
  { value: 'receptionist', label: 'Receptionist' },
  { value: 'accountant', label: 'Accountant' },
  { value: 'support', label: 'Support Staff' },
]

export function AddStaffForm({ instituteId }: { instituteId: string }) {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    full_name: '',
    role: 'teacher',
    phone: '',
    email: '',
    salary_type: 'monthly',
    base_salary: '',
    joining_date: new Date().toISOString().split('T')[0],
  })
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.full_name.trim()) return
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.from('staff').insert({
      institute_id: instituteId,
      full_name: form.full_name.trim(),
      role: form.role,
      phone: form.phone || null,
      email: form.email || null,
      salary_type: form.salary_type,
      base_salary: form.base_salary ? Number(form.base_salary) : null,
      joining_date: form.joining_date,
      status: 'active',
    })
    setLoading(false)
    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Staff member added')
      router.push('/staff')
      router.refresh()
    }
  }

  return (
    <Card className="max-w-lg">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Full Name *</Label>
              <Input value={form.full_name} onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))} placeholder="Ramesh Kumar" required />
            </div>
            <div className="space-y-1.5">
              <Label>Role *</Label>
              <Select value={form.role} onValueChange={(v) => setForm((f) => ({ ...f, role: v ?? 'teacher' }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ROLES.map((r) => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Joining Date</Label>
              <Input type="date" value={form.joining_date} onChange={(e) => setForm((f) => ({ ...f, joining_date: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Phone</Label>
              <Input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} placeholder="9876543210" maxLength={10} />
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="ramesh@example.com" />
            </div>
            <div className="space-y-1.5">
              <Label>Salary Type</Label>
              <Select value={form.salary_type} onValueChange={(v) => setForm((f) => ({ ...f, salary_type: v ?? 'monthly' }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="hourly">Hourly</SelectItem>
                  <SelectItem value="per_session">Per Session</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Base Salary (₹)</Label>
              <Input type="number" min={0} value={form.base_salary} onChange={(e) => setForm((f) => ({ ...f, base_salary: e.target.value }))} placeholder="25000" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => router.back()}>Cancel</Button>
            <Button type="submit" className="flex-1" disabled={loading}>{loading ? 'Adding…' : 'Add Staff Member'}</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
