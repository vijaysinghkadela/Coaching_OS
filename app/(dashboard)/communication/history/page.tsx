import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent } from '@/components/ui/card'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { formatDateTime } from '@/lib/utils'
import { MessageSquare } from 'lucide-react'

export default async function CommunicationHistoryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: institute } = await supabase.from('institutes').select('id').eq('owner_id', user.id).single()
  if (!institute) redirect('/signup')

  const { data: messages } = await supabase
    .from('whatsapp_messages')
    .select('id, message_type, content, status, created_at, to_number, students(full_name, enrollment_no)')
    .eq('institute_id', institute.id)
    .order('created_at', { ascending: false })
    .limit(100)

  const TYPE_LABEL: Record<string, string> = {
    attendance_alert: 'Absence Alert',
    fee_reminder: 'Fee Reminder',
    test_result: 'Test Result',
    broadcast: 'Broadcast',
    custom: 'Custom',
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Message History" description="WhatsApp messages sent from Coaching OS" />

      {!messages || messages.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <MessageSquare size={32} className="mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No messages sent yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {messages.map((msg) => {
            const student = (msg.students as unknown as { full_name: string; enrollment_no: string }[] | null)?.[0] ?? null
            return (
              <Card key={msg.id}>
                <CardContent className="py-3 px-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                          {TYPE_LABEL[msg.message_type] ?? msg.message_type}
                        </span>
                        {student && (
                          <span className="text-xs text-muted-foreground">
                            → {student.full_name} ({student.enrollment_no})
                          </span>
                        )}
                      </div>
                      <p className="text-sm line-clamp-2 text-foreground">{msg.content}</p>
                      {msg.to_number && (
                        <p className="text-xs text-muted-foreground mt-0.5">To: {msg.to_number}</p>
                      )}
                    </div>
                    <div className="text-right shrink-0 space-y-1">
                      <StatusBadge status={msg.status} />
                      <p className="text-xs text-muted-foreground">{formatDateTime(msg.created_at)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
