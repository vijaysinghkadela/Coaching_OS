'use client'

import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Plus, UserCheck } from 'lucide-react'
import Link from 'next/link'

const STAFF = [
  { id: 'st1', name: 'Dr. Rajesh Kumar', role: 'Physics Faculty', phone: '9876543001', salary: '₹45,000/mo', status: 'active' },
  { id: 'st2', name: 'Mrs. Sunita Sharma', role: 'Chemistry Faculty', phone: '9876543002', salary: '₹42,000/mo', status: 'active' },
  { id: 'st3', name: 'Mr. Amit Singh', role: 'Mathematics Faculty', phone: '9876543003', salary: '₹40,000/mo', status: 'active' },
  { id: 'st4', name: 'Dr. Priya Jain', role: 'Biology Faculty', phone: '9876543004', salary: '₹38,000/mo', status: 'active' },
  { id: 'st5', name: 'Mr. Vikram Patel', role: 'Admin Manager', phone: '9876543005', salary: '₹35,000/mo', status: 'active' },
  { id: 'st6', name: 'Ms. Neha Gupta', role: 'Student Counselor', phone: '9876543006', salary: '₹30,000/mo', status: 'inactive' },
]

export default function StaffPage() {
  return (
    <div className="space-y-6 p-6">
      <PageHeader title="Staff" description="Faculty and institute staff"
        action={<Link href="/staff/new"><Button size="sm"><Plus size={14} className="mr-1" />Add Staff</Button></Link>}
      />
      <div className="grid grid-cols-2 gap-3">
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold">{STAFF.length}</p><p className="text-xs text-muted-foreground mt-1">Total Staff</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-emerald-600">{STAFF.filter(s => s.status === 'active').length}</p><p className="text-xs text-muted-foreground mt-1">Active</p></CardContent></Card>
      </div>
      <div className="grid grid-cols-1 gap-3">
        {STAFF.map(s => (
          <Card key={s.id} className="hover:bg-accent/30 transition-colors">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0"><UserCheck size={18} className="text-primary" /></div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground">{s.name}</p>
                <p className="text-xs text-muted-foreground">{s.role} · {s.phone}</p>
              </div>
              <div className="text-right text-sm">
                <p className="font-medium text-foreground">{s.salary}</p>
                <Badge variant={s.status === 'active' ? 'default' : 'secondary'} className="text-xs cursor-default mt-1">{s.status === 'active' ? 'Active' : s.status}</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
