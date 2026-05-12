'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { createBrowserClient } from '@supabase/ssr'

export default function SettingsPage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ name: '', city: '', gstin: '', phone: '', website: '' })

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('institutes').select('*').eq('owner_id', user.id).single()
      if (data) setForm({ name: data.name ?? '', city: data.city ?? '', gstin: data.gstin ?? '', phone: data.phone ?? '', website: data.website ?? '' })
    }
    load()
  }, [])

  const handleSave = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { error } = await supabase.from('institutes').update(form).eq('owner_id', user.id)
    setLoading(false)
    if (error) toast.error(error.message)
    else toast.success('Settings saved!')
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Institute profile and configuration" />

      <Card className="max-w-lg">
        <CardHeader><CardTitle className="text-base">Institute Profile</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Institute Name</Label>
            <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>City</Label>
              <Input value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Phone</Label>
              <Input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>GSTIN (optional)</Label>
            <Input value={form.gstin} onChange={(e) => setForm((f) => ({ ...f, gstin: e.target.value }))} placeholder="27AABCU9603R1ZX" />
          </div>
          <div className="space-y-1.5">
            <Label>Website (optional)</Label>
            <Input value={form.website} onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))} placeholder="https://mycoaching.in" />
          </div>
          <Button onClick={handleSave} disabled={loading} className="w-full">
            {loading ? 'Saving…' : 'Save Changes'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
