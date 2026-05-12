'use client'

import { createBrowserClient } from '@supabase/ssr'
import { createDemoClient } from '@/lib/demo/client'

export function createClient() {
  if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return createDemoClient() as any
  }

  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
