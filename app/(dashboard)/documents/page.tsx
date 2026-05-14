'use client'

import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FileText, Download, Upload, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useState } from 'react'

const DOCS = [
  { id: 'd1', name: 'Student ID Cards Template', category: 'forms', size: '245 KB', updated: '2026-05-10' },
  { id: 'd2', name: 'Fee Receipt Format', category: 'forms', size: '120 KB', updated: '2026-05-08' },
  { id: 'd3', name: 'Attendance Sheet April 2026', category: 'reports', size: '890 KB', updated: '2026-05-01' },
  { id: 'd4', name: 'Institute Brochure 2026-27', category: 'marketing', size: '2.1 MB', updated: '2026-04-28' },
  { id: 'd5', name: 'Parent Consent Form', category: 'forms', size: '180 KB', updated: '2026-04-25' },
]

export default function DocumentsPage() {
  const [search, setSearch] = useState('')
  const filtered = DOCS.filter(d => d.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="space-y-6 p-6">
      <PageHeader title="Documents" description="Upload and manage institute documents"
        action={<Button size="sm"><Upload size={14} className="mr-1" />Upload</Button>}
      />
      <div className="relative">
        <Search size={14} className="absolute left-3 top-3 text-muted-foreground" />
        <Input placeholder="Search documents..." className="pl-8" value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      <Card>
        <CardContent className="p-0">
          <div className="divide-y text-sm">
            {filtered.map(d => (
              <div key={d.id} className="p-4 flex items-center gap-3">
                <FileText size={16} className="text-primary shrink-0" />
                <div className="flex-1 min-w-0"><p className="font-medium">{d.name}</p><p className="text-xs text-muted-foreground">{d.category} · {d.size} · {d.updated}</p></div>
                <Badge variant="outline" className="text-xs">{d.category}</Badge>
                <Button variant="ghost" size="icon" className="h-7 w-7"><Download size={13} /></Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
