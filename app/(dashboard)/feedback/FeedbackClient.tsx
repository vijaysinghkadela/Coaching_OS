'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Star, ThumbsUp, ThumbsDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FeedbackItem {
  id: string; student: string; batch: string; session: string; date: string
  rating: number; clarity: number; pace: number; helpfulness: number
  comment: string; sentiment: string
}

const sentimentIcon = {
  positive: <ThumbsUp size={11} className="text-green-600" />,
  negative: <ThumbsDown size={11} className="text-red-500" />,
  mixed:    <Minus size={11} className="text-yellow-500" />,
}

const sentimentColor = {
  positive: 'bg-green-50 border-green-200',
  negative: 'bg-red-50 border-red-200',
  mixed:    'bg-yellow-50 border-yellow-200',
}

function StarRow({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[10px] text-muted-foreground w-20 shrink-0">{label}</span>
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map(i => (
          <Star
            key={i}
            size={10}
            className={i <= value ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'}
          />
        ))}
      </div>
    </div>
  )
}

export function FeedbackClient({ feedback }: { feedback: FeedbackItem[] }) {
  const [filter, setFilter] = useState<'all' | 'positive' | 'negative' | 'mixed'>('all')

  const filtered = filter === 'all' ? feedback : feedback.filter(f => f.sentiment === filter)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="text-sm">Student Reviews</CardTitle>
          <div className="flex gap-1">
            {(['all', 'positive', 'mixed', 'negative'] as const).map(s => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={cn(
                  'text-xs px-2.5 py-1 rounded-full border font-medium capitalize transition-colors',
                  filter === s ? 'bg-primary text-primary-foreground border-primary' : 'bg-background hover:bg-accent'
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {filtered.map(fb => (
          <div key={fb.id} className={cn('rounded-lg border p-3 space-y-2', sentimentColor[fb.sentiment as keyof typeof sentimentColor] ?? '')}>
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">{fb.student}</p>
                  {sentimentIcon[fb.sentiment as keyof typeof sentimentIcon]}
                </div>
                <p className="text-xs text-muted-foreground">{fb.session} · {fb.batch}</p>
                <p className="text-[10px] text-muted-foreground">{fb.date}</p>
              </div>
              <div className="flex items-center gap-0.5 shrink-0">
                {[1, 2, 3, 4, 5].map(i => (
                  <Star
                    key={i}
                    size={13}
                    className={i <= fb.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-0.5">
              <StarRow value={fb.clarity}     label="Clarity" />
              <StarRow value={fb.pace}        label="Pace" />
              <StarRow value={fb.helpfulness} label="Helpfulness" />
            </div>

            {fb.comment && (
              <p className="text-xs italic text-muted-foreground border-t pt-2 leading-relaxed">{fb.comment}</p>

            )}

          </div>
        ))}

        {filtered.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-6">No reviews in this category.</p>
        )}
      </CardContent>
    </Card>
  )
}
