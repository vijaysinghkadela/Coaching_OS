import { Sidebar } from '@/components/layout/Sidebar'
import { Topbar } from '@/components/layout/Topbar'
import type { PlanTier } from '@/lib/constants'
import { DEMO_INSTITUTE, DEMO_PROFILES } from '@/lib/demo/data'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const profile = DEMO_PROFILES[0]

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar
        instituteName={DEMO_INSTITUTE.name}
        tier={DEMO_INSTITUTE.plan_tier as PlanTier}
      />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar
          userName={profile?.full_name ?? 'Demo User'}
          userEmail={profile?.email ?? 'demo@coachingos.in'}
        />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
