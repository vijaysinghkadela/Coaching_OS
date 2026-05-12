'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { saveTestScores } from '@/lib/actions/tests'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface Student {
  id: string
  full_name: string
  enrollment_no: string
}

interface ExistingScore {
  student_id: string
  marks_obtained: number
  is_absent: boolean
}

interface MarksEntryGridProps {
  testId: string
  maxMarks: number
  students: Student[]
  existing?: ExistingScore[]
}

export function MarksEntryGrid({ testId, maxMarks, students, existing = [] }: MarksEntryGridProps) {
  type ScoreRow = { marks: number; absent: boolean }
  const [scores, setScores] = useState<Record<string, ScoreRow>>(() => {
    const init: Record<string, ScoreRow> = {}
    students.forEach((s) => {
      const ex = existing.find((e) => e.student_id === s.id)
      init[s.id] = { marks: ex?.marks_obtained ?? 0, absent: ex?.is_absent ?? false }
    })
    return init
  })
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const setMarks = (id: string, val: number) =>
    setScores((p) => ({ ...p, [id]: { ...p[id], marks: Math.min(val, maxMarks) } }))

  const toggleAbsent = (id: string) =>
    setScores((p) => ({ ...p, [id]: { ...p[id], absent: !p[id].absent } }))

  const handleSave = async () => {
    setLoading(true)
    const rows = Object.entries(scores).map(([student_id, s]) => ({
      student_id,
      marks_obtained: s.marks,
      is_absent: s.absent,
    }))
    const res = await saveTestScores(testId, rows)
    setLoading(false)
    if (res.error) toast.error(res.error)
    else { toast.success('Marks saved & ranks computed!'); router.refresh() }
  }

  const filled = Object.values(scores).filter((s) => s.absent || s.marks > 0).length

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center text-sm text-muted-foreground">
        <span>{filled}/{students.length} filled · Max marks: {maxMarks}</span>
        <Button onClick={handleSave} disabled={loading}>{loading ? 'Saving…' : 'Save Marks'}</Button>
      </div>

      <div className="rounded-lg border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50 border-b border-border text-xs text-muted-foreground">
              <th className="text-left px-4 py-2.5">Student</th>
              <th className="text-left px-4 py-2.5">Enrollment</th>
              <th className="text-center px-4 py-2.5 w-24">Marks /{maxMarks}</th>
              <th className="text-center px-4 py-2.5 w-20">Absent</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {students.map((s) => {
              const row = scores[s.id]
              return (
                <tr key={s.id} className={cn(row.absent && 'bg-red-50 dark:bg-red-900/10')}>
                  <td className="px-4 py-2">{s.full_name}</td>
                  <td className="px-4 py-2 font-mono text-xs text-muted-foreground">{s.enrollment_no}</td>
                  <td className="px-4 py-2">
                    <Input
                      type="number"
                      min={0}
                      max={maxMarks}
                      value={row.absent ? '' : row.marks}
                      onChange={(e) => setMarks(s.id, Number(e.target.value))}
                      disabled={row.absent}
                      className="h-7 w-20 text-center mx-auto"
                    />
                  </td>
                  <td className="px-4 py-2 text-center">
                    <input
                      type="checkbox"
                      checked={row.absent}
                      onChange={() => toggleAbsent(s.id)}
                      className="cursor-pointer"
                    />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
