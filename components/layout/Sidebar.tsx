'use client'

import { useState } from 'react'
import {
  LayoutDashboard, Users, Layers, CalendarCheck, IndianRupee,
  ClipboardList, MessageSquare, UserCheck, Sparkles, Settings,
  ChevronLeft, ChevronRight, GraduationCap, Calendar, Target,
  BarChart3, BookOpen, Mail, BookMarked,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { NavItem } from './NavItem'
import { Badge } from '@/components/ui/badge'
import type { PlanTier } from '@/lib/constants'
import { TIER_LIMITS } from '@/lib/constants'

const NAV_GROUPS = [
  {
    label: 'Core',
    items: [
      { href: '/dashboard',     icon: LayoutDashboard, label: 'Dashboard' },
      { href: '/students',      icon: Users,           label: 'Students' },
      { href: '/batches',       icon: Layers,          label: 'Batches' },
    ],
  },
  {
    label: 'Operations',
    items: [
      { href: '/attendance',    icon: CalendarCheck,   label: 'Attendance' },
      { href: '/fees',          icon: IndianRupee,     label: 'Fees' },
      { href: '/tests',         icon: ClipboardList,   label: 'Tests' },
      { href: '/schedule',      icon: Calendar,        label: 'Schedule' },
    ],
  },
  {
    label: 'Students',
    items: [
      { href: '/goals',         icon: Target,          label: 'Goals & Progress' },
      { href: '/programs',      icon: BookMarked,      label: 'Programs' },
      { href: '/content',       icon: BookOpen,        label: 'Content Library' },
    ],
  },
  {
    label: 'Communication',
    items: [
      { href: '/messages',      icon: Mail,            label: 'Messages' },
      { href: '/communication', icon: MessageSquare,   label: 'WhatsApp Alerts' },
    ],
  },
  {
    label: 'Insights',
    items: [
      { href: '/analytics',     icon: BarChart3,       label: 'Analytics' },
      { href: '/staff',         icon: UserCheck,       label: 'Staff', proOnly: true },
      { href: '/ai',            icon: Sparkles,        label: 'AI Features', proOnly: true },
    ],
  },
]

interface SidebarProps {
  instituteName: string
  tier: PlanTier
}

export function Sidebar({ instituteName, tier }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={cn(
        'relative flex flex-col border-r bg-sidebar h-full transition-all duration-200',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Logo + Institute name */}
      <div className="flex items-center gap-3 px-4 py-5 border-b">
        <div className="w-8 h-8 shrink-0 rounded-lg bg-primary flex items-center justify-center">
          <GraduationCap size={16} className="text-primary-foreground" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <p className="text-xs font-semibold text-sidebar-foreground truncate">{instituteName}</p>
            <p className="text-[10px] text-muted-foreground">Coaching OS</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-4">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            {!collapsed && (
              <p className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {group.label}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <NavItem
                  key={item.href}
                  href={item.href}
                  icon={item.icon}
                  label={item.label}
                  collapsed={collapsed}
                  proOnly={item.proOnly}
                  tier={tier}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Tier badge + Settings */}
      <div className="px-2 pb-4 space-y-1 border-t pt-3">
        {!collapsed && (
          <div className="px-3 py-2">
            <Badge
              variant="outline"
              className="text-xs border-primary text-primary"
            >
              {TIER_LIMITS[tier].label} Plan
            </Badge>
          </div>
        )}
        <NavItem href="/settings" icon={Settings} label="Settings" collapsed={collapsed} />
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className={cn(
          'absolute -right-3 top-20 z-10',
          'w-6 h-6 rounded-full border bg-background shadow-sm',
          'flex items-center justify-center hover:bg-accent transition-colors'
        )}
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </aside>
  )
}
