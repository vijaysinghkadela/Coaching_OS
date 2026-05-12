'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { SearchInput } from '@/components/shared/SearchInput'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Eye, UserX } from 'lucide-react'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { deactivateStudent } from '@/lib/actions/students'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface Student {
  id: string
  enrollment_no: string
  full_name: string
  phone: string
  gender: string | null
  status: string
  created_at: string
  batches: { name: string } | null
}

interface StudentTableProps {
  initialStudents: Student[]
}

export function StudentTable({ initialStudents }: StudentTableProps) {
  const [search, setSearch] = useState('')
  const [deactivatingId, setDeactivatingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const filtered = initialStudents.filter((s) =>
    search.trim() === '' ||
    s.full_name.toLowerCase().includes(search.toLowerCase()) ||
    s.enrollment_no.toLowerCase().includes(search.toLowerCase()) ||
    s.phone.includes(search)
  )

  const handleDeactivate = useCallback(async () => {
    if (!deactivatingId) return
    setLoading(true)
    const result = await deactivateStudent(deactivatingId)
    setLoading(false)
    setDeactivatingId(null)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Student deactivated')
      router.refresh()
    }
  }, [deactivatingId, router])

  return (
    <div className="space-y-4">
      <SearchInput value={search} onChange={setSearch} placeholder="Search by name, enrollment no, phone…" className="max-w-sm" />

      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Enrollment No</TableHead>
              <TableHead>Name</TableHead>
              <TableHead className="hidden sm:table-cell">Phone</TableHead>
              <TableHead className="hidden md:table-cell">Batch</TableHead>
              <TableHead className="hidden lg:table-cell">Gender</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-10">
                  {search ? 'No students match your search.' : 'No students enrolled yet.'}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((student) => (
                <TableRow key={student.id}>
                  <TableCell className="font-mono text-xs">{student.enrollment_no}</TableCell>
                  <TableCell className="font-medium">{student.full_name}</TableCell>
                  <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">{student.phone}</TableCell>
                  <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                    {student.batches?.name ?? '—'}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell capitalize text-sm text-muted-foreground">
                    {student.gender ?? '—'}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={student.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Link href={`/students/${student.id}`}>
                        <Button variant="ghost" size="icon"><Eye size={14} /></Button>
                      </Link>
                      {student.status === 'active' && (
                        <Button variant="ghost" size="icon" onClick={() => setDeactivatingId(student.id)}>
                          <UserX size={14} />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <ConfirmDialog
        open={!!deactivatingId}
        onOpenChange={(open) => !open && setDeactivatingId(null)}
        title="Deactivate Student?"
        description="The student will be marked inactive and excluded from attendance and fee reports."
        onConfirm={handleDeactivate}
        confirmLabel="Deactivate"
        loading={loading}
      />
    </div>
  )
}
