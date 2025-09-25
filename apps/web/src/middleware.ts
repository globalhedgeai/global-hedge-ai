import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

const openInDev = ['/api/health', '/api/deposits', '/api/proofs']

export function middleware(req: NextRequest) {
  const p = req.nextUrl.pathname
  if (process.env.AUTH_DEV_OPEN === '1' && openInDev.some(x => p.startsWith(x))) {
    return NextResponse.next()
  }

  // Check for session cookie
  const session = req.cookies.get('session')
  if (!session && p.startsWith('/api/') && !openInDev.some(x => p.startsWith(x))) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
