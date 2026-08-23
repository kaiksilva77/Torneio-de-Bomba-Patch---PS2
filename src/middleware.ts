import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getCurrentUser } from '@/lib/auth'

export const runtime = 'nodejs'

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value

  if (!token) {
    if (request.nextUrl.pathname.startsWith('/dashboard') ||
        request.nextUrl.pathname.startsWith('/admin') ||
        request.nextUrl.pathname.startsWith('/lider') ||
        request.nextUrl.pathname.startsWith('/api') && !['/api/auth/register', '/api/auth/login'].includes(request.nextUrl.pathname)) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    return NextResponse.next()
  }

  const user = await getCurrentUser()

  if (!user) {
    const response = NextResponse.redirect(new URL('/login', request.url))
    response.cookies.delete('auth-token')
    return response
  }

  if (request.nextUrl.pathname.startsWith('/complete-signup') && user.name && user.phone && user.teamId) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  if (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/complete-signup') {
    if (user.role === 'ADMIN') {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
    if (user.role === 'LIDER' || user.role === 'PASTOR_EQUIPE') {
      return NextResponse.redirect(new URL('/lider', request.url))
    }
    if (user.role === 'PASTOR_UNIAO') {
      return NextResponse.redirect(new URL('/lider', request.url))
    }
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  if (request.nextUrl.pathname.startsWith('/admin') && user.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  if ((request.nextUrl.pathname.startsWith('/lider')) && 
      !['LIDER', 'PASTOR_EQUIPE', 'PASTOR_UNIAO', 'ADMIN'].includes(user.role)) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
