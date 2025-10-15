import { NextRequest } from 'next/server';

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private store: Map<string, RateLimitEntry> = new Map();
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
  }

  private getKey(req: NextRequest): string {
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const userAgent = req.headers.get('user-agent') || '';
    return `${ip}-${userAgent}`;
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (entry.resetTime < now) {
        this.store.delete(key);
      }
    }
  }

  isAllowed(req: NextRequest): { allowed: boolean; remaining: number; resetTime: number } {
    this.cleanup();
    
    const key = this.getKey(req);
    const now = Date.now();
    
    let entry = this.store.get(key);
    
    if (!entry || entry.resetTime < now) {
      entry = {
        count: 0,
        resetTime: now + this.config.windowMs,
      };
    }
    
    if (entry.count >= this.config.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime,
      };
    }
    
    entry.count++;
    this.store.set(key, entry);
    
    return {
      allowed: true,
      remaining: this.config.maxRequests - entry.count,
      resetTime: entry.resetTime,
    };
  }
}

// Different rate limits for different endpoints
export const rateLimiters = {
  general: new RateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100,
  }),
  
  auth: new RateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,
  }),
  
  api: new RateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 50,
  }),
  
  upload: new RateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 10,
  }),
};

export function getRateLimiter(path: string): RateLimiter {
  if (path.startsWith('/api/auth/')) {
    return rateLimiters.auth;
  }
  
  if (path.startsWith('/api/upload')) {
    return rateLimiters.upload;
  }
  
  if (path.startsWith('/api/')) {
    return rateLimiters.api;
  }
  
  return rateLimiters.general;
}
