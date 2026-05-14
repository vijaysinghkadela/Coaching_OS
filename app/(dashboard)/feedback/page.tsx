'use client'

import { useState } from 'react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Star, MessageSquare } from 'lucide-react'
import { toast } from 'sonner'

const FEEDBACK = [
  { id: 'f1', student: 'Arjun Mehta', rating: 5, comment: 'Excellent teaching methods. Very helpful doubt sessions.', date: '2026-05-10' },
  { id: 'f2', student: 'Priya Sharma', rating: 4, comment: 'Good pace of classes. More practice problems would help.', date: '2026-05-08' },
  { id: 'f3', student: 'Rahul Verma', rating: 5, comment: 'Best coaching in Bikaner. Highly recommended.', date: '2026-05-05' },
]

export default function FeedbackPage() {
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async () => {
    setLoading(true)
    await new Promise(r => setTimeout(r, 1000))
    toast.success('Feedback submitted!')
    setLoading(false)
    setComment('')
  }

  return (
    <div className="space-y-6 p-6">
      <PageHeader title="Feedback" description="Student and parent feedback" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-sm">Submit Feedback</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><Label>Rating</Label><div className="flex gap-1 mt-1">{[1,2,3,4,5].map(n => <Star key={n} size={20} className={n <= rating ? 'text-yellow-500 fill-yellow-500 cursor-pointer' : 'text-muted-foreground cursor-pointer'} onClick={() => setRating(n)} />)}</div></div>
            <div><Label>Comment</Label><Textarea rows={4} value={comment} onChange={e => setComment(e.target.value)} placeholder="Share your experience..." /></div>
            <Button onClick={submit} disabled={loading || !comment.trim()}>{loading ? 'Submitting...' : 'Submit Feedback'}</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm flex items-center gap-2"><MessageSquare size={14} /> Recent Feedback</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {FEEDBACK.map(f => (
                <div key={f.id} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{f.student}</p>
                    <div className="flex gap-0.5">{Array.from({length: 5}).map((_, i) => <Star key={i} size={12} className={i < f.rating ? 'text-yellow-500 fill-yellow-500' : 'text-muted-foreground'} />)}</div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{f.comment}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">{f.date}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
