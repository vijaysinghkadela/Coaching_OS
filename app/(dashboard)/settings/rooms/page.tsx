'use client'

import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent } from '@/components/ui/card'

export default function DemoPage() {
  return (
    <div className="space-y-6 p-6">
      <PageHeader title="settings > rooms" description="Demo preview — Data loaded on demand" />
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          <p>This page is in demo mode.</p>
          <p className="text-sm mt-2">Full functionality will be available with Supabase connection.</p>
        </CardContent>
      </Card>
    </div>
  )
}
