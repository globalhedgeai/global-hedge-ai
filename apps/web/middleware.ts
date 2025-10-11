import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Redirect /admin to /en/admin
  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    return NextResponse.redirect(
      new URL(`/en${pathname}`, request.url)
    );
  }

  // For all other routes, redirect to English locale if no locale is present
  const pathnameIsMissingLocale = ['ar', 'en', 'tr', 'fr', 'es'].every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  );

  if (pathnameIsMissingLocale && pathname !== '/') {
    return NextResponse.redirect(
      new URL(`/en${pathname}`, request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next|icons|uploads|favicon.ico|sw.js|manifest.json|.*\\..*).*)',
  ],
};
