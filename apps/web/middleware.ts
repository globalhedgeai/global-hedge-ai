import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Handle admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Allow admin routes to pass through
    return NextResponse.next();
  }

  // Handle API routes
  if (request.nextUrl.pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  // Handle static files
  if (request.nextUrl.pathname.startsWith('/_next') || 
      request.nextUrl.pathname.startsWith('/icons') ||
      request.nextUrl.pathname.startsWith('/uploads') ||
      request.nextUrl.pathname.includes('.')) {
    return NextResponse.next();
  }

  // Handle locale routes
  const pathname = request.nextUrl.pathname;
  const pathnameIsMissingLocale = ['ar', 'en', 'tr', 'fr', 'es'].every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  );

  if (pathnameIsMissingLocale) {
    return NextResponse.redirect(
      new URL(`/en${pathname.startsWith('/') ? '' : '/'}${pathname}`, request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|sw.js|manifest.json).*)',
  ],
};
