import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PageHeader } from '@/components/shared/PageHeader'
import { QRGenerator } from '@/components/attendance/QRGenerator'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { format } from 'date-fns'

export default async function QRAttendancePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: institute } = await supabase.from('institutes').select('id').eq('owner_id', user.id).single()
  if (!institute) redirect('/signup')

  const { data: batches } = await supabase
    .from('batches').select('id, name').eq('institute_id', institute.id).eq('status', 'active').order('name')

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const today = format(new Date(), 'yyyy-MM-dd')

  return (
    <div className="space-y-6">
      <PageHeader title="QR Attendance" description="Generate a QR code for students to self-mark" />

      <Card className="max-w-md mx-auto">
        <CardContent className="pt-5">
          <div className="space-y-1.5 mb-6">
            <Label>Batch</Label>
            <Select defaultValue={batches?.[0]?.id}>
              <SelectTrigger>
                <SelectValue placeholder="Select batch" />
              </SelectTrigger>
              <SelectContent>
                {(batches ?? []).map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          {batches && batches[0] ? (
            <QRGenerator batchId={batches[0].id} sessionDate={today} appUrl={appUrl} />
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">No active batches found.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
