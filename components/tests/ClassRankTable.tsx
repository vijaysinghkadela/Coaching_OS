import { cn } from '@/lib/utils'
import { Medal } from 'lucide-react'

interface ScoreRow {
  rank_in_batch: number | null
  marks_obtained: number
  max_marks: number
  percentile: number | null
  is_absent: boolean
  students: { full_name: string; enrollment_no: string } | null
}

interface ClassRankTableProps {
  scores: ScoreRow[]
}

export function ClassRankTable({ scores }: ClassRankTableProps) {
  const sorted = [...scores].sort((a, b) => {
    if (a.is_absent && !b.is_absent) return 1
    if (!a.is_absent && b.is_absent) return -1
    return (a.rank_in_batch ?? 999) - (b.rank_in_batch ?? 999)
  })

  const MEDAL: Record<number, string> = { 1: 'text-yellow-500', 2: 'text-gray-400', 3: 'text-amber-600' }

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-muted/50 border-b border-border text-xs text-muted-foreground">
            <th className="text-center px-3 py-2.5 w-12">Rank</th>
            <th className="text-left px-4 py-2.5">Student</th>
            <th className="text-center px-4 py-2.5">Marks</th>
            <th className="text-center px-4 py-2.5">%</th>
            <th className="text-center px-4 py-2.5 hidden sm:table-cell">Percentile</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {sorted.map((row, i) => {
            const rank = row.rank_in_batch
            const pct = row.max_marks > 0 ? Math.round((row.marks_obtained / row.max_marks) * 100) : 0
            const medalColor = rank ? MEDAL[rank] : null
            return (
              <tr key={i} className={cn(rank === 1 && 'bg-yellow-50/50 dark:bg-yellow-900/10')}>
                <td className="px-3 py-2.5 text-center">
                  {row.is_absent ? (
                    <span className="text-muted-foreground text-xs">AB</span>
                  ) : rank && medalColor ? (
                    <Medal size={16} className={cn('mx-auto', medalColor)} />
                  ) : (
                    <span className="text-muted-foreground">{rank ?? '—'}</span>
                  )}
                </td>
                <td className="px-4 py-2.5">
                  <p className="font-medium">{row.students?.full_name ?? '—'}</p>
                  <p className="text-xs text-muted-foreground font-mono">{row.students?.enrollment_no}</p>
                </td>
                <td className={cn('px-4 py-2.5 text-center font-medium', row.is_absent && 'text-muted-foreground')}>
                  {row.is_absent ? 'Absent' : `${row.marks_obtained}/${row.max_marks}`}
                </td>
                <td className="px-4 py-2.5 text-center">
                  {!row.is_absent && (
                    <span className={cn(pct >= 80 ? 'text-green-600' : pct >= 60 ? 'text-yellow-600' : 'text-red-600')}>
                      {pct}%
                    </span>
                  )}
                </td>
                <td className="px-4 py-2.5 text-center text-muted-foreground hidden sm:table-cell">
                  {row.percentile != null && !row.is_absent ? `${Math.round(row.percentile)}th` : '—'}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
