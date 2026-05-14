'use client'

import { useState } from 'react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Send, MessageSquare } from 'lucide-react'
import { DEMO_BATCHES } from '@/lib/demo/data'

export default function CommunicationPage() {
  const [batchId, setBatchId] = useState('all')
  const [audience, setAudience] = useState('all')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSend = async () => {
    if (!message.trim()) return toast.error('Enter a message')
    setLoading(true)
    await new Promise(r => setTimeout(r, 1500))
    toast.success('WhatsApp messages queued!')
    setLoading(false)
    setMessage('')
  }

  return (
    <div className="space-y-6 p-6">
      <PageHeader title="WhatsApp Alerts" description="Send bulk messages to students and parents" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Send size={14} /> Compose Broadcast</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Batch</Label><Select value={batchId} onValueChange={v => v && setBatchId(v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All Batches</SelectItem>{DEMO_BATCHES.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent></Select></div>
              <div><Label>Audience</Label><Select value={audience} onValueChange={v => v && setAudience(v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Students & Parents</SelectItem><SelectItem value="students">Students Only</SelectItem><SelectItem value="parents">Parents Only</SelectItem></SelectContent></Select></div>
            </div>
            <div><Label>Message</Label><Textarea rows={5} value={message} onChange={e => setMessage(e.target.value)} placeholder="Type your message here..." /></div>
            <Button onClick={handleSend} disabled={loading} className="w-full">{loading ? 'Sending...' : 'Send via WhatsApp'}</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm flex items-center gap-2"><MessageSquare size={14} /> Recent Broadcasts</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              {[
                { msg: 'Reminder: Parent-Teacher meeting this Saturday at 10 AM.', sent: '2h ago', status: 'delivered' },
                { msg: 'Fee due date approaching for outstanding balances.', sent: '1d ago', status: 'delivered' },
                { msg: 'Class cancelled tomorrow due to holiday.', sent: '3d ago', status: 'read' },
              ].map((b, i) => (
                <div key={i} className="p-3 border rounded-lg">
                  <p className="text-xs">{b.msg}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[10px] text-muted-foreground">{b.sent}</span>
                    <Badge variant="outline" className="text-[10px]">{b.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
