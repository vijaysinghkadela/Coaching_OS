import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PageHeader } from '@/components/shared/PageHeader'
import { BroadcastComposer } from './BroadcastComposer'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatRelative } from '@/lib/utils'

export default async function CommunicationPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: institute } = await supabase.from('institutes').select('id').eq('owner_id', user.id).single()
  if (!institute) redirect('/signup')

  const { data: batches } = await supabase
    .from('batches').select('id, name').eq('institute_id', institute.id).eq('status', 'active').order('name')

  const { data: messages } = await supabase
    .from('whatsapp_messages')
    .select('id, message_type, content, status, created_at, students(full_name)')
    .eq('institute_id', institute.id)
    .order('created_at', { ascending: false })
    .limit(20)

  return (
    <div className="space-y-6">
      <PageHeader title="Communication" description="Send WhatsApp messages to students and parents" />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <BroadcastComposer batches={batches ?? []} instituteId={institute.id} />

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Recent Messages</CardTitle></CardHeader>
          <CardContent>
            {!messages || messages.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No messages sent yet.</p>
            ) : (
              <div className="space-y-3">
                {messages.map((msg) => {
                  const student = (msg.students as unknown as { full_name: string }[] | null)?.[0] ?? null
                  return (
                    <div key={msg.id} className="text-sm border-b border-border pb-3 last:border-0">
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-xs text-muted-foreground capitalize">{msg.message_type?.replace(/_/g, ' ')}</p>
                          <p className="text-foreground line-clamp-2">{msg.content}</p>
                          {student && <p className="text-xs text-muted-foreground mt-0.5">To: {student.full_name}</p>}
                        </div>
                        <div className="text-right shrink-0">
                          <StatusBadge status={msg.status} />
                          <p className="text-xs text-muted-foreground mt-1">{formatRelative(new Date(msg.created_at))}</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
