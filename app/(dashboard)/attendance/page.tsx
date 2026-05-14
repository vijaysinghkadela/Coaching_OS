'use client'

import Link from 'next/link'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ClipboardCheck, QrCode } from 'lucide-react'

export default function AttendancePage() {
  return (
    <div className="space-y-6 p-6">
      <PageHeader title="Attendance" description="Mark and track student attendance" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 max-w-2xl">
        <Link href="/attendance/mark">
          <Card className="hover:bg-accent/30 transition-all duration-150 cursor-pointer group h-full">
            <CardHeader className="pb-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-150 dark:bg-emerald-900/30">
                <ClipboardCheck size={20} className="text-emerald-600 dark:text-emerald-400" />
              </div>
              <CardTitle className="text-base">Manual Attendance</CardTitle>
            </CardHeader>
            <CardContent><p className="text-sm text-muted-foreground">Select batch and date, then mark attendance for students.</p></CardContent>
          </Card>
        </Link>
        <Link href="/attendance/qr">
          <Card className="hover:bg-accent/30 transition-all duration-150 cursor-pointer group h-full">
            <CardHeader className="pb-2">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-150 dark:bg-blue-900/30">
                <QrCode size={20} className="text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle className="text-base">QR Attendance</CardTitle>
            </CardHeader>
            <CardContent><p className="text-sm text-muted-foreground">Generate a QR code. Students scan to self-mark attendance.</p></CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
