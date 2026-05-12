'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { Send } from 'lucide-react'

interface Batch { id: string; name: string }

interface BroadcastComposerProps {
  batches: Batch[]
  instituteId: string
}

export function BroadcastComposer({ batches }: BroadcastComposerProps) {
  const [batchId, setBatchId] = useState('')
  const [audience, setAudience] = useState<'students' | 'parents' | 'all'>('all')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSend = async () => {
    if (!message.trim()) { toast.error('Enter a message'); return }
    setLoading(true)
    const res = await fetch('/api/communication/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ batchId: batchId || null, audience, message }),
    })
    setLoading(false)
    const data = await res.json()
    if (!res.ok) toast.error(data.error ?? 'Failed to send')
    else { toast.success(`Message queued for ${data.count} recipients`); setMessage('') }
  }

  const charCount = message.length

  return (
    <Card>
      <CardHeader className="pb-2"><CardTitle className="text-sm">Compose Broadcast</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Batch (optional)</Label>
            <Select value={batchId} onValueChange={(v) => setBatchId(v ?? '')}>
              <SelectTrigger><SelectValue placeholder="All batches" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">All batches</SelectItem>
                {batches.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Send To</Label>
            <Select value={audience} onValueChange={(v) => setAudience(v as typeof audience)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Students &amp; Parents</SelectItem>
                <SelectItem value="students">Students only</SelectItem>
                <SelectItem value="parents">Parents only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Message *</Label>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={5}
            placeholder="Type your message here… Supports emojis and basic formatting."
            maxLength={1024}
          />
          <p className="text-xs text-muted-foreground text-right">{charCount}/1024</p>
        </div>

        <Button className="w-full" onClick={handleSend} disabled={loading || !message.trim()}>
          <Send size={14} className="mr-2" />
          {loading ? 'Sending…' : 'Send WhatsApp Broadcast'}
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          Requires Meta WhatsApp Business API to be configured in settings.
        </p>
      </CardContent>
    </Card>
  )
}
