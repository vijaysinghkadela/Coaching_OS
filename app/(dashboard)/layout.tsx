import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/layout/Sidebar'
import { Topbar } from '@/components/layout/Topbar'
import type { PlanTier } from '@/lib/constants'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, email')
    .eq('id', user.id)
    .single()

  const { data: institute } = await supabase
    .from('institutes')
    .select('id, name, plan_tier, onboarding_done')
    .eq('owner_id', user.id)
    .single()

  if (!institute) redirect('/signup')
  if (!institute.onboarding_done) redirect('/onboarding')

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar
        instituteName={institute.name}
        tier={institute.plan_tier as PlanTier}
      />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar
          userName={profile?.full_name ?? ''}
          userEmail={profile?.email ?? user.email ?? ''}
        />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
