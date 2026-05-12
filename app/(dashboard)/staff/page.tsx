import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { PageHeader } from '@/components/shared/PageHeader'
import { TierGate } from '@/components/layout/TierGate'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { UserPlus, Phone, IndianRupee } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

export default async function StaffPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: institute } = await supabase
    .from('institutes')
    .select('id, plan_tier')
    .eq('owner_id', user.id)
    .single()
  if (!institute) redirect('/signup')

  const { data: staff } = await supabase
    .from('staff')
    .select('id, full_name, role, phone, email, salary_type, base_salary, status')
    .eq('institute_id', institute.id)
    .order('full_name')

  const activeCount = staff?.filter((s) => s.status === 'active').length ?? 0

  return (
    <div className="space-y-6">
      <PageHeader
        title="Staff"
        description={`${activeCount} active staff member${activeCount !== 1 ? 's' : ''}`}
        action={
          <Link href="/staff/new">
            <Button><UserPlus size={15} className="mr-2" />Add Staff</Button>
          </Link>
        }
      />
      <TierGate feature="Staff Management" requiredTier="pro" currentTier={institute.plan_tier as 'starter' | 'growth' | 'pro'}>
        <StaffList staff={staff ?? []} />
      </TierGate>
    </div>
  )
}

interface StaffMember {
  id: string
  full_name: string
  role: string
  phone: string | null
  email: string | null
  salary_type: string | null
  base_salary: number | null
  status: string
}

function StaffList({ staff }: { staff: StaffMember[] }) {
  if (staff.length === 0) {
    return (
      <Card>
        <CardContent className="py-16 text-center">
          <p className="text-muted-foreground">No staff added yet. Add your first team member.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {staff.map((s) => (
        <Card key={s.id}>
          <CardContent className="py-3 px-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 font-semibold text-primary text-sm">
              {s.full_name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <Link href={`/staff/${s.id}`} className="font-medium hover:underline">{s.full_name}</Link>
                <StatusBadge status={s.status} />
              </div>
              <p className="text-xs text-muted-foreground capitalize">{s.role?.replace(/_/g, ' ')}</p>
            </div>
            <div className="hidden sm:flex flex-col items-end gap-1 shrink-0 text-sm text-muted-foreground">
              {s.phone && <span className="flex items-center gap-1"><Phone size={12} />{s.phone}</span>}
              {s.base_salary && (
                <span className="flex items-center gap-1">
                  <IndianRupee size={12} />{formatCurrency(s.base_salary)}/mo
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
