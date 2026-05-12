import { NextResponse, type NextRequest } from 'next/server'

const PUBLIC_PATHS = ['/login', '/signup', '/auth/callback']

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

  // If not in demo mode, we do not have Supabase configured, so we allow all requests to pass through.
  // In a real application, you would implement authentication here.
  return NextResponse.next({ request })
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
