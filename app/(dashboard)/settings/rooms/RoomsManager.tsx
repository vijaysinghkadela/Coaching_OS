'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Plus, School } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Room { id: string; name: string; capacity: number | null; is_active: boolean }

export function RoomsManager({ rooms: initial, instituteId }: { rooms: Room[]; instituteId: string }) {
  const [rooms, setRooms] = useState(initial)
  const [name, setName] = useState('')
  const [capacity, setCapacity] = useState('')
  const [loading, setLoading] = useState(false)

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from('rooms')
      .insert({
        institute_id: instituteId,
        name: name.trim(),
        capacity: capacity ? Number(capacity) : null,
      })
      .select('id, name, capacity, is_active')
      .single()
    setLoading(false)
    if (error) toast.error(error.message)
    else {
      toast.success('Room added')
      setRooms((prev) => [...prev, data])
      setName('')
      setCapacity('')
    }
  }

  const toggleActive = async (id: string, current: boolean) => {
    const supabase = createClient()
    const { error } = await supabase.from('rooms').update({ is_active: !current }).eq('id', id)
    if (error) toast.error(error.message)
    else setRooms((prev) => prev.map((r) => r.id === id ? { ...r, is_active: !current } : r))
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Add Classroom</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleAdd} className="space-y-3">
            <div className="space-y-1.5">
              <Label>Room Name *</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Room A / Lab 1" required />
            </div>
            <div className="space-y-1.5">
              <Label>Capacity</Label>
              <Input type="number" min={1} max={500} value={capacity} onChange={(e) => setCapacity(e.target.value)} placeholder="40" />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              <Plus size={14} className="mr-1" />{loading ? 'Adding…' : 'Add Room'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="lg:col-span-2 space-y-3">
        {rooms.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <School size={32} className="mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No rooms yet. Add your first classroom.</p>
            </CardContent>
          </Card>
        ) : (
          rooms.map((r) => (
            <Card key={r.id} className={!r.is_active ? 'opacity-60' : ''}>
              <CardContent className="py-3 px-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">{r.name}</p>
                  {r.capacity && <p className="text-xs text-muted-foreground">Capacity: {r.capacity} students</p>}
                </div>
                <Button variant={r.is_active ? 'outline' : 'default'} size="sm" onClick={() => toggleActive(r.id, r.is_active)}>
                  {r.is_active ? 'Deactivate' : 'Activate'}
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
