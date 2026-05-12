'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Plus, BookOpen } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Course {
  id: string
  name: string
  subjects: string[] | null
  duration_months: number | null
  is_active: boolean
}

export function CoursesManager({ courses: initial, instituteId }: { courses: Course[]; instituteId: string }) {
  const [courses, setCourses] = useState(initial)
  const [name, setName] = useState('')
  const [subjects, setSubjects] = useState('')
  const [months, setMonths] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from('courses')
      .insert({
        institute_id: instituteId,
        name: name.trim(),
        subjects: subjects.trim() ? subjects.split(',').map((s) => s.trim()).filter(Boolean) : [],
        duration_months: months ? Number(months) : null,
      })
      .select('id, name, subjects, duration_months, is_active')
      .single()
    setLoading(false)
    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Course added')
      setCourses((prev) => [data, ...prev])
      setName('')
      setSubjects('')
      setMonths('')
    }
  }

  const toggleActive = async (id: string, current: boolean) => {
    const supabase = createClient()
    const { error } = await supabase.from('courses').update({ is_active: !current }).eq('id', id)
    if (error) toast.error(error.message)
    else {
      setCourses((prev) => prev.map((c) => c.id === id ? { ...c, is_active: !current } : c))
      router.refresh()
    }
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* Add form */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Add Course</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleAdd} className="space-y-3">
            <div className="space-y-1.5">
              <Label>Course Name *</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="JEE Mains 2026" required />
            </div>
            <div className="space-y-1.5">
              <Label>Subjects (comma-separated)</Label>
              <Input value={subjects} onChange={(e) => setSubjects(e.target.value)} placeholder="Physics, Chemistry, Maths" />
            </div>
            <div className="space-y-1.5">
              <Label>Duration (months)</Label>
              <Input type="number" min={1} max={60} value={months} onChange={(e) => setMonths(e.target.value)} placeholder="12" />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              <Plus size={14} className="mr-1" />{loading ? 'Adding…' : 'Add Course'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Course list */}
      <div className="lg:col-span-2 space-y-3">
        {courses.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <BookOpen size={32} className="mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No courses yet. Add your first course.</p>
            </CardContent>
          </Card>
        ) : (
          courses.map((c) => (
            <Card key={c.id} className={!c.is_active ? 'opacity-60' : ''}>
              <CardContent className="py-3 px-4 flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium">{c.name}</p>
                  {c.subjects && c.subjects.length > 0 && (
                    <div className="flex gap-1 flex-wrap mt-1">
                      {c.subjects.map((s) => (
                        <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                      ))}
                    </div>
                  )}
                  {c.duration_months && (
                    <p className="text-xs text-muted-foreground mt-0.5">{c.duration_months} months</p>
                  )}
                </div>
                <Button
                  variant={c.is_active ? 'outline' : 'default'}
                  size="sm"
                  onClick={() => toggleActive(c.id, c.is_active)}
                >
                  {c.is_active ? 'Deactivate' : 'Activate'}
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
