'use client'

import { useState } from 'react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Search, Plus } from 'lucide-react'
import Link from 'next/link'
import { DEMO_STUDENTS, DEMO_BATCHES } from '@/lib/demo/data'

export default function StudentsPage() {
  const [search, setSearch] = useState('')
  const filtered = DEMO_STUDENTS.filter(s =>
    s.full_name.toLowerCase().includes(search.toLowerCase()) ||
    s.enrollment_no.toLowerCase().includes(search.toLowerCase())
  )
  const active = DEMO_STUDENTS.filter(s => s.status === 'active').length

  return (
    <div className="space-y-6 p-6">
      <PageHeader title="Students" description={`${DEMO_STUDENTS.length} total · ${active} active`}
        action={<Link href="/students/new"><Button size="sm"><Plus size={14} className="mr-1" />Add Student</Button></Link>}
      />
      <div className="grid grid-cols-3 gap-3">
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold">{DEMO_STUDENTS.length}</p><p className="text-xs text-muted-foreground mt-1">Total Students</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-emerald-600">{active}</p><p className="text-xs text-muted-foreground mt-1">Active</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-muted-foreground">{DEMO_STUDENTS.length - active}</p><p className="text-xs text-muted-foreground mt-1">Inactive</p></CardContent></Card>
      </div>
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search by name or enrollment..." className="pl-8 h-9" value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30 text-muted-foreground text-xs uppercase tracking-wider">
                <th className="text-left p-3 font-medium">Name</th>
                <th className="text-left p-3 font-medium">Enrollment</th>
                <th className="text-left p-3 font-medium">Phone</th>
                <th className="text-left p-3 font-medium">Batch</th>
                <th className="text-left p-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map(s => {
                const batch = DEMO_BATCHES.find(b => b.id === s.batch_id)
                return (
                  <tr key={s.id} className="hover:bg-accent/30 transition-colors">
                    <td className="p-3"><Link href={`/students/${s.id}`} className="font-medium hover:text-primary transition-colors">{s.full_name}</Link></td>
                    <td className="p-3 text-muted-foreground font-mono text-xs">{s.enrollment_no}</td>
                    <td className="p-3 text-muted-foreground">{s.phone}</td>
                    <td className="p-3">{batch?.name ?? <span className="text-muted-foreground">—</span>}</td>
                    <td className="p-3"><Badge variant={s.status === 'active' ? 'default' : 'secondary'} className="text-xs cursor-default">{s.status === 'active' ? 'Active' : s.status}</Badge></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
