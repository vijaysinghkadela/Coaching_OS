'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Send, Search, User, Users, Briefcase } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Thread {
  id: string; with: string; avatar: string; subject: string
  last_message: string; time: string; unread: number; type: string
}
interface Msg { from: string; text: string; time: string; isMine: boolean }

const typeIcon = { student: <User size={11} />, parent: <Users size={11} />, staff: <Briefcase size={11} /> }
const typeColor = { student: 'bg-blue-100 text-blue-700', parent: 'bg-purple-100 text-purple-700', staff: 'bg-green-100 text-green-700' }

export function MessagesClient({ threads, activeMessages }: { threads: Thread[]; activeMessages: Msg[] }) {
  const [activeId, setActiveId] = useState(threads[1]?.id)
  const [msg, setMsg] = useState('')
  const [messages, setMessages] = useState<Msg[]>(activeMessages)
  const active = threads.find(t => t.id === activeId)

  function send() {
    if (!msg.trim()) return
    setMessages(prev => [...prev, { from: 'You', text: msg, time: 'Just now', isMine: true }])
    setMsg('')
  }

  return (
    <div className="flex gap-0 border rounded-xl overflow-hidden h-[calc(100vh-220px)] min-h-[480px]">
      {/* Thread list */}
      <div className="w-72 shrink-0 border-r flex flex-col bg-card">
        <div className="p-3 border-b">
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-2.5 text-muted-foreground" />
            <Input placeholder="Search conversations…" className="pl-8 h-8 text-sm" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto divide-y">
          {threads.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveId(t.id)}
              className={cn('w-full text-left px-3 py-3 hover:bg-accent/50 transition-colors', activeId === t.id && 'bg-accent')}
            >
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                  {t.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold truncate">{t.with}</p>
                    <span className="text-[10px] text-muted-foreground shrink-0 ml-1">{t.time}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground truncate">{t.last_message}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className={cn('flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded-full font-medium', typeColor[t.type as keyof typeof typeColor])}>
                      {typeIcon[t.type as keyof typeof typeIcon]} {t.type}
                    </span>
                    {t.unread > 0 && <span className="ml-auto bg-primary text-primary-foreground text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">{t.unread}</span>}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col bg-background">
        {active ? (
          <>
            <div className="px-4 py-3 border-b flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                {active.avatar}
              </div>
              <div>
                <p className="text-sm font-semibold">{active.with}</p>
                <p className="text-xs text-muted-foreground">{active.subject}</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((m, i) => (
                <div key={i} className={cn('flex', m.isMine ? 'justify-end' : 'justify-start')}>
                  <div className={cn('max-w-[75%] rounded-2xl px-3 py-2 text-sm', m.isMine ? 'bg-primary text-primary-foreground rounded-br-sm' : 'bg-muted rounded-bl-sm')}>
                    <p>{m.text}</p>
                    <p className={cn('text-[10px] mt-1', m.isMine ? 'text-primary-foreground/70 text-right' : 'text-muted-foreground')}>{m.time}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 border-t flex gap-2">
              <Input
                value={msg}
                onChange={e => setMsg(e.target.value)}
                placeholder="Type a message…"
                className="flex-1 h-9 text-sm"
                onKeyDown={e => e.key === 'Enter' && send()}
              />
              <Button size="sm" onClick={send} className="h-9 w-9 p-0">
                <Send size={14} />
              </Button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
            Select a conversation
          </div>
        )}
      </div>
    </div>
  )
}
