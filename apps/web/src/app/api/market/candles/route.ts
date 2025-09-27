import { NextRequest, NextResponse } from 'next/server';

export type Interval = '1m' | '5m' | '1h' | '1d';
export type Symbol = 'BTCUSDT' | 'ETHUSDT';

export interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// Simple in-memory rate limiting
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const RATE_LIMIT_MAX = 100; // 100 requests per minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const key = ip;
  const current = rateLimitMap.get(key);

  if (!current || now > current.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (current.count >= RATE_LIMIT_MAX) {
    return false;
  }

  current.count++;
  return true;
}

function generateMockCandles(symbol: Symbol, interval: Interval, limit: number): Candle[] {
  const candles: Candle[] = [];
  const now = Date.now();
  
  // Base prices for symbols
  const basePrice = symbol === 'BTCUSDT' ? 45000 : 3000;
  
  // Interval in milliseconds
  const intervalMs = {
    '1m': 60 * 1000,
    '5m': 5 * 60 * 1000,
    '1h': 60 * 60 * 1000,
    '1d': 24 * 60 * 60 * 1000,
  }[interval];

  let currentPrice = basePrice;
  
  for (let i = 0; i < limit; i++) {
    const time = now - (limit - i - 1) * intervalMs;
    
    // Generate realistic price movement
    const change = (Math.random() - 0.5) * 0.02; // ±1% change
    const open = currentPrice;
    const close = open * (1 + change);
    
    // High and low with some volatility
    const volatility = Math.random() * 0.01; // 0-0.5% volatility
    const high = Math.max(open, close) * (1 + volatility);
    const low = Math.min(open, close) * (1 - volatility);
    
    // Volume (random but realistic)
    const volume = Math.random() * 1000 + 100;
    
    candles.push({
      time: Math.floor(time / 1000), // Convert to seconds
      open: Number(open.toFixed(2)),
      high: Number(high.toFixed(2)),
      low: Number(low.toFixed(2)),
      close: Number(close.toFixed(2)),
      volume: Number(volume.toFixed(2)),
    });
    
    currentPrice = close;
  }
  
  return candles;
}

export async function GET(req: NextRequest) {
  try {
    // Rate limiting
    const ip =
      req.headers.get('x-forwarded-for') ??
      req.headers.get('x-real-ip') ??
      'unknown';
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { ok: false, error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    const { searchParams } = new URL(req.url);
    const symbol = searchParams.get('symbol') as Symbol;
    const interval = searchParams.get('interval') as Interval;
    const limitParam = searchParams.get('limit');

    // Validation
    if (!symbol || !['BTCUSDT', 'ETHUSDT'].includes(symbol)) {
      return NextResponse.json(
        { ok: false, error: 'Invalid symbol. Must be BTCUSDT or ETHUSDT' },
        { status: 400 }
      );
    }

    if (!interval || !['1m', '5m', '1h', '1d'].includes(interval)) {
      return NextResponse.json(
        { ok: false, error: 'Invalid interval. Must be 1m, 5m, 1h, or 1d' },
        { status: 400 }
      );
    }

    const limit = limitParam ? parseInt(limitParam, 10) : 200;
    if (isNaN(limit) || limit < 1 || limit > 500) {
      return NextResponse.json(
        { ok: false, error: 'Invalid limit. Must be between 1 and 500' },
        { status: 400 }
      );
    }

    const candles = generateMockCandles(symbol, interval, limit);

    return NextResponse.json({
      ok: true,
      symbol,
      interval,
      candles,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { ok: false, error: message },
      { status: 500 }
    );
  }
}
