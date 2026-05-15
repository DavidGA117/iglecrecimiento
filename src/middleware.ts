import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const sessionToken = request.cookies.get('next-auth.session-token')?.value 
    || request.cookies.get('__Secure-next-auth.session-token')?.value

  const isLoginPage = request.nextUrl.pathname === '/login'
  const isAdminRoute = 
    request.nextUrl.pathname.startsWith('/admin/dashboard') ||
    request.nextUrl.pathname.startsWith('/admin/personas') ||
    request.nextUrl.pathname.startsWith('/admin/abonos') ||
    request.nextUrl.pathname.startsWith('/admin')

  if (isAdminRoute && !sessionToken && !isLoginPage) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  if (isLoginPage && sessionToken) {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/dashboard/:path*',
    '/admin/personas/:path*',
    '/admin/abonos/:path*',
    '/admin/:path*',
    '/login'
  ]
}