const IS_DEMO = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'

export async function createClient() {
  if (IS_DEMO) {
    const { createDemoClient } = await import('@/lib/demo/client')
    return createDemoClient() as any
  }
  const { cookies } = await import('next/headers')
  const { createServerClient } = await import('@supabase/ssr')
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async getAll() {
          const cookieStore = await cookies()
          return cookieStore.getAll()
        },
        async setAll(cookiesToSet) {
          const cookieStore = await cookies()
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    },
  )
}
