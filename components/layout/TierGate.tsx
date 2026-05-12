import Link from 'next/link'
import { Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface TierGateProps {
  feature: string
  children: React.ReactNode
  requiredTier?: 'growth' | 'pro'
  currentTier: string
}

const TIER_ORDER = { starter: 0, growth: 1, pro: 2 }

export function TierGate({ feature, children, requiredTier = 'pro', currentTier }: TierGateProps) {
  const current = TIER_ORDER[currentTier as keyof typeof TIER_ORDER] ?? 0
  const required = TIER_ORDER[requiredTier]

  if (current >= required) return <>{children}</>

  return (
    <div className="relative">
      <div className="opacity-30 pointer-events-none select-none blur-sm">{children}</div>
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/60 backdrop-blur-sm rounded-lg">
        <div className="text-center p-6">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
            <Lock size={20} className="text-primary" />
          </div>
          <h3 className="font-semibold text-foreground mb-1">{feature}</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Upgrade to {requiredTier.charAt(0).toUpperCase() + requiredTier.slice(1)} plan to access this feature.
          </p>
          <Button size="sm" render={<Link href="/settings/billing?upgrade=pro" />}>
            Upgrade Now
          </Button>
        </div>
      </div>
    </div>
  )
}
