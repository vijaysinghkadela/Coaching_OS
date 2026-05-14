import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { UserPlus, ClipboardCheck, CreditCard, FileText } from 'lucide-react'

const ACTIONS = [
  { label: 'Enroll Student', icon: UserPlus, href: '/students/new', color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400' },
  { label: 'Mark Attendance', icon: ClipboardCheck, href: '/attendance/mark', color: 'bg-green-500/10 text-green-600 dark:text-green-400' },
  { label: 'Collect Fee', icon: CreditCard, href: '/fees/collect', color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' },
  { label: 'Add Test', icon: FileText, href: '/tests/new', color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400' },
]

export function QuickActions() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {ACTIONS.map((action) => (
        <Link key={action.href} href={action.href}>
          <Card className="hover:bg-accent/30 transition-all duration-150 cursor-pointer h-full group">
            <CardContent className="flex flex-col items-center justify-center gap-2 py-5 px-3 text-center">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${action.color} group-hover:scale-110 transition-transform duration-150`}>
                <action.icon size={18} />
              </div>
              <span className="text-xs font-medium text-foreground leading-tight">{action.label}</span>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}
