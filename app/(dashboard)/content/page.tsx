import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { BookOpen, Plus, Download, FileText, Video, Link2, Image as ImageIcon, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'

const CONTENT_ITEMS = [
  { id: 'c-001', title: 'JEE Physics — Rotational Motion Complete Notes', type: 'pdf', subject: 'Physics', course: 'JEE Mains + Advanced', size: '2.4 MB', downloads: 42, uploaded: '2025-10-15', tags: ['JEE', 'Mechanics'] },
  { id: 'c-002', title: 'Organic Chemistry Reaction Mechanisms (Video)', type: 'video', subject: 'Chemistry', course: 'JEE Mains + Advanced', size: '180 MB', downloads: 38, uploaded: '2025-10-20', tags: ['JEE', 'Organic'] },
  { id: 'c-003', title: 'NEET Biology — NCERT Chapter 1–5 Summary', type: 'pdf', subject: 'Biology', course: 'NEET Preparation', size: '1.8 MB', downloads: 31, uploaded: '2025-10-22', tags: ['NEET', 'NCERT'] },
  { id: 'c-004', title: '10th Maths — Trigonometry Formula Sheet', type: 'pdf', subject: 'Mathematics', course: '10th Board Excellence', size: '340 KB', downloads: 55, uploaded: '2025-11-01', tags: ['10th', 'Formulas'] },
  { id: 'c-005', title: 'JEE Maths — Calculus Practice Set (100 problems)', type: 'pdf', subject: 'Mathematics', course: 'JEE Mains + Advanced', size: '1.2 MB', downloads: 29, uploaded: '2025-11-05', tags: ['JEE', 'Practice'] },
  { id: 'c-006', title: 'Human Physiology — Diagram Bank', type: 'image', subject: 'Biology', course: 'NEET Preparation', size: '8.5 MB', downloads: 24, uploaded: '2025-11-05', tags: ['NEET', 'Diagrams'] },
  { id: 'c-007', title: 'Physics Olympiad Reference Links', type: 'link', subject: 'Physics', course: 'JEE Mains + Advanced', size: '—', downloads: 12, uploaded: '2025-11-08', tags: ['JEE', 'Advanced'] },
  { id: 'c-008', title: '10th Science — Light and Reflection Notes', type: 'pdf', subject: 'Science', course: '10th Board Excellence', size: '890 KB', downloads: 48, uploaded: '2025-11-10', tags: ['10th', 'Optics'] },
]

const MODULES = [
  { title: 'JEE Physics — Complete Module', items: 12, course: 'JEE Mains + Advanced', progress: 8 },
  { title: 'NEET Biology — Full Syllabus Pack', items: 18, course: 'NEET Preparation', progress: 11 },
  { title: '10th Board Excellence Kit', items: 24, course: '10th Board Excellence', progress: 18 },
]

const typeIcon: Record<string, React.ReactNode> = {
   pdf: <FileText size={14} className="text-red-500" />,
   video: <Video size={14} className="text-blue-500" />,
   image: <ImageIcon size={14} className="text-green-500" />,
   link: <Link2 size={14} className="text-purple-500" />,
 }

export default async function ContentPage() {
  const totalItems = CONTENT_ITEMS.length
  const totalDownloads = CONTENT_ITEMS.reduce((a, c) => a + c.downloads, 0)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Content Library"
        description="Study materials, notes, videos, and resources for all courses"
        action={<Button size="sm"><Plus size={14} className="mr-1" /> Upload</Button>}
      />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card><CardContent className="p-3 text-center"><p className="text-2xl font-bold">{totalItems}</p><p className="text-xs text-muted-foreground">Resources</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-2xl font-bold">{MODULES.length}</p><p className="text-xs text-muted-foreground">Modules</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-2xl font-bold">{totalDownloads}</p><p className="text-xs text-muted-foreground">Downloads</p></CardContent></Card>
      </div>

      {/* Modules */}
      <Card>
        <CardHeader><CardTitle className="text-sm">Course Modules</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {MODULES.map(m => (
            <div key={m.title} className="flex items-center gap-3 p-2 border rounded-lg">
              <BookOpen size={16} className="text-primary shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium">{m.title}</p>
                <p className="text-xs text-muted-foreground">{m.course}</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 bg-muted rounded-full h-1">
                    <div className="bg-primary h-1 rounded-full" style={{ width: `${(m.progress / m.items) * 100}%` }} />
                  </div>
                  <span className="text-[10px] text-muted-foreground">{m.progress}/{m.items} items</span>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="text-xs">View</Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* All resources */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">All Resources</CardTitle>
            <div className="relative">
              <Search size={12} className="absolute left-2 top-2.5 text-muted-foreground" />
              <Input placeholder="Search…" className="pl-6 h-8 text-xs w-44" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="divide-y">
            {CONTENT_ITEMS.map(item => (
              <div key={item.id} className="py-2.5 flex items-center gap-3">
                <span className="shrink-0">{typeIcon[item.type]}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.subject} · {item.course} · {item.size}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    {item.tags.map(tag => (
                      <Badge key={tag} variant="outline" className="text-[10px] h-4 px-1">{tag}</Badge>
                    ))}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-muted-foreground flex items-center gap-0.5"><Download size={10} /> {item.downloads}</p>
                  <p className="text-[10px] text-muted-foreground">{item.uploaded}</p>
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
