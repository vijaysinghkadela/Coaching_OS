import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { formatRelative } from '@/lib/utils'
import { UserPlus, CreditCard, ClipboardCheck, FileText, MessageSquare } from 'lucide-react'

export type ActivityType = 'enrollment' | 'payment' | 'attendance' | 'test' | 'message'

export interface ActivityItem {
  id: string
  type: ActivityType
  label: string
  sub: string
  at: string
}

const ICON_MAP: Record<ActivityType, React.ReactNode> = {
  enrollment: <UserPlus size={14} />,
  payment: <CreditCard size={14} />,
  attendance: <ClipboardCheck size={14} />,
  test: <FileText size={14} />,
  message: <MessageSquare size={14} />,
}

interface RecentActivityFeedProps {
  items: ActivityItem[]
  loading?: boolean
}

export function RecentActivityFeed({ items, loading }: RecentActivityFeedProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading
          ? Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-7 w-7 rounded-full shrink-0" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-3 w-48" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))
          : items.length === 0
          ? <p className="text-sm text-muted-foreground text-center py-4">No recent activity</p>
          : items.map((item) => (
              <div key={item.id} className="flex items-start gap-3">
                <div className="mt-0.5 w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  {ICON_MAP[item.type]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.sub} · {formatRelative(new Date(item.at))}</p>
                </div>
              </div>
            ))
        }
      </CardContent>
    </Card>
  )
}
