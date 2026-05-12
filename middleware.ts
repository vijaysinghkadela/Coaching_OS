import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const PUBLIC_PATHS = ['/login', '/signup', '/auth/callback']
const PRO_PATHS = ['/staff', '/ai']

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Demo mode — bypass all auth, redirect root/auth pages straight to dashboard
  if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
    const isAuthPage = PUBLIC_PATHS.some(p => pathname.startsWith(p))
    const isRoot = pathname === '/'
    if (isRoot || isAuthPage) {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }
    return NextResponse.next({ request })
  }

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const isPublic = PUBLIC_PATHS.some(p => pathname.startsWith(p))
  const isRoot = pathname === '/'

  // Redirect unauthenticated users to login
  if (!user && !isPublic) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Redirect authenticated users away from auth pages
  if (user && isPublic) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  // Redirect root to dashboard
  if (isRoot) {
    const url = request.nextUrl.clone()
    url.pathname = user ? '/dashboard' : '/login'
    return NextResponse.redirect(url)
  }

  // Tier enforcement for Pro-only paths
  if (user && PRO_PATHS.some(p => pathname.includes(p))) {
    const { data: institute } = await supabase
      .from('institutes')
      .select('plan_tier')
      .eq('owner_id', user.id)
      .single()

    if (institute && institute.plan_tier !== 'pro') {
      const url = request.nextUrl.clone()
      url.pathname = '/settings/billing'
      url.searchParams.set('upgrade', 'pro')
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
