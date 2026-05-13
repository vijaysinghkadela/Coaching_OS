import { NextResponse, type NextRequest } from 'next/server'

const AUTH_PATHS = ['/login', '/signup', '/auth/callback', '/onboarding']

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Always redirect root and auth/onboarding pages straight to dashboard
  const isAuthPage = AUTH_PATHS.some(p => pathname.startsWith(p))
  const isRoot = pathname === '/'
  if (isRoot || isAuthPage) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return NextResponse.next({ request })
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
