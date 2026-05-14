'use client'

import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Building, Shield } from 'lucide-react'
import Link from 'next/link'

const SETTINGS_SECTIONS = [
  { href: '/settings/courses', label: 'Courses', desc: 'Manage courses and subjects', icon: Building },
  { href: '/settings/rooms', label: 'Rooms', desc: 'Manage classrooms and capacity', icon: Building },
  { href: '/settings/billing', label: 'Billing', desc: 'Subscription and billing info', icon: Shield },
]

export default function SettingsPage() {
  return (
    <div className="space-y-6 p-6">
      <PageHeader title="Settings" description="Institute configuration" />
      <Card>
        <CardHeader><CardTitle className="text-sm">Institute Profile</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Institute Name</Label><Input defaultValue="Sharma Classes" /></div>
            <div><Label>City</Label><Input defaultValue="Bikaner" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Phone</Label><Input defaultValue="+91 9876543210" /></div>
            <div><Label>Email</Label><Input defaultValue="info@sharmaclasses.in" /></div>
          </div>
          <Button variant="outline">Save Changes</Button>
        </CardContent>
      </Card>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {SETTINGS_SECTIONS.map(s => {
          const Icon = s.icon
          return (
            <Link key={s.href} href={s.href}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="p-4">
                  <Icon size={20} className="text-primary mb-2" />
                  <p className="font-medium">{s.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{s.desc}</p>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
