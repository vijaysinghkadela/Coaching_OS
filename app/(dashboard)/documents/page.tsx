import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DocumentsClient } from './DocumentsClient'
import { FolderOpen, ShieldCheck, Clock, FileCheck2 } from 'lucide-react'

export const DOCUMENT_CATEGORIES = [
  { value: 'admit_card',         label: 'Admit Card',           color: 'bg-blue-100 text-blue-700' },
  { value: 'transfer_cert',      label: 'Transfer Certificate', color: 'bg-purple-100 text-purple-700' },
  { value: 'aadhaar',            label: 'Aadhaar Card',         color: 'bg-orange-100 text-orange-700' },
  { value: 'birth_certificate',  label: 'Birth Certificate',    color: 'bg-green-100 text-green-700' },
  { value: 'school_id',          label: 'School ID',            color: 'bg-teal-100 text-teal-700' },
  { value: 'marksheet',          label: 'Marksheet',            color: 'bg-yellow-100 text-yellow-700' },
  { value: 'fee_receipt',        label: 'Fee Receipt',          color: 'bg-indigo-100 text-indigo-700' },
  { value: 'other',              label: 'Other',                color: 'bg-gray-100 text-gray-600' },
]

export const DEMO_DOCUMENTS = [
  { id: 'doc-001', student_id: 'stu-001', student_name: 'Arjun Mehta', enrollment_no: 'SHRM-0001', category: 'aadhaar',           file_name: 'arjun_aadhaar.pdf',      size: '420 KB', status: 'verified',  uploaded_at: '2024-06-10', note: 'Front and back scanned', last_opened_by: 'Coach', last_opened_at: '2024-06-12' },
  { id: 'doc-002', student_id: 'stu-001', student_name: 'Arjun Mehta', enrollment_no: 'SHRM-0001', category: 'admit_card',        file_name: 'arjun_jee_admit.jpg',    size: '312 KB', status: 'verified',  uploaded_at: '2025-01-20', note: 'JEE Mains Jan 2025',     last_opened_by: 'Coach', last_opened_at: '2025-01-21' },
  { id: 'doc-003', student_id: 'stu-002', student_name: 'Priya Sharma', enrollment_no: 'SHRM-0002', category: 'transfer_cert',    file_name: 'priya_tc.pdf',           size: '185 KB', status: 'verified',  uploaded_at: '2024-06-10', note: '',                       last_opened_by: 'Coach', last_opened_at: '2024-06-11' },
  { id: 'doc-004', student_id: 'stu-002', student_name: 'Priya Sharma', enrollment_no: 'SHRM-0002', category: 'marksheet',        file_name: 'priya_10th_marks.pdf',   size: '530 KB', status: 'pending',   uploaded_at: '2024-06-15', note: '10th marksheet',         last_opened_by: null, last_opened_at: null },
  { id: 'doc-005', student_id: 'stu-003', student_name: 'Rohit Agarwal', enrollment_no: 'SHRM-0003', category: 'aadhaar',         file_name: 'rohit_aadhaar.jpg',      size: '278 KB', status: 'verified',  uploaded_at: '2024-06-15', note: '',                       last_opened_by: 'Coach', last_opened_at: '2024-06-16' },
  { id: 'doc-006', student_id: 'stu-006', student_name: 'Ananya Singh', enrollment_no: 'SHRM-0006', category: 'aadhaar',          file_name: 'ananya_aadhaar.pdf',     size: '390 KB', status: 'verified',  uploaded_at: '2024-07-05', note: '',                       last_opened_by: 'Coach', last_opened_at: '2024-07-06' },
  { id: 'doc-007', student_id: 'stu-006', student_name: 'Ananya Singh', enrollment_no: 'SHRM-0006', category: 'birth_certificate', file_name: 'ananya_birth_cert.pdf',  size: '214 KB', status: 'pending',   uploaded_at: '2024-07-05', note: 'Needs re-upload (blurry)', last_opened_by: 'Coach', last_opened_at: '2024-07-06' },
  { id: 'doc-008', student_id: 'stu-010', student_name: 'Divya Joshi', enrollment_no: 'SHRM-0010', category: 'school_id',         file_name: 'divya_school_id.jpg',    size: '167 KB', status: 'verified',  uploaded_at: '2024-07-15', note: '',                       last_opened_by: 'Coach', last_opened_at: '2024-07-16' },
  { id: 'doc-009', student_id: 'stu-011', student_name: 'Amit Saini', enrollment_no: 'SHRM-0011', category: 'aadhaar',            file_name: 'amit_aadhaar.pdf',       size: '445 KB', status: 'pending',   uploaded_at: '2024-07-15', note: '',                       last_opened_by: null, last_opened_at: null },
  { id: 'doc-010', student_id: 'stu-007', student_name: 'Vikram Rao', enrollment_no: 'SHRM-0007', category: 'transfer_cert',      file_name: 'vikram_tc.pdf',          size: '201 KB', status: 'verified',  uploaded_at: '2024-07-05', note: '',                       last_opened_by: 'Coach', last_opened_at: '2024-07-08' },
  { id: 'doc-011', student_id: 'stu-004', student_name: 'Sneha Gupta', enrollment_no: 'SHRM-0004', category: 'admit_card',        file_name: 'sneha_jee_admit.jpg',    size: '298 KB', status: 'pending',   uploaded_at: '2025-01-22', note: '',                       last_opened_by: null, last_opened_at: null },
  { id: 'doc-012', student_id: 'stu-005', student_name: 'Karan Bishnoi', enrollment_no: 'SHRM-0005', category: 'marksheet',       file_name: 'karan_10th_marks.pdf',   size: '612 KB', status: 'verified',  uploaded_at: '2024-07-01', note: '10th final marksheet',   last_opened_by: 'Coach', last_opened_at: '2024-07-02' },
]

export default async function DocumentsPage() {
  const total     = DEMO_DOCUMENTS.length
  const verified  = DEMO_DOCUMENTS.filter(d => d.status === 'verified').length
  const pending   = DEMO_DOCUMENTS.filter(d => d.status === 'pending').length

  const uniqueStudents = new Set(DEMO_DOCUMENTS.map(d => d.student_id)).size

  return (
    <div className="space-y-6">
      <PageHeader
        title="Student Documents"
        description="Identity verification, admit cards, and compliance documents"
      />

      {/* Privacy notice */}
      <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-950/30 dark:border-blue-900 p-3">
        <ShieldCheck size={16} className="text-blue-600 mt-0.5 shrink-0" />
        <p className="text-xs text-blue-700 dark:text-blue-400">
          Documents are stored securely with HTTPS encryption. Only the student and their assigned coach can access these files. Sensitive documents (Aadhaar, birth certificates) are never shared outside the institute ecosystem.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Total Docs" value={total}         icon={<FolderOpen size={14} />} color="text-foreground" />
        <StatCard label="Students"   value={uniqueStudents} icon={<FolderOpen size={14} />} color="text-blue-600" />
        <StatCard label="Verified"   value={verified}       icon={<FileCheck2 size={14} />} color="text-green-600" />
        <StatCard label="Pending"    value={pending}        icon={<Clock size={14} />}      color="text-orange-600" />
      </div>

      <DocumentsClient documents={DEMO_DOCUMENTS} categories={DOCUMENT_CATEGORIES} />
    </div>
  )
}

function StatCard({ label, value, icon, color }: { label: string; value: number; icon: React.ReactNode; color: string }) {
  return (
    <Card>
      <CardContent className="p-3 flex items-center gap-2">
        <span className={color}>{icon}</span>
        <div>
          <p className={`text-xl font-bold ${color}`}>{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  )
}
