import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';

export interface CSRFConfig {
  secret: string;
  tokenLength: number;
  cookieName: string;
  headerName: string;
  maxAge: number;
}

const defaultConfig: CSRFConfig = {
  secret: process.env.CSRF_SECRET || 'csrf-secret-key-change-in-production',
  tokenLength: 32,
  cookieName: 'csrf-token',
  headerName: 'x-csrf-token',
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
};

export class CSRFProtection {
  private config: CSRFConfig;

  constructor(config: Partial<CSRFConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
  }

  /**
   * Generate a new CSRF token
   */
  generateToken(): string {
    return randomBytes(this.config.tokenLength).toString('hex');
  }

  /**
   * Verify CSRF token
   */
  verifyToken(token: string, cookieToken: string): boolean {
    if (!token || !cookieToken) {
      return false;
    }

    // Simple comparison for now - in production, use HMAC
    return token === cookieToken;
  }

  /**
   * Middleware to add CSRF protection to API routes
   */
  async protect(req: NextRequest): Promise<NextResponse | null> {
    // Skip CSRF for GET requests
    if (req.method === 'GET') {
      return null;
    }

    // Skip CSRF for certain paths
    const skipPaths = ['/api/auth/login', '/api/auth/register', '/api/market/candles', '/api/health', '/api/policies'];
    if (skipPaths.some(path => req.nextUrl.pathname.startsWith(path))) {
      return null;
    }

    const token = req.headers.get(this.config.headerName);
    const cookieToken = req.cookies.get(this.config.cookieName)?.value;

    if (!this.verifyToken(token || '', cookieToken || '')) {
      return NextResponse.json(
        { ok: false, error: 'CSRF token mismatch' },
        { status: 403 }
      );
    }

    return null;
  }

  /**
   * Set CSRF token in response
   */
  setToken(response: NextResponse, token: string): void {
    response.cookies.set(this.config.cookieName, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: this.config.maxAge,
    });
  }

  /**
   * Get CSRF token for client-side use
   */
  async getToken(req: NextRequest): Promise<string> {
    const existingToken = req.cookies.get(this.config.cookieName)?.value;
    
    if (existingToken) {
      return existingToken;
    }

    const newToken = this.generateToken();
    return newToken;
  }
}

export const csrfProtection = new CSRFProtection();
