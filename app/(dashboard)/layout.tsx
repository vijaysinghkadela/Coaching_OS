import Link from 'next/link'
import { DEMO_INSTITUTE } from '@/lib/demo/data'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
          <div>
            <p className="text-sm font-semibold">{DEMO_INSTITUTE.name}</p>
            <p className="text-xs text-muted-foreground">Showcase mode</p>
          </div>
          <nav className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <Link href="/dashboard" className="hover:text-foreground">Dashboard</Link>
            <Link href="/students" className="hover:text-foreground">Students</Link>
            <Link href="/attendance" className="hover:text-foreground">Attendance</Link>
            <Link href="/analytics" className="hover:text-foreground">Analytics</Link>
            <Link href="/settings" className="hover:text-foreground">Settings</Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl p-6">
        {children}
      </main>
    </div>
  )
}
