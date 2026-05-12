import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Bell, CalendarCheck, IndianRupee, MessageSquare,
  AlertTriangle, CheckCircle2, Users, Sparkles, Settings,
} from 'lucide-react'

const NOTIFICATIONS = [
  {
    id: 'n-001', type: 'absence_alert', title: 'Consecutive Absence Alert',
    body: 'Rohit Agarwal (SHRM-0003) has missed 3 consecutive sessions in JEE 2026 Morning.',
    time: '10 min ago', read: false, icon: 'alert', action: 'View Student',
  },
  {
    id: 'n-002', type: 'session_reminder', title: 'Session Starting in 30 Minutes',
    body: 'Physics — Rotational Motion · JEE 2026 Morning · Room A · 07:00 AM',
    time: '25 min ago', read: false, icon: 'calendar', action: 'View Schedule',
  },
  {
    id: 'n-003', type: 'fee_payment', title: 'Fee Payment Received',
    body: 'Arjun Mehta paid ₹18,000 (Installment 4/4) for JEE Annual Fee 2025-26.',
    time: '1 hr ago', read: false, icon: 'fee', action: 'View Receipt',
  },
  {
    id: 'n-004', type: 'message', title: 'New Message from Parent',
    body: 'Harpal Singh (Ananya\'s parent): "When is the 3rd installment due? I need to plan accordingly."',
    time: '2 hr ago', read: false, icon: 'message', action: 'Reply',
  },
  {
    id: 'n-005', type: 'test_result', title: 'Test Results Published',
    body: 'JEE Mock Test #7 results are ready. Arjun Mehta ranked 1st with 187/240.',
    time: '5 hr ago', read: true, icon: 'check', action: 'View Results',
  },
  {
    id: 'n-006', type: 'enrollment', title: 'New Student Enrolled',
    body: 'Mohit Sharma (SHRM-0015) has been enrolled in JEE 2026 Morning batch.',
    time: 'Yesterday', read: true, icon: 'student', action: 'View Profile',
  },
  {
    id: 'n-007', type: 'ai_report', title: 'AI Report Ready',
    body: 'Performance prediction report for NEET 2026 Batch A is ready. 2 students flagged as at-risk.',
    time: 'Yesterday', read: true, icon: 'ai', action: 'View Report',
  },
  {
    id: 'n-008', type: 'session_reminder', title: 'Session Completed',
    body: 'Chemistry — Organic Reactions marked complete. 5/6 students attended.',
    time: '2 days ago', read: true, icon: 'calendar', action: null,
  },
  {
    id: 'n-009', type: 'fee_overdue', title: 'Fee Overdue Alert',
    body: 'Sneha Gupta\'s fee installment of ₹18,000 was due on Nov 1 and remains unpaid.',
    time: '3 days ago', read: true, icon: 'alert', action: 'Send Reminder',
  },
  {
    id: 'n-010', type: 'whatsapp', title: 'WhatsApp Broadcast Sent',
    body: 'Holiday notice sent to 15 parents successfully. 13/15 delivered.',
    time: '4 days ago', read: true, icon: 'message', action: 'View Details',
  },
]

const ICON_MAP: Record<string, React.ReactNode> = {
  alert:    <AlertTriangle size={15} className="text-red-500" />,
  calendar: <CalendarCheck size={15} className="text-blue-500" />,
  fee:      <IndianRupee size={15} className="text-green-500" />,
  message:  <MessageSquare size={15} className="text-purple-500" />,
  check:    <CheckCircle2 size={15} className="text-green-600" />,
  student:  <Users size={15} className="text-teal-500" />,
  ai:       <Sparkles size={15} className="text-indigo-500" />,
}

const TYPE_LABELS: Record<string, { label: string; color: string }> = {
  absence_alert:   { label: 'Absence Alert',  color: 'bg-red-100 text-red-700' },
  session_reminder:{ label: 'Session',        color: 'bg-blue-100 text-blue-700' },
  fee_payment:     { label: 'Payment',        color: 'bg-green-100 text-green-700' },
  fee_overdue:     { label: 'Fee Overdue',    color: 'bg-orange-100 text-orange-700' },
  message:         { label: 'Message',        color: 'bg-purple-100 text-purple-700' },
  test_result:     { label: 'Test',           color: 'bg-teal-100 text-teal-700' },
  enrollment:      { label: 'Enrollment',     color: 'bg-cyan-100 text-cyan-700' },
  ai_report:       { label: 'AI',             color: 'bg-indigo-100 text-indigo-700' },
  whatsapp:        { label: 'WhatsApp',       color: 'bg-green-100 text-green-700' },
}

export default async function NotificationsPage() {
  const unread = NOTIFICATIONS.filter(n => !n.read).length

  return (
    <div className="space-y-4">
      <PageHeader
        title="Notifications"
        description={`${unread} unread · Session reminders, payment alerts, messages, and system updates`}
        action={
          <div className="flex gap-2">
            <Button variant="outline" size="sm">Mark all read</Button>
            <Button variant="ghost" size="icon" className="h-8 w-8"><Settings size={14} /></Button>
          </div>
        }
      />

      {/* Category filter pills */}
      <div className="flex flex-wrap gap-2">
        {['All', 'Unread', 'Alerts', 'Sessions', 'Payments', 'Messages'].map(f => (
          <button
            key={f}
            className={`text-xs px-3 py-1 rounded-full border font-medium transition-colors ${
              f === 'All' ? 'bg-primary text-primary-foreground border-primary' : 'bg-background hover:bg-accent'
            }`}
          >
            {f}
            {f === 'Unread' && unread > 0 && (
              <span className="ml-1.5 bg-primary text-primary-foreground text-[10px] w-4 h-4 rounded-full inline-flex items-center justify-center font-bold">
                {unread}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Notification list */}
      <div className="space-y-1">
        {NOTIFICATIONS.map(n => {
          const typeInfo = TYPE_LABELS[n.type]
          return (
            <Card key={n.id} className={n.read ? 'opacity-70' : 'ring-1 ring-primary/20'}>
              <CardContent className="p-3 flex items-start gap-3">
                {/* Unread dot */}
                <div className="mt-1 shrink-0">
                  {!n.read && <span className="block w-2 h-2 rounded-full bg-primary" />}
                  {n.read && <span className="block w-2 h-2" />}
                </div>

                {/* Icon */}
                <div className="mt-0.5 shrink-0">
                  {ICON_MAP[n.icon]}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium">{n.title}</p>
                      {typeInfo && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${typeInfo.color}`}>
                          {typeInfo.label}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-muted-foreground shrink-0">{n.time}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{n.body}</p>
                  {n.action && (
                    <button className="text-xs text-primary font-medium mt-1 hover:underline">
                      {n.action} →
                    </button>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Notification preferences hint */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2">
        <Bell size={12} />
        <span>Manage notification preferences in <button className="underline">Settings → Notifications</button></span>
      </div>
    </div>
  )
}
