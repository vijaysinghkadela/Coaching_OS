import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Coaching OS — Institute Management Platform',
  description: 'The complete operating system for coaching institutes in Rajasthan',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className="h-full"
      suppressHydrationWarning
    >
      <body className="h-full antialiased font-sans">{children}</body>
    </html>
  )
}
