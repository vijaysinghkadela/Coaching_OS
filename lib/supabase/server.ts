import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createDemoClient } from '@/lib/demo/client'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

// Use demo client when:
// - Demo mode is explicitly enabled, OR
// - Supabase credentials are missing or are placeholder values
function shouldUseDemoClient() {
  if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') return true
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return true
  if (SUPABASE_URL.includes('placeholder') || SUPABASE_URL.includes('demo')) return true
  if (SUPABASE_ANON_KEY.includes('placeholder') || SUPABASE_ANON_KEY.includes('demo')) return true
  return false
}

export async function createClient() {
  if (shouldUseDemoClient()) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return createDemoClient() as any
  }

  const cookieStore = await cookies()
  return createServerClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server Component — cookies can't be set, middleware handles this
          }
        },
      },
    }
  )
}
