'use client'

import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, IndianRupee, Users, FileText } from 'lucide-react'

const NOTIFICATIONS = [
  { id: 'n1', title: 'Fee Due Reminder', desc: '5 students have pending fees beyond due date.', time: '2h ago', icon: IndianRupee, color: 'text-orange-600' },
  { id: 'n2', title: 'Attendance Alert', desc: 'Sneha Gupta has below 75% attendance this month.', time: '5h ago', icon: Users, color: 'text-red-600' },
  { id: 'n3', title: 'Test Scheduled', desc: 'Physics Unit Test scheduled for May 20.', time: '1d ago', icon: Calendar, color: 'text-blue-600' },
  { id: 'n4', title: 'New Enrollment', desc: 'Kavya Rajput enrolled in NEET 2026 Batch A.', time: '2d ago', icon: Users, color: 'text-green-600' },
  { id: 'n5', title: 'Document Uploaded', desc: 'New study material added to Content Library.', time: '3d ago', icon: FileText, color: 'text-purple-600' },
]

export default function NotificationsPage() {
  return (
    <div className="space-y-6 p-6">
      <PageHeader title="Notifications" description="Alerts and updates" />
      <div className="space-y-3">
        {NOTIFICATIONS.map(n => {
          const Icon = n.icon
          return (
            <Card key={n.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="p-4 flex items-start gap-4">
                <div className={`w-9 h-9 rounded-full bg-muted flex items-center justify-center shrink-0 ${n.color}`}><Icon size={16} /></div>
                <div className="flex-1 min-w-0"><p className="font-medium text-sm">{n.title}</p><p className="text-xs text-muted-foreground mt-0.5">{n.desc}</p></div>
                <Badge variant="outline" className="text-[10px] shrink-0">{n.time}</Badge>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
