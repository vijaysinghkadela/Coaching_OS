import { createDemoClient } from '@/lib/demo/client'

export async function createClient() {
  return createDemoClient() as any
}
