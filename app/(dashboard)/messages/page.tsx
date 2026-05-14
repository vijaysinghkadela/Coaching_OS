'use client'

import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Send, User } from 'lucide-react'
import { useState } from 'react'
import { DEMO_STUDENTS } from '@/lib/demo/data'

const CHATS = DEMO_STUDENTS.slice(0, 5).map(s => ({ id: s.id, name: s.full_name, lastMsg: 'Looking forward to the next class!', time: '2h ago', unread: Math.floor(Math.random() * 3) }))

export default function MessagesPage() {
  const [selected, setSelected] = useState(CHATS[0]?.id ?? '')
  const [text, setText] = useState('')
  const chat = CHATS.find(c => c.id === selected)

  return (
    <div className="space-y-6 p-6">
      <PageHeader title="Messages" description="Chat with students and parents" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[60vh]">
        <Card className="lg:col-span-1 overflow-hidden">
          <CardHeader className="pb-2"><Input placeholder="Search conversations..." className="h-8 text-xs" /></CardHeader>
          <CardContent className="p-0 divide-y overflow-y-auto">
            {CHATS.map(c => (
              <div key={c.id} className={`p-3 cursor-pointer hover:bg-muted/50 ${selected === c.id ? 'bg-muted' : ''}`} onClick={() => setSelected(c.id)}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center"><User size={14} className="text-primary" /></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{c.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{c.lastMsg}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[10px] text-muted-foreground">{c.time}</p>
                    {c.unread > 0 && <span className="text-[10px] bg-primary text-primary-foreground rounded-full px-1.5">{c.unread}</span>}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card className="lg:col-span-2 flex flex-col">
          <CardHeader className="pb-2 border-b"><CardTitle className="text-sm">{chat?.name ?? 'Select a chat'}</CardTitle></CardHeader>
          <CardContent className="flex-1 p-4 overflow-y-auto space-y-3">
            <div className="bg-muted p-3 rounded-lg max-w-[70%] text-sm"><p>Hello sir, when is the next class?</p><p className="text-[10px] text-muted-foreground mt-1">10:30 AM</p></div>
            <div className="bg-primary text-primary-foreground p-3 rounded-lg max-w-[70%] ml-auto text-sm"><p>Tomorrow at 7 AM as usual.</p><p className="text-[10px] opacity-70 mt-1">10:32 AM</p></div>
          </CardContent>
          <div className="p-3 border-t flex gap-2">
            <Input value={text} onChange={e => setText(e.target.value)} placeholder="Type a message..." className="h-9 text-sm" />
            <Button size="icon" className="h-9 w-9 shrink-0"><Send size={14} /></Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
