import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Star, MessageSquare, ThumbsUp, ThumbsDown, BarChart3 } from 'lucide-react'
import { FeedbackClient } from './FeedbackClient'

const DEMO_FEEDBACK = [
  {
    id: 'fb-001', student: 'Arjun Mehta', batch: 'JEE 2026 Morning',
    session: 'Physics — Rotational Motion', date: '2025-11-10',
    rating: 5, clarity: 5, pace: 4, helpfulness: 5,
    comment: 'Excellent explanation of moment of inertia. The derivations were crystal clear.',
    sentiment: 'positive',
  },
  {
    id: 'fb-002', student: 'Priya Sharma', batch: 'JEE 2026 Morning',
    session: 'Chemistry — Organic Reactions', date: '2025-11-09',
    rating: 4, clarity: 4, pace: 3, helpfulness: 5,
    comment: 'Good session but pace was a bit fast for reaction mechanisms. Would appreciate more examples.',
    sentiment: 'mixed',
  },
  {
    id: 'fb-003', student: 'Ananya Singh', batch: 'NEET 2026 Batch A',
    session: 'Biology — Human Physiology', date: '2025-11-11',
    rating: 5, clarity: 5, pace: 5, helpfulness: 5,
    comment: 'Best class this month! Diagrams and mnemonics really helped.',
    sentiment: 'positive',
  },
  {
    id: 'fb-004', student: 'Rohit Agarwal', batch: 'JEE 2026 Morning',
    session: 'Maths — Calculus', date: '2025-11-08',
    rating: 3, clarity: 3, pace: 2, helpfulness: 3,
    comment: 'Struggled to keep up. More solved examples would help.',
    sentiment: 'negative',
  },
  {
    id: 'fb-005', student: 'Divya Joshi', batch: '10th 2025-26',
    session: 'Science — Light & Optics', date: '2025-11-10',
    rating: 5, clarity: 5, pace: 4, helpfulness: 5,
    comment: 'The lab activity was really fun and educational!',
    sentiment: 'positive',
  },
  {
    id: 'fb-006', student: 'Vikram Rao', batch: 'NEET 2026 Batch A',
    session: 'Biology — Ecology', date: '2025-11-07',
    rating: 4, clarity: 4, pace: 4, helpfulness: 4,
    comment: 'Good session. Would like more MCQ practice at end of class.',
    sentiment: 'positive',
  },
  {
    id: 'fb-007', student: 'Sneha Gupta', batch: 'JEE 2026 Morning',
    session: 'Physics — Electrostatics', date: '2025-11-06',
    rating: 5, clarity: 5, pace: 5, helpfulness: 5,
    comment: 'Perfect pace and depth. The visualisations with diagrams were very helpful.',
    sentiment: 'positive',
  },
  {
    id: 'fb-008', student: 'Amit Saini', batch: '10th 2025-26',
    session: 'Maths — Trigonometry', date: '2025-11-05',
    rating: 4, clarity: 4, pace: 4, helpfulness: 4,
    comment: '',
    sentiment: 'positive',
  },
]

const SURVEY_QUESTIONS = [
  { id: 'q1', question: 'How would you rate today\'s session overall?', type: 'rating', responses: [{ label: '⭐ 1', count: 0 }, { label: '⭐ 2', count: 1 }, { label: '⭐ 3', count: 2 }, { label: '⭐ 4', count: 12 }, { label: '⭐ 5', count: 23 }] },
  { id: 'q2', question: 'Was the pace of teaching comfortable?', type: 'choice', responses: [{ label: 'Too fast', count: 4 }, { label: 'Just right', count: 28 }, { label: 'Too slow', count: 6 }] },
  { id: 'q3', question: 'Would you recommend this coaching to a friend?', type: 'choice', responses: [{ label: 'Definitely yes', count: 30 }, { label: 'Maybe', count: 6 }, { label: 'No', count: 2 }] },
]

export default async function FeedbackPage() {
  const avgRating = (DEMO_FEEDBACK.reduce((a, f) => a + f.rating, 0) / DEMO_FEEDBACK.length).toFixed(1)
  const positive  = DEMO_FEEDBACK.filter(f => f.sentiment === 'positive').length
  const negative  = DEMO_FEEDBACK.filter(f => f.sentiment === 'negative').length
  const withComments = DEMO_FEEDBACK.filter(f => f.comment).length

  return (
    <div className="space-y-6">
      <PageHeader
        title="Feedback & Ratings"
        description="Session ratings, student surveys, and coaching quality insights"
        action={<Button size="sm"><MessageSquare size={13} className="mr-1" /> Send Survey</Button>}
      />

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-3 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Star size={16} className="text-yellow-500 fill-yellow-400" />
              <p className="text-2xl font-bold">{avgRating}</p>
            </div>
            <p className="text-xs text-muted-foreground">Avg Rating</p>
            <p className="text-[10px] text-muted-foreground">out of 5.0</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-green-600">{positive}</p>
            <p className="text-xs text-muted-foreground">Positive</p>
            <p className="text-[10px] text-muted-foreground flex items-center justify-center gap-0.5"><ThumbsUp size={9} /> reviews</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-red-600">{negative}</p>
            <p className="text-xs text-muted-foreground">Needs Work</p>
            <p className="text-[10px] text-muted-foreground flex items-center justify-center gap-0.5"><ThumbsDown size={9} /> reviews</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold">{DEMO_FEEDBACK.length}</p>
            <p className="text-xs text-muted-foreground">Total Reviews</p>
            <p className="text-[10px] text-muted-foreground">{withComments} with comments</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Survey results */}
        <Card>
          <CardHeader><CardTitle className="text-sm flex items-center gap-2"><BarChart3 size={14} /> Survey Results</CardTitle></CardHeader>
          <CardContent className="space-y-5">
            {SURVEY_QUESTIONS.map(q => {
              const total = q.responses.reduce((a, r) => a + r.count, 0)
              return (
                <div key={q.id}>
                  <p className="text-xs font-medium mb-2">{q.question}</p>
                  <div className="space-y-1.5">
                    {q.responses.map(r => (
                      <div key={r.label} className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground w-20 shrink-0">{r.label}</span>
                        <div className="flex-1 bg-muted rounded-full h-1.5">
                          <div
                            className="bg-primary h-1.5 rounded-full transition-all"
                            style={{ width: `${(r.count / total) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium w-8 text-right">{r.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>

        {/* Rating distribution */}
        <Card>
          <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Star size={14} className="text-yellow-500" /> Rating Breakdown</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {[5, 4, 3, 2, 1].map(star => {
              const count = DEMO_FEEDBACK.filter(f => f.rating === star).length
              const pct = Math.round((count / DEMO_FEEDBACK.length) * 100)
              return (
                <div key={star} className="flex items-center gap-2">
                  <span className="flex items-center gap-0.5 text-xs text-muted-foreground w-12 shrink-0">
                    {star} <Star size={10} className="text-yellow-400 fill-yellow-400" />
                  </span>
                  <div className="flex-1 bg-muted rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${star >= 4 ? 'bg-green-500' : star === 3 ? 'bg-yellow-400' : 'bg-red-400'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground w-8 text-right">{count}</span>
                </div>
              )
            })}
            <div className="pt-2 border-t">
              <p className="text-xs text-muted-foreground">
                NPS Score: <span className="font-semibold text-green-600">+62</span> (Excellent)
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                30/38 students would recommend — top 15% of coaching institutes
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Individual reviews */}
      <FeedbackClient feedback={DEMO_FEEDBACK} />
    </div>
  )
}
