import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'
import { Plus, IndianRupee } from 'lucide-react'
import { AddFeeStructureForm } from './AddFeeStructureForm'

export default async function FeeStructuresPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: institute } = await supabase
    .from('institutes')
    .select('id')
    .eq('owner_id', user.id)
    .single()
  if (!institute) redirect('/signup')

  const [structuresRes, coursesRes] = await Promise.all([
    supabase
      .from('fee_structures')
      .select('id, name, total_amount, base_amount, gst_amount, gst_rate, installments, description, courses(name)')
      .eq('institute_id', institute.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('courses')
      .select('id, name')
      .eq('institute_id', institute.id)
      .eq('is_active', true)
      .order('name'),
  ])

  const structures = structuresRes.data ?? []
  const courses = coursesRes.data ?? []

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fee Structures"
        description="Define fee templates that can be assigned to students"
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Add form */}
        <div>
          <AddFeeStructureForm courses={courses} />
        </div>

        {/* Existing structures */}
        <div className="lg:col-span-2 space-y-3">
          {structures.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <IndianRupee size={32} className="mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No fee structures yet. Create one to get started.</p>
              </CardContent>
            </Card>
          ) : (
            structures.map((s) => {
              const course = (s.courses as unknown as { name: string }[] | null)?.[0] ?? null
              return (
                <Card key={s.id}>
                  <CardContent className="py-4 px-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-medium">{s.name}</h3>
                          {course && <Badge variant="secondary" className="text-xs">{course.name}</Badge>}
                          {s.gst_rate > 0 && (
                            <Badge variant="outline" className="text-xs">GST {s.gst_rate}%</Badge>
                          )}
                        </div>
                        {s.description && (
                          <p className="text-xs text-muted-foreground mt-0.5">{s.description}</p>
                        )}
                        <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                          <span>Base: {formatCurrency(s.base_amount ?? s.total_amount)}</span>
                          {s.gst_amount > 0 && <span>GST: {formatCurrency(s.gst_amount)}</span>}
                          {s.installments > 1 && <span>{s.installments} installments</span>}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-lg font-bold text-foreground">{formatCurrency(s.total_amount)}</p>
                        <p className="text-xs text-muted-foreground">total</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
