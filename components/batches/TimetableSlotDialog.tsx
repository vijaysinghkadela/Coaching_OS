'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createTimetableSlot } from '@/lib/actions/batches'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

interface TimetableSlotDialogProps {
  open: boolean
  onOpenChange: (_open: boolean) => void
  batchId: string
  defaultDay: number
  teachers: { id: string; full_name: string }[]
  rooms: { id: string; name: string }[]
}

export function TimetableSlotDialog({ open, onOpenChange, batchId, defaultDay, teachers, rooms }: TimetableSlotDialogProps) {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    subject: '',
    day_of_week: defaultDay,
    start_time: '09:00',
    end_time: '10:00',
    teacher_id: '',
    room_id: '',
  })
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const res = await createTimetableSlot({ ...form, batch_id: batchId, teacher_id: form.teacher_id || undefined, room_id: form.room_id || undefined })
    setLoading(false)
    if (res.error) {
      toast.error(res.error)
    } else {
      toast.success('Slot added')
      onOpenChange(false)
      router.refresh()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Add Timetable Slot</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Day</Label>
            <Select value={String(form.day_of_week)} onValueChange={(v) => setForm((f) => ({ ...f, day_of_week: Number(v) }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {DAYS.map((d, i) => <SelectItem key={d} value={String(i)}>{d}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Subject *</Label>
            <Input value={form.subject} onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))} placeholder="Physics" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Start Time</Label>
              <Input type="time" value={form.start_time} onChange={(e) => setForm((f) => ({ ...f, start_time: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>End Time</Label>
              <Input type="time" value={form.end_time} onChange={(e) => setForm((f) => ({ ...f, end_time: e.target.value }))} />
            </div>
          </div>
          {teachers.length > 0 && (
            <div className="space-y-1.5">
              <Label>Teacher</Label>
              <Select value={form.teacher_id} onValueChange={(v) => setForm((f) => ({ ...f, teacher_id: v ?? '' }))}>
                <SelectTrigger><SelectValue placeholder="Select teacher" /></SelectTrigger>
                <SelectContent>
                  {teachers.map((t) => <SelectItem key={t.id} value={t.id}>{t.full_name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}
          {rooms.length > 0 && (
            <div className="space-y-1.5">
              <Label>Room</Label>
              <Select value={form.room_id} onValueChange={(v) => setForm((f) => ({ ...f, room_id: v ?? '' }))}>
                <SelectTrigger><SelectValue placeholder="Select room" /></SelectTrigger>
                <SelectContent>
                  {rooms.map((r) => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}
          <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Saving…' : 'Add Slot'}</Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
