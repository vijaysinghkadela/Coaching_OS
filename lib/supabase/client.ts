'use client'

import { createDemoClient } from '@/lib/demo/client'

export function createClient() {
  return createDemoClient() as any
}
