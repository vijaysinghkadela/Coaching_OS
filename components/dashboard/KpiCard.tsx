import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { TrendingUp, TrendingDown, type LucideIcon } from 'lucide-react'

interface KpiCardProps {
  title: string
  value: string | number
  delta?: number
  deltaLabel?: string
  icon: LucideIcon
  loading?: boolean
  className?: string
}

export function KpiCard({ title, value, delta, deltaLabel, icon: Icon, loading, className }: KpiCardProps) {
  if (loading) return (
    <Card className={className}>
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-8 rounded" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-32 mb-2" />
        <Skeleton className="h-3 w-20" />
      </CardContent>
    </Card>
  )

  const positive = (delta ?? 0) >= 0

  return (
    <Card className={cn('hover:shadow-md transition-shadow', className)}>
      <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon size={16} className="text-primary" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">{value}</div>
        {delta !== undefined && (
          <div className={cn('flex items-center gap-1 mt-1 text-xs', positive ? 'text-green-600' : 'text-red-600')}>
            {positive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            <span>{positive ? '+' : ''}{delta}%</span>
            {deltaLabel && <span className="text-muted-foreground ml-1">{deltaLabel}</span>}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
