import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Allow API routes to pass through
  if (pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  // Allow static files to pass through
  if (pathname.startsWith('/_next') || 
      pathname.startsWith('/icons') ||
      pathname.startsWith('/uploads') ||
      pathname.includes('.')) {
    return NextResponse.next();
  }

  // Redirect /admin to /en/admin
  if (pathname.startsWith('/admin')) {
    return NextResponse.redirect(
      new URL(`/en${pathname}`, request.url)
    );
  }

  // For all other routes, redirect to English locale if no locale is present
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
    '/((?!api|_next/static|_next/image|favicon.ico|sw.js|manifest.json|icons).*)',
  ],
};
