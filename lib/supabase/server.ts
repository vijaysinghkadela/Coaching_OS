import { createDemoClient } from '@/lib/demo/client'

export async function createClient() {
  // Showcase mode always uses the local demo client.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return createDemoClient() as any
}
