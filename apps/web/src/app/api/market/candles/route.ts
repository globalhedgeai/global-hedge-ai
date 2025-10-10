import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const Params = z.object({
  symbol: z.string().default("BTCUSDT"),
  interval: z.enum(["1m","5m","15m","1h","4h","1d"]).default("1h"),
  limit: z.coerce.number().min(1).max(500).default(200),
});

const INTERVAL_SEC: Record<string, number> = {
  "1m": 60, "5m": 300, "15m": 900, "1h": 3600, "4h": 14400, "1d": 86400,
};

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const parsed = Params.safeParse({
    symbol: url.searchParams.get("symbol") || undefined,
    interval: url.searchParams.get("interval") || undefined,
    limit: url.searchParams.get("limit") || undefined,
  });
  
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "bad_params" }, { status: 400 });
  }
  
  const { symbol, interval, limit } = parsed.data;

  try {
    // Use Binance API for real market data
    const binanceUrl = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`;
    
    console.log('🔄 Fetching real market data from Binance:', binanceUrl);
    
    const response = await fetch(binanceUrl, {
      headers: {
        'Accept': 'application/json',
      },
      // Add timeout
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    if (!response.ok) {
      throw new Error(`Binance API error: ${response.status} ${response.statusText}`);
    }

    const binanceData = await response.json();
    
    // Convert Binance format to our format
    const candles = binanceData.map((kline: string[]) => ({
      time: kline[0], // Open time (milliseconds)
      open: parseFloat(kline[1]), // Open price
      high: parseFloat(kline[2]), // High price
      low: parseFloat(kline[3]), // Low price
      close: parseFloat(kline[4]), // Close price
      volume: parseFloat(kline[5]), // Volume
    }));

    console.log(`✅ Fetched ${candles.length} real candles for ${symbol} from Binance`);

    return NextResponse.json({
      ok: true,
      symbol,
      interval,
      candles,
      source: 'binance',
      timestamp: new Date().toISOString(),
      currentPrice: candles[candles.length - 1]?.close || 0
    });

  } catch (error) {
    console.error('❌ Error fetching real market data:', error);
    
    // Fallback to mock data if Binance API fails
    console.log('🔄 Using fallback mock data...');
    const mockCandles = generateMockCandles(symbol, interval, limit);
    
    return NextResponse.json({
      ok: true,
      symbol,
      interval,
      candles: mockCandles,
      source: 'mock',
      error: 'Using fallback data due to API error',
      timestamp: new Date().toISOString(),
      currentPrice: mockCandles[mockCandles.length - 1]?.close || 0
    });
  }
}

function generateMockCandles(symbol: string, interval: string, limit: number) {
  const step = INTERVAL_SEC[interval] ?? 3600;
  const now = Math.floor(Date.now() / 1000);
  
  // Get current real BTC price from CoinGecko as fallback
  const basePrice = 45000; // Fallback base price
  
  const candles = Array.from({ length: limit }).map((_, i) => {
    const t = now - (limit - i) * step;
    const base = basePrice + Math.sin(i/5) * 400 + Math.cos(i/7) * 250;
    const open  = +(base + (Math.random()-0.5)*80).toFixed(2);
    const close = +(base + (Math.random()-0.5)*80).toFixed(2);
    const high  = Math.max(open, close) + +(Math.random()*120).toFixed(2);
    const low   = Math.min(open, close) - +(Math.random()*120).toFixed(2);
    const volume = +(500 + Math.random()*1000).toFixed(2);
    return { time: t * 1000, open, high, low, close, volume }; // Convert to milliseconds
  });

  return candles;
}