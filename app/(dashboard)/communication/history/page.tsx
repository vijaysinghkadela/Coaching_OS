'use client'

import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const HISTORY = [
  { id: 'm1', type: 'broadcast', to: 'All Students (JEE 2026 Morning)', content: 'Reminder: Class tomorrow at 7 AM. Bring your practice set.', status: 'delivered', sentAt: '2026-05-13T10:00:00Z', count: 35 },
  { id: 'm2', type: 'broadcast', to: 'NEET 2026 Batch A', content: 'Biology class rescheduled to 5 PM today.', status: 'read', sentAt: '2026-05-12T14:30:00Z', count: 28 },
  { id: 'm3', type: 'broadcast', to: 'All Parents', content: 'Parent-Teacher meeting this Saturday. Please confirm attendance.', status: 'delivered', sentAt: '2026-05-11T09:00:00Z', count: 63 },
  { id: 'm4', type: 'reminder', to: 'Defaulters', content: 'Fee payment overdue. Please clear dues by May 20.', status: 'delivered', sentAt: '2026-05-10T08:00:00Z', count: 12 },
  { id: 'm5', type: 'alert', to: 'All Batches', content: 'Institute will remain closed on May 30 for maintenance.', status: 'read', sentAt: '2026-05-09T16:00:00Z', count: 98 },
]

export default function CommunicationHistoryPage() {
  return (
    <div className="space-y-6 p-6">
      <PageHeader title="Message History" description="Sent WhatsApp messages and broadcasts" />
      <Card>
        <CardHeader><CardTitle className="text-sm">All Messages</CardTitle></CardHeader>
        <CardContent>
          <div className="divide-y text-sm">
            {HISTORY.map(m => (
              <div key={m.id} className="py-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs">{m.content}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">{m.to} · {m.sentAt.slice(0, 10)} · {m.count} recipients</p>
                  </div>
                  <Badge variant={m.status === 'read' ? 'default' : 'secondary'} className="text-[10px] shrink-0">{m.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
