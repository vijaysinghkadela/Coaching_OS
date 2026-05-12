'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
   Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
    FileText, Image, CheckCircle2, Clock, Download,
    Eye, Upload, Search, ShieldAlert,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface Document {
  id: string; student_id: string; student_name: string; enrollment_no: string
  category: string; file_name: string; size: string; status: string
  uploaded_at: string; note: string; last_opened_by: string | null; last_opened_at: string | null
}
interface Category { value: string; label: string; color: string }

const fileIcon = (name: string) =>
   name.endsWith('.pdf') ? <FileText size={15} className="text-red-500" /> : /* eslint-disable-next-line jsx-a11y/alt-text */ <Image size={15} className="text-blue-500" />

export function DocumentsClient({ documents, categories }: { documents: Document[]; categories: Category[] }) {
  const [search, setSearch]           = useState<string>('')
  const [catFilter, setCatFilter]     = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [docs, setDocs]               = useState(documents)
  const [uploadOpen, setUploadOpen]   = useState(false)
  const [consentShown, setConsentShown] = useState(false)
  const [consentDone, setConsentDone]   = useState(false)
  const [uploadForm, setUploadForm]   = useState<{ student: string | null; category: string | null; note: string; file: string | null }>({ student: null, category: null, note: '', file: null })


  const filtered = docs.filter(d => {
    const matchSearch = d.student_name.toLowerCase().includes(search.toLowerCase()) ||
                        d.file_name.toLowerCase().includes(search.toLowerCase())
    const matchCat    = catFilter === 'all' || d.category === catFilter
    const matchStatus = statusFilter === 'all' || d.status === statusFilter
    return matchSearch && matchCat && matchStatus
  })

  function toggleVerified(id: string) {
    setDocs(prev => prev.map(d =>
      d.id === id ? { ...d, status: d.status === 'verified' ? 'pending' : 'verified' } : d
    ))
  }

  function handleUploadOpen() {
    if (!consentDone) { setConsentShown(true) } else { setUploadOpen(true) }
  }

  function handleConsentAccept() { setConsentDone(true); setConsentShown(false); setUploadOpen(true) }

  function handleUpload() {
    if (!uploadForm.category) { toast.error('Please select a document type'); return }
    toast.success('Document uploaded successfully (demo)')
    setUploadOpen(false)
    setUploadForm({ student: '', category: '', note: '', file: '' })
  }

  const catMap = Object.fromEntries(categories.map(c => [c.value, c]))

  return (
    <>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-40">
          <Search size={13} className="absolute left-2.5 top-2.5 text-muted-foreground" />
          <Input placeholder="Search student or filename…" className="pl-8 h-8 text-sm" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={catFilter} onValueChange={(v) => setCatFilter(v as typeof catFilter)}>
          <SelectTrigger className="h-8 text-sm w-44"><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? 'all')}>
          <SelectTrigger className="h-8 text-sm w-36"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All status</SelectItem>
            <SelectItem value="verified">Verified</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>
        <Button size="sm" className="h-8" onClick={handleUploadOpen}>
          <Upload size={13} className="mr-1" /> Upload Doc
        </Button>
      </div>

      {/* Doc list */}
      <Card>
        <CardContent className="p-0">
          <div className="divide-y">
            {filtered.length === 0 && (
              <div className="py-12 text-center text-sm text-muted-foreground">No documents found.</div>
            )}
            {filtered.map(doc => {
              const cat = catMap[doc.category]
              return (
                <div key={doc.id} className="flex items-center gap-3 px-4 py-3">
                  <div className="shrink-0">{fileIcon(doc.file_name)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{doc.file_name}</p>
                    <div className="flex items-center flex-wrap gap-x-2 gap-y-0.5 mt-0.5">
                      <span className="text-xs text-muted-foreground">{doc.student_name} · {doc.enrollment_no}</span>
                      {cat && (
                        <span className={cn('text-[10px] px-1.5 py-0.5 rounded-full font-medium', cat.color)}>
                          {cat.label}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground italic mt-0.5">{doc.note}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-muted-foreground">Uploaded {doc.uploaded_at} · {doc.size}</span>
                      {doc.last_opened_by && (
                        <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                          <Eye size={9} /> Viewed by {doc.last_opened_by} on {doc.last_opened_at}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => toggleVerified(doc.id)}
                      className={cn(
                        'flex items-center gap-1 text-xs px-2 py-1 rounded-full border font-medium transition-colors',
                        doc.status === 'verified'
                          ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400'
                          : 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400'
                      )}
                    >
                      {doc.status === 'verified' ? <CheckCircle2 size={11} /> : <Clock size={11} />}
                      {doc.status === 'verified' ? 'Verified' : 'Pending'}
                    </button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" title="Download">
                      <Download size={13} />
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Consent dialog */}
      <Dialog open={consentShown} onOpenChange={setConsentShown}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <ShieldAlert size={16} className="text-orange-500" /> Privacy Notice
            </DialogTitle>
            <DialogDescription className="text-sm leading-relaxed">
You are about to upload a sensitive document (e.g., Aadhaar card, birth certificate).
              <br /><br />
              These documents are stored securely using HTTPS encryption and are accessible <strong>only</strong> to the student and their assigned coach. Files are <strong>never</strong> shared outside the Coaching OS ecosystem.
              <br /><br />
              By continuing, you confirm that you have the student&apos;s or guardian&apos;s consent to upload this document.

            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 mt-2">
            <Button variant="outline" className="flex-1" onClick={() => setConsentShown(false)}>Cancel</Button>
            <Button className="flex-1" onClick={handleConsentAccept}>I Understand, Continue</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Upload dialog */}
      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base">Upload Document</DialogTitle>
            <DialogDescription>Attach a document to a student profile.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 mt-1">
            <div>
              <Label className="text-xs mb-1 block">Student</Label>
              <Select value={uploadForm.student ?? ''} onValueChange={(v) => setUploadForm(f => ({ ...f, student: v === '' ? null : v }))}>
                <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select student" /></SelectTrigger>
                <SelectContent>
                  {['Arjun Mehta', 'Priya Sharma', 'Rohit Agarwal', 'Ananya Singh', 'Divya Joshi'].map(n => (
                    <SelectItem key={n} value={n}>{n}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs mb-1 block">Document Type</Label>
              <Select value={uploadForm.category ?? ''} onValueChange={(v) => setUploadForm(f => ({ ...f, category: v === '' ? null : v }))}>
                <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {categories.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs mb-1 block">File</Label>
              <div className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-accent/30 transition-colors">
                <Upload size={20} className="mx-auto mb-1 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Click to select or drag & drop</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">JPG, PNG, PDF, DOC up to 10 MB</p>
              </div>
            </div>
            <div>
              <Label className="text-xs mb-1 block">Note (optional)</Label>
              <Textarea
                placeholder="e.g. Front and back scanned"
                className="text-sm resize-none h-16"
                value={uploadForm.note}
                onChange={e => setUploadForm(f => ({ ...f, note: e.target.value }))}
              />
            </div>
            <Button className="w-full" onClick={handleUpload}><Upload size={13} className="mr-1" /> Upload Document</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
