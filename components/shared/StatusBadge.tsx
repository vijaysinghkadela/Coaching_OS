import { cn } from '@/lib/utils'

const STATUS_STYLES: Record<string, string> = {
  // Attendance
  present:  'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  absent:   'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  late:     'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  excused:  'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  // Fees
  pending:  'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  partial:  'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  paid:     'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  overdue:  'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  waived:   'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  // General
  active:   'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  inactive: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  // Subscription
  trialing: 'bg-blue-100 text-blue-800',
  past_due: 'bg-red-100 text-red-800',
  cancelled:'bg-gray-100 text-gray-600',
  // Leave
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  // WhatsApp
  sent:     'bg-blue-100 text-blue-800',
  delivered:'bg-green-100 text-green-800',
  queued:   'bg-gray-100 text-gray-600',
  failed:   'bg-red-100 text-red-800',
  read:     'bg-green-100 text-green-800',
}

interface StatusBadgeProps {
  status: string
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize',
        STATUS_STYLES[status] ?? 'bg-gray-100 text-gray-600',
        className
      )}
    >
      {status.replace(/_/g, ' ')}
    </span>
  )
}
