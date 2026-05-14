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

export default function NewStaffPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ full_name: '', role: 'faculty', phone: '', email: '', salary_type: 'monthly', base_salary: 0 })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await new Promise(r => setTimeout(r, 1000))
    toast.success('Staff member added!')
    setLoading(false)
    router.push('/staff')
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <Link href="/staff"><Button variant="ghost" size="icon"><ArrowLeft size={16} /></Button></Link>
        <PageHeader title="Add Staff" description="Add a new faculty or staff member" />
      </div>
      <Card className="max-w-xl">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><Label>Full Name</Label><Input value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} required placeholder="e.g. Dr. Rajesh Kumar" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Role</Label><Select value={form.role} onValueChange={v => v && setForm({ ...form, role: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="faculty">Faculty</SelectItem><SelectItem value="admin">Admin</SelectItem><SelectItem value="counselor">Counselor</SelectItem><SelectItem value="accountant">Accountant</SelectItem></SelectContent></Select></div>
              <div><Label>Salary Type</Label><Select value={form.salary_type} onValueChange={v => v && setForm({ ...form, salary_type: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="monthly">Monthly</SelectItem><SelectItem value="hourly">Hourly</SelectItem><SelectItem value="contract">Contract</SelectItem></SelectContent></Select></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Phone</Label><Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="9876543210" /></div>
              <div><Label>Base Salary</Label><Input type="number" value={form.base_salary || ''} onChange={e => setForm({ ...form, base_salary: +e.target.value })} /></div>
            </div>
            <Button type="submit" disabled={loading}>{loading ? 'Adding...' : 'Add Staff Member'}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
