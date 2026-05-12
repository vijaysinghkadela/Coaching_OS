'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TimetableSlotDialog } from './TimetableSlotDialog'
import { deleteTimetableSlot } from '@/lib/actions/batches'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Plus, Trash2 } from 'lucide-react'

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const SHORT_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

interface Slot {
  id: string
  subject: string
  day_of_week: number
  start_time: string
  end_time: string
  teachers: { full_name: string } | null
  rooms: { name: string } | null
}

interface TimetableGridProps {
  batchId: string
  slots: Slot[]
  teachers: { id: string; full_name: string }[]
  rooms: { id: string; name: string }[]
}

export function TimetableGrid({ batchId, slots, teachers, rooms }: TimetableGridProps) {
  const [dialogDay, setDialogDay] = useState<number | null>(null)
  const router = useRouter()

  const slotsByDay = DAYS.map((_, day) => slots.filter((s) => s.day_of_week === day))

  const handleDelete = async (slotId: string) => {
    const res = await deleteTimetableSlot(slotId)
    if (res.error) toast.error(res.error)
    else { toast.success('Slot removed'); router.refresh() }
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
        {DAYS.map((day, dayIdx) => (
          <Card key={day} className="min-h-32">
            <CardHeader className="pb-2 px-3 pt-3">
              <CardTitle className="text-xs font-semibold text-muted-foreground flex justify-between items-center">
                <span className="hidden lg:inline">{day}</span>
                <span className="lg:hidden">{SHORT_DAYS[dayIdx]}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5"
                  onClick={() => setDialogDay(dayIdx)}
                >
                  <Plus size={12} />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-2 pb-2 space-y-1.5">
              {slotsByDay[dayIdx].map((slot) => (
                <div
                  key={slot.id}
                  className="group relative rounded-md bg-primary/10 p-2 text-xs"
                >
                  <p className="font-medium text-foreground truncate">{slot.subject}</p>
                  <p className="text-muted-foreground">{slot.start_time} – {slot.end_time}</p>
                  {slot.teachers && <p className="text-muted-foreground truncate">{slot.teachers.full_name}</p>}
                  {slot.rooms && <p className="text-muted-foreground">{slot.rooms.name}</p>}
                  <button
                    onClick={() => handleDelete(slot.id)}
                    className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 text-destructive"
                  >
                    <Trash2 size={10} />
                  </button>
                </div>
              ))}
              {slotsByDay[dayIdx].length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-2">Free</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {dialogDay !== null && (
        <TimetableSlotDialog
          open
          onOpenChange={(open) => !open && setDialogDay(null)}
          batchId={batchId}
          defaultDay={dialogDay}
          teachers={teachers}
          rooms={rooms}
        />
      )}
    </>
  )
}
