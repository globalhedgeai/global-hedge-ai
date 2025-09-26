import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const publicPaths = [
  '/api/health',
  '/api/proofs',
  '/login',
  '/register',
  '/reset',
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/logout',
  '/api/auth/request-reset',
  '/api/auth/reset',
];

export function middleware(req: NextRequest) {
  const p = req.nextUrl.pathname;

  // Dev bypass (off by default; only if AUTH_DEV_OPEN=1)
  if (process.env.AUTH_DEV_OPEN === '1') return NextResponse.next();

  const isPublic = publicPaths.some((x) => p.startsWith(x)) || p.startsWith('/_next') || p === '/' || p.startsWith('/favicon');
  if (isPublic) return NextResponse.next();

  // Require session cookie presence; frontend/API will check server-side anyway
  const hasSession = req.cookies.get('session');
  if (!hasSession && (p.startsWith('/api/'))) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }
  return NextResponse.next();
}