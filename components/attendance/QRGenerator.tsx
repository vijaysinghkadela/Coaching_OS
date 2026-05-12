'use client'

import { useState, useEffect } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Button } from '@/components/ui/button'
import { generateQRSession } from '@/lib/actions/attendance'
import { toast } from 'sonner'
import { RefreshCw, QrCode } from 'lucide-react'

interface QRGeneratorProps {
  batchId: string
  sessionDate: string
  appUrl: string
}

export function QRGenerator({ batchId, sessionDate, appUrl }: QRGeneratorProps) {
  const [qrData, setQrData] = useState<{ token: string; expiresAt: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState(0)

  const generate = async () => {
    setLoading(true)
    const res = await generateQRSession(batchId, sessionDate)
    setLoading(false)
    if (res.error) { toast.error(res.error); return }
    setQrData({ token: res.qrToken!, expiresAt: res.expiresAt! })
    const msLeft = new Date(res.expiresAt!).getTime() - Date.now()
    setSecondsLeft(Math.max(0, Math.floor(msLeft / 1000)))
  }

  useEffect(() => {
    if (secondsLeft <= 0) return
    const timer = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) { clearInterval(timer); setQrData(null); return 0 }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [secondsLeft])

  const qrUrl = qrData ? `${appUrl}/api/attendance/qr-verify?token=${qrData.token}` : ''
  const minutes = Math.floor(secondsLeft / 60)
  const seconds = String(secondsLeft % 60).padStart(2, '0')

  return (
    <div className="flex flex-col items-center gap-6 py-4">
      {qrData ? (
        <>
          <div className="p-4 bg-white rounded-2xl shadow-lg">
            <QRCodeSVG value={qrUrl} size={220} level="M" />
          </div>
          <div className="text-center">
            <p className="text-2xl font-mono font-bold text-foreground">
              {minutes}:{seconds}
            </p>
            <p className="text-sm text-muted-foreground">remaining</p>
          </div>
          <Button variant="outline" onClick={generate} disabled={loading}>
            <RefreshCw size={14} className="mr-2" />Regenerate
          </Button>
        </>
      ) : (
        <>
          <div className="w-[220px] h-[220px] rounded-2xl bg-muted flex items-center justify-center">
            <QrCode size={64} className="text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground text-center max-w-xs">
            Generate a QR code. Students scan it to mark attendance. Valid for 30 minutes.
          </p>
          <Button onClick={generate} disabled={loading}>
            {loading ? 'Generating…' : 'Generate QR Code'}
          </Button>
        </>
      )}
    </div>
  )
}
