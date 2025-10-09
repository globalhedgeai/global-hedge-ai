import { NextRequest, NextResponse } from 'next/server';
import { csrfProtection } from '@/lib/csrf';

export async function securityMiddleware(req: NextRequest): Promise<NextResponse | null> {
  // CSRF Protection
  const csrfResponse = await csrfProtection.protect(req);
  if (csrfResponse) {
    return csrfResponse;
  }

  // Rate Limiting (basic implementation)
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
  const userAgent = req.headers.get('user-agent') || '';
  
  // Block suspicious user agents
  const suspiciousPatterns = [
    /bot/i,
    /crawler/i,
    /spider/i,
    /scraper/i,
  ];
  
  if (suspiciousPatterns.some(pattern => pattern.test(userAgent))) {
    return NextResponse.json(
      { ok: false, error: 'Access denied' },
      { status: 403 }
    );
  }

  // Security Headers
  const response = NextResponse.next();
  
  // Add security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  // CORS headers
  response.headers.set('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || 'http://localhost:3000');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-CSRF-Token');
  response.headers.set('Access-Control-Allow-Credentials', 'true');

  return response;
}

export async function handleOptions(req: NextRequest): Promise<NextResponse> {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': process.env.CORS_ORIGIN || 'http://localhost:3000',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-CSRF-Token',
      'Access-Control-Allow-Credentials': 'true',
    },
  });
}
