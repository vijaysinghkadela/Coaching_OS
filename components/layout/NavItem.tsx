'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

interface NavItemProps {
  href: string
  icon: LucideIcon
  label: string
  collapsed?: boolean
  proOnly?: boolean
  tier?: string
}

export function NavItem({ href, icon: Icon, label, collapsed, proOnly, tier }: NavItemProps) {
  const pathname = usePathname()
  const isActive = pathname === href || pathname.startsWith(href + '/')
  const isLocked = proOnly && tier !== 'pro'

  return (
    <Link
      href={isLocked ? '/settings/billing?upgrade=pro' : href}
      className={cn(
        'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
        'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
        isActive && 'bg-sidebar-accent text-sidebar-accent-foreground',
        !isActive && 'text-sidebar-foreground',
        collapsed && 'justify-center px-2'
      )}
      title={collapsed ? label : undefined}
    >
      <Icon size={18} className={cn('shrink-0', isLocked && 'opacity-50')} />
      {!collapsed && (
        <span className="truncate">
          {label}
          {isLocked && (
            <span className="ml-2 text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-semibold">
              PRO
            </span>
          )}
        </span>
      )}
    </Link>
  )
}
