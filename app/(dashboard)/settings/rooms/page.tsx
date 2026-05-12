import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PageHeader } from '@/components/shared/PageHeader'
import { RoomsManager } from './RoomsManager'

export default async function RoomsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: institute } = await supabase
    .from('institutes')
    .select('id')
    .eq('owner_id', user.id)
    .single()
  if (!institute) redirect('/signup')

  const { data: rooms } = await supabase
    .from('rooms')
    .select('id, name, capacity, is_active')
    .eq('institute_id', institute.id)
    .order('name')

  return (
    <div className="space-y-6">
      <PageHeader title="Classrooms" description="Manage classroom and lab inventory" />
      <RoomsManager rooms={rooms ?? []} instituteId={institute.id} />
    </div>
  )
}
