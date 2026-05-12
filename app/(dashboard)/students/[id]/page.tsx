import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { StudentProfileHeader } from '@/components/students/StudentProfileHeader'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, FileText, CheckCircle2, Clock, Download, ShieldCheck } from 'lucide-react'
import { DEMO_DOCUMENTS, DOCUMENT_CATEGORIES } from '@/app/(dashboard)/documents/page'
import { cn } from '@/lib/utils'

export default async function StudentProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: institute } = await supabase
    .from('institutes')
    .select('id')
    .eq('owner_id', user.id)
    .single()
  if (!institute) redirect('/signup')

  const { data: student } = await supabase
    .from('students')
    .select('*, batches(name), courses(name)')
    .eq('id', id)
    .eq('institute_id', institute.id)
    .single()

  if (!student) notFound()

  const [feeData, attendanceData, testData] = await Promise.all([
    supabase
      .from('fee_records')
      .select('id, total_amount, amount_paid, status, due_date, fee_structures(name)')
      .eq('student_id', id)
      .order('due_date', { ascending: false }),
    supabase
      .from('attendance_records')
      .select('status, attendance_sessions(session_date, batches(name))')
      .eq('student_id', id)
      .order('attendance_sessions(session_date)', { ascending: false })
      .limit(30),
    supabase
      .from('test_scores')
      .select('marks_obtained, max_marks, rank_in_batch, percentile, tests(name, test_date, test_type)')
      .eq('student_id', id)
      .order('tests(test_date)', { ascending: false })
      .limit(10),
  ])

  const studentDocs = DEMO_DOCUMENTS.filter(d => d.student_id === id)
  const catMap = Object.fromEntries(DOCUMENT_CATEGORIES.map(c => [c.value, c]))

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/students">
          <Button variant="outline" size="sm"><ArrowLeft size={14} className="mr-1" />Students</Button>
        </Link>
      </div>

      <StudentProfileHeader student={student} />

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="fees">Fees</TabsTrigger>
          <TabsTrigger value="tests">Tests</TabsTrigger>
          <TabsTrigger value="documents">
            Documents {studentDocs.length > 0 && `(${studentDocs.length})`}
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Contact</CardTitle></CardHeader>
            <CardContent className="text-sm space-y-1">
              <p><span className="text-muted-foreground">Student:</span> {student.phone}</p>
              <p><span className="text-muted-foreground">Parent:</span> {student.parent_phone}</p>
              {student.email && <p><span className="text-muted-foreground">Email:</span> {student.email}</p>}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Academic</CardTitle></CardHeader>
            <CardContent className="text-sm space-y-1">
              <p><span className="text-muted-foreground">Course:</span> {(student.courses as unknown as { name: string }[] | null)?.[0]?.name ?? student.courses?.name ?? '—'}</p>
              <p><span className="text-muted-foreground">Batch:</span> {(student.batches as unknown as { name: string }[] | null)?.[0]?.name ?? student.batches?.name ?? '—'}</p>
              <p><span className="text-muted-foreground">Admitted:</span> {formatDate(student.admission_date ?? student.created_at)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Fee Summary</CardTitle></CardHeader>
            <CardContent className="text-sm space-y-1">
              {feeData.data && feeData.data.length > 0 ? (
                <>
                  <p><span className="text-muted-foreground">Total:</span> {formatCurrency(feeData.data.reduce((s, r) => s + (r.total_amount ?? 0), 0))}</p>
                  <p><span className="text-muted-foreground">Paid:</span> {formatCurrency(feeData.data.reduce((s, r) => s + (r.amount_paid ?? 0), 0))}</p>
                  <p><span className="text-muted-foreground">Pending:</span> {formatCurrency(feeData.data.reduce((s, r) => s + ((r.total_amount ?? 0) - (r.amount_paid ?? 0)), 0))}</p>
                </>
              ) : <p className="text-muted-foreground">No fee records</p>}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Attendance Tab */}
        <TabsContent value="attendance" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-sm">Recent Attendance (Last 30 Sessions)</CardTitle></CardHeader>
            <CardContent>
              {attendanceData.data && attendanceData.data.length > 0 ? (
                <div className="space-y-2">
                  {attendanceData.data.map((rec, i) => {
                    const session = (rec.attendance_sessions as unknown as { session_date: string; batches: { name: string }[] | null }[] | null)?.[0] ?? null
                    return (
                      <div key={i} className="flex justify-between text-sm py-1.5 border-b border-border last:border-0">
                        <span className="text-muted-foreground">{session?.session_date ? formatDate(session.session_date) : '—'}</span>
                        <span className="text-muted-foreground text-xs">{session?.batches?.[0]?.name ?? ''}</span>
                        <StatusBadge status={rec.status} />
                      </div>
                    )
                  })}
                </div>
              ) : <p className="text-sm text-muted-foreground">No attendance records yet.</p>}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Fees Tab */}
        <TabsContent value="fees" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-sm">Fee Records</CardTitle></CardHeader>
            <CardContent>
              {feeData.data && feeData.data.length > 0 ? (
                <div className="space-y-2">
                  {feeData.data.map((rec) => (
                    <div key={rec.id} className="flex justify-between items-center text-sm py-2 border-b border-border last:border-0">
                      <div>
                        <p className="font-medium">{(rec.fee_structures as unknown as { name: string }[] | null)?.[0]?.name ?? 'Fee'}</p>
                        <p className="text-xs text-muted-foreground">Due: {formatDate(rec.due_date)}</p>
                      </div>
                      <div className="text-right">
                        <p>{formatCurrency(rec.amount_paid ?? 0)} / {formatCurrency(rec.total_amount ?? 0)}</p>
                        <StatusBadge status={rec.status} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : <p className="text-sm text-muted-foreground">No fee records yet.</p>}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tests Tab */}
        <TabsContent value="tests" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-sm">Test Performance</CardTitle></CardHeader>
            <CardContent>
              {testData.data && testData.data.length > 0 ? (
                <div className="space-y-2">
                  {testData.data.map((score, i) => {
                    const test = (score.tests as unknown as { name: string; test_date: string; test_type: string }[] | null)?.[0] ?? null
                    const pct = score.max_marks ? Math.round((score.marks_obtained / score.max_marks) * 100) : 0
                    return (
                      <div key={i} className="flex justify-between items-center text-sm py-2 border-b border-border last:border-0">
                        <div>
                          <p className="font-medium">{test?.name ?? 'Test'}</p>
                          <p className="text-xs text-muted-foreground capitalize">{test?.test_type} · {test?.test_date ? formatDate(test.test_date) : ''}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{score.marks_obtained}/{score.max_marks} <span className="text-muted-foreground text-xs">({pct}%)</span></p>
                          {score.rank_in_batch && <p className="text-xs text-muted-foreground">Rank #{score.rank_in_batch}</p>}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : <p className="text-sm text-muted-foreground">No test records yet.</p>}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="mt-4 space-y-3">
          <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-950/30 dark:border-blue-900 p-3">
            <ShieldCheck size={14} className="text-blue-600 mt-0.5 shrink-0" />
            <p className="text-xs text-blue-700 dark:text-blue-400">
              Documents are encrypted in transit and visible only to this student and their coach. Sensitive docs (Aadhaar, birth certificates) are never shared outside the platform.
            </p>
          </div>

          {studentDocs.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-sm text-muted-foreground">
                No documents uploaded for this student yet.
                <br />
                <Link href="/documents">
                  <Button variant="link" size="sm" className="mt-2">Go to Documents →</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Uploaded Documents ({studentDocs.length})</CardTitle>
              </CardHeader>
              <CardContent className="divide-y p-0">
                {studentDocs.map(doc => {
                  const cat = catMap[doc.category]
                  return (
                    <div key={doc.id} className="flex items-center gap-3 px-4 py-3">
                      <FileText size={14} className="text-red-500 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{doc.file_name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {cat && (
                            <span className={cn('text-[10px] px-1.5 py-0.5 rounded-full font-medium', cat.color)}>
                              {cat.label}
                            </span>
                          )}
                          <span className="text-[10px] text-muted-foreground">{doc.size} · {doc.uploaded_at}</span>
                        </div>
                        {doc.note && <p className="text-[11px] text-muted-foreground italic mt-0.5">{doc.note}</p>}
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className={cn(
                          'flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border font-medium',
                          doc.status === 'verified'
                            ? 'bg-green-50 text-green-700 border-green-200'
                            : 'bg-orange-50 text-orange-700 border-orange-200'
                        )}>
                          {doc.status === 'verified' ? <CheckCircle2 size={10} /> : <Clock size={10} />}
                          {doc.status === 'verified' ? 'Verified' : 'Pending'}
                        </span>
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <Download size={13} />
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
