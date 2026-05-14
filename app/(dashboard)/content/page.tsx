'use client'

import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FileText, Video, Download, Plus, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useState } from 'react'

const RESOURCES = [
  { id: 'r1', title: 'Rotational Motion Complete Notes', type: 'pdf', subject: 'Physics', size: '2.4 MB', downloads: 42, uploaded: '2025-10-15', tags: ['JEE', 'Mechanics'] },
  { id: 'r2', title: 'Organic Chemistry Reaction Mechanisms', type: 'video', subject: 'Chemistry', size: '180 MB', downloads: 38, uploaded: '2025-10-20', tags: ['JEE', 'Organic'] },
  { id: 'r3', title: 'NEET Biology NCERT Summary Ch 1-5', type: 'pdf', subject: 'Biology', size: '1.8 MB', downloads: 31, uploaded: '2025-10-22', tags: ['NEET', 'NCERT'] },
  { id: 'r4', title: 'Trigonometry Formula Sheet', type: 'pdf', subject: 'Mathematics', size: '340 KB', downloads: 55, uploaded: '2025-11-01', tags: ['10th', 'Formulas'] },
  { id: 'r5', title: 'Calculus Practice Set (100 problems)', type: 'pdf', subject: 'Mathematics', size: '1.2 MB', downloads: 29, uploaded: '2025-11-05', tags: ['JEE', 'Practice'] },
  { id: 'r6', title: 'Human Physiology Diagram Bank', type: 'image', subject: 'Biology', size: '8.5 MB', downloads: 24, uploaded: '2025-11-05', tags: ['NEET', 'Diagrams'] },
]

const TYPE_ICONS: Record<string, React.ReactNode> = {
  pdf: <FileText size={14} className="text-red-500" />,
  video: <Video size={14} className="text-blue-500" />,
  image: <div className="w-3.5 h-3.5 rounded bg-green-500" />,
}

export default function ContentPage() {
  const [search, setSearch] = useState('')
  const filtered = RESOURCES.filter(r => r.title.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="space-y-6 p-6">
      <PageHeader title="Content Library" description="Study materials and resources"
        action={<Button size="sm"><Plus size={14} className="mr-1" />Upload</Button>}
      />
      <div className="grid grid-cols-3 gap-3">
        <Card><CardContent className="p-3 text-center"><p className="text-2xl font-bold">{RESOURCES.length}</p><p className="text-xs text-muted-foreground">Resources</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-2xl font-bold">3</p><p className="text-xs text-muted-foreground">Modules</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-2xl font-bold">{RESOURCES.reduce((a, r) => a + r.downloads, 0)}</p><p className="text-xs text-muted-foreground">Downloads</p></CardContent></Card>
      </div>
      <div className="relative">
        <Search size={14} className="absolute left-3 top-3 text-muted-foreground" />
        <Input placeholder="Search resources..." className="pl-8" value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      <Card>
        <CardHeader><CardTitle className="text-sm">All Resources</CardTitle></CardHeader>
        <CardContent>
          <div className="divide-y text-sm">
            {filtered.map(r => (
              <div key={r.id} className="py-2.5 flex items-center gap-3">
                <span className="shrink-0">{TYPE_ICONS[r.type] ?? <FileText size={14} />}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{r.title}</p>
                  <p className="text-xs text-muted-foreground">{r.subject} · {r.size} · {r.downloads} downloads</p>
                  <div className="flex gap-1 mt-0.5">{r.tags.map(t => <Badge key={t} variant="outline" className="text-[10px] h-4 px-1">{t}</Badge>)}</div>
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0"><Download size={13} /></Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
