'use client'

import { useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Printer } from 'lucide-react'

interface PrintWrapperProps {
  children: React.ReactNode
  className?: string
}

export function PrintWrapper({ children, className }: PrintWrapperProps) {
  const printRef = useRef<HTMLDivElement>(null)

  const handlePrint = () => {
    const content = printRef.current?.innerHTML
    if (!content) return
    const win = window.open('', '_blank')
    if (!win) return
    win.document.write(`
      <html><head><title>Print</title>
      <style>body{font-family:sans-serif;padding:24px;}</style>
      </head><body>${content}</body></html>
    `)
    win.document.close()
    win.print()
    win.close()
  }

  return (
    <div className={className}>
      <div className="flex justify-end mb-4 print:hidden">
        <Button variant="outline" size="sm" onClick={handlePrint}>
          <Printer size={14} className="mr-2" /> Print
        </Button>
      </div>
      <div ref={printRef}>{children}</div>
    </div>
  )
}
