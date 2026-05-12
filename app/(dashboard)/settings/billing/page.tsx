import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TIER_LIMITS } from '@/lib/constants'
import { formatCurrency } from '@/lib/utils'
import { Check } from 'lucide-react'

const PLANS = [
  {
    tier: 'starter' as const,
    features: ['Up to 100 students', '5 batches', 'Attendance tracking', 'Fee management', 'Basic reports'],
  },
  {
    tier: 'growth' as const,
    features: ['Up to 300 students', 'Unlimited batches', 'WhatsApp alerts', 'Test score tracking', 'QR attendance'],
  },
  {
    tier: 'pro' as const,
    features: ['Unlimited students', 'Staff management', 'AI parent reports', 'At-risk predictions', 'Study plans', 'Razorpay integration'],
  },
]

export default async function BillingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: institute } = await supabase
    .from('institutes')
    .select('id, plan_tier')
    .eq('owner_id', user.id)
    .single()
  if (!institute) redirect('/signup')

  const { data: subscription } = await supabase
    .from('saas_subscriptions')
    .select('status, current_period_end, razorpay_subscription_id')
    .eq('institute_id', institute.id)
    .single()

  const currentTier = institute.plan_tier as keyof typeof TIER_LIMITS

  return (
    <div className="space-y-6">
      <PageHeader title="Billing & Plan" description="Manage your Coaching OS subscription" />

      {subscription && (
        <div className="rounded-lg border border-border p-4 flex justify-between items-center max-w-2xl">
          <div>
            <p className="text-sm font-medium">Current Plan: <span className="capitalize text-primary">{currentTier}</span></p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Status: <Badge variant={subscription.status === 'active' ? 'default' : 'secondary'} className="text-xs ml-1">{subscription.status}</Badge>
            </p>
            {subscription.current_period_end && (
              <p className="text-xs text-muted-foreground">Renews: {new Date(subscription.current_period_end).toLocaleDateString('en-IN')}</p>
            )}
          </div>
          <a href="https://dashboard.razorpay.com" target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm">Manage Subscription</Button>
          </a>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 max-w-4xl">
        {PLANS.map((plan) => {
          const tierConfig = TIER_LIMITS[plan.tier]
          const isCurrent = plan.tier === currentTier
          return (
            <Card key={plan.tier} className={isCurrent ? 'border-primary ring-1 ring-primary' : ''}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="capitalize text-lg">{plan.tier}</CardTitle>
                  {isCurrent && <Badge className="text-xs">Current</Badge>}
                </div>
                <p className="text-2xl font-bold text-foreground">
                  {formatCurrency(tierConfig.price)}<span className="text-sm font-normal text-muted-foreground">/mo</span>
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                <ul className="space-y-1.5">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check size={13} className="text-green-500 shrink-0" />{f}
                    </li>
                  ))}
                </ul>
                {!isCurrent && (
                  <Button className="w-full mt-3" variant={plan.tier === 'pro' ? 'default' : 'outline'}>
                    Upgrade to {plan.tier}
                  </Button>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
