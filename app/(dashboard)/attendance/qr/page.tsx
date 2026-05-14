'use client'

import { useState } from 'react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { DEMO_BATCHES } from '@/lib/demo/data'

export default function QRAttendancePage() {
  const [batchId, setBatchId] = useState(DEMO_BATCHES[0]?.id ?? '')
  const [qrVisible, setQrVisible] = useState(false)

  const batch = DEMO_BATCHES.find(b => b.id === batchId)

  return (
    <div className="space-y-6 p-6">
      <PageHeader title="QR Attendance" description="Generate QR code for students to scan" />
      <Card className="max-w-md">
        <CardHeader><CardTitle className="text-sm">Generate QR Code</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div><Label>Batch</Label><Select value={batchId} onValueChange={v => v && setBatchId(v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{DEMO_BATCHES.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent></Select></div>
          {!qrVisible ? (
            <Button onClick={() => setQrVisible(true)}>Generate QR Code</Button>
          ) : (
            <div className="text-center space-y-3">
              <div className="w-48 h-48 bg-muted mx-auto rounded-lg flex items-center justify-center border-2 border-dashed">
                <p className="text-xs text-muted-foreground">QR Code Placeholder</p>
              </div>
              <p className="text-xs text-muted-foreground">Batch: {batch?.name} · Expires in 30 min</p>
              <Button variant="outline" onClick={() => setQrVisible(false)}>Regenerate</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
