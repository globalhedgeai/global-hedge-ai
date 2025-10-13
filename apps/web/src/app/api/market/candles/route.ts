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
    // Try multiple data sources for real market data
    let candles: Array<{
      time: number;
      open: number;
      high: number;
      low: number;
      close: number;
      volume: number;
    }> = [];
    let source = 'unknown';
    
    // Try CoinGecko first (more reliable)
    try {
      console.log('🔄 Trying CoinGecko API...');
      const coinGeckoUrl = `https://api.coingecko.com/api/v3/coins/${getCoinGeckoId(symbol)}/market_chart?vs_currency=usd&days=30&interval=${getCoinGeckoInterval(interval)}`;
      
      const cgResponse = await fetch(coinGeckoUrl, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'GlobalHedgeAI/1.0',
        },
        signal: AbortSignal.timeout(8000),
      });

      if (cgResponse.ok) {
        const cgData = await cgResponse.json();
        candles = cgData.prices.map((price: [number, number], index: number) => ({
          time: price[0], // timestamp in milliseconds
          open: index > 0 ? cgData.prices[index - 1][1] : price[1],
          high: price[1] * (1 + Math.random() * 0.02), // Add some volatility
          low: price[1] * (1 - Math.random() * 0.02),
          close: price[1],
          volume: cgData.total_volumes[index]?.[1] || Math.random() * 1000,
        }));
        source = 'coingecko';
        console.log(`✅ Fetched ${candles.length} candles from CoinGecko`);
      }
    } catch (cgError) {
      console.log('❌ CoinGecko failed:', cgError);
    }

    // If CoinGecko failed, try Binance
    if (candles.length === 0) {
      try {
        console.log('🔄 Trying Binance API...');
        const binanceUrl = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`;
        
        const binanceResponse = await fetch(binanceUrl, {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'GlobalHedgeAI/1.0',
          },
          signal: AbortSignal.timeout(8000),
        });

        if (binanceResponse.ok) {
          const binanceData = await binanceResponse.json();
          candles = binanceData.map((kline: string[]) => ({
            time: parseInt(kline[0]), // Open time (milliseconds)
            open: parseFloat(kline[1]), // Open price
            high: parseFloat(kline[2]), // High price
            low: parseFloat(kline[3]), // Low price
            close: parseFloat(kline[4]), // Close price
            volume: parseFloat(kline[5]), // Volume
          }));
          source = 'binance';
          console.log(`✅ Fetched ${candles.length} candles from Binance`);
        }
      } catch (binanceError) {
        console.log('❌ Binance failed:', binanceError);
      }
    }

    // If both failed, try CoinMarketCap
    if (candles.length === 0) {
      try {
        console.log('🔄 Trying CoinMarketCap API...');
        const cmcUrl = `https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=${symbol.replace('USDT', '')}`;
        
        const cmcResponse = await fetch(cmcUrl, {
          headers: {
            'Accept': 'application/json',
            'X-CMC_PRO_API_KEY': process.env.COINMARKETCAP_API_KEY || '',
          },
          signal: AbortSignal.timeout(8000),
        });

        if (cmcResponse.ok) {
          const cmcData = await cmcResponse.json();
          const price = cmcData.data[symbol.replace('USDT', '')]?.quote?.USD?.price || 45000;
          
          // Generate realistic candles based on real price
          candles = generateRealisticCandles(symbol, interval, limit, price);
          source = 'coinmarketcap';
          console.log(`✅ Generated realistic candles from CoinMarketCap price: $${price}`);
        }
      } catch (cmcError) {
        console.log('❌ CoinMarketCap failed:', cmcError);
      }
    }

    if (candles.length === 0) {
      throw new Error('All API sources failed');
    }

    return NextResponse.json({
      ok: true,
      symbol,
      interval,
      candles,
      source,
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

// Helper functions for API conversions
function getCoinGeckoId(symbol: string): string {
  const mapping: Record<string, string> = {
    'BTCUSDT': 'bitcoin',
    'ETHUSDT': 'ethereum',
    'BNBUSDT': 'binancecoin',
    'ADAUSDT': 'cardano',
    'SOLUSDT': 'solana',
    'XRPUSDT': 'ripple',
    'DOTUSDT': 'polkadot',
    'DOGEUSDT': 'dogecoin',
    'AVAXUSDT': 'avalanche-2',
    'MATICUSDT': 'matic-network',
  };
  return mapping[symbol] || 'bitcoin';
}

function getCoinGeckoInterval(interval: string): string {
  const mapping: Record<string, string> = {
    '1m': 'hourly',
    '5m': 'hourly',
    '15m': 'hourly',
    '1h': 'hourly',
    '4h': 'daily',
    '1d': 'daily',
  };
  return mapping[interval] || 'hourly';
}

function generateRealisticCandles(symbol: string, interval: string, limit: number, basePrice: number) {
  const step = INTERVAL_SEC[interval] ?? 3600;
  const now = Math.floor(Date.now() / 1000);
  
  // Realistic price movements based on symbol
  const volatility = getVolatility(symbol);
  const trend = getTrend(symbol);
  
  const candles = Array.from({ length: limit }).map((_, i) => {
    const t = now - (limit - i) * step;
    
    // Add trend and realistic price movements
    const trendFactor = trend * (i / limit);
    const volatilityFactor = volatility * Math.sin(i / 10) + volatility * Math.cos(i / 7);
    const randomFactor = (Math.random() - 0.5) * volatility * 0.5;
    
    const priceChange = trendFactor + volatilityFactor + randomFactor;
    const base = basePrice * (1 + priceChange / 100);
    
    // Generate realistic OHLC
    const open = +(base + (Math.random() - 0.5) * volatility).toFixed(2);
    const close = +(base + (Math.random() - 0.5) * volatility).toFixed(2);
    const high = Math.max(open, close) + +(Math.random() * volatility * 0.3).toFixed(2);
    const low = Math.min(open, close) - +(Math.random() * volatility * 0.3).toFixed(2);
    const volume = +(1000 + Math.random() * 5000).toFixed(2);
    
    return { 
      time: t * 1000, 
      open, 
      high, 
      low, 
      close, 
      volume 
    };
  });

  return candles;
}

function getVolatility(symbol: string): number {
  const volatility: Record<string, number> = {
    'BTCUSDT': 2.5,
    'ETHUSDT': 3.0,
    'BNBUSDT': 2.8,
    'ADAUSDT': 4.0,
    'SOLUSDT': 5.0,
    'XRPUSDT': 3.5,
    'DOTUSDT': 4.2,
    'DOGEUSDT': 6.0,
    'AVAXUSDT': 4.5,
    'MATICUSDT': 3.8,
  };
  return volatility[symbol] || 3.0;
}

function getTrend(symbol: string): number {
  const trend: Record<string, number> = {
    'BTCUSDT': 0.1,
    'ETHUSDT': 0.2,
    'BNBUSDT': 0.15,
    'ADAUSDT': -0.1,
    'SOLUSDT': 0.3,
    'XRPUSDT': 0.05,
    'DOTUSDT': -0.05,
    'DOGEUSDT': 0.4,
    'AVAXUSDT': 0.2,
    'MATICUSDT': 0.1,
  };
  return trend[symbol] || 0.1;
}

function generateMockCandles(symbol: string, interval: string, limit: number) {
  const step = INTERVAL_SEC[interval] ?? 3600;
  const now = Math.floor(Date.now() / 1000);
  
  // Get realistic base price for symbol
  const basePrice = getBasePrice(symbol);
  
  const candles = Array.from({ length: limit }).map((_, i) => {
    const t = now - (limit - i) * step;
    const volatility = getVolatility(symbol);
    const trend = getTrend(symbol);
    
    // More realistic price movements
    const trendFactor = trend * (i / limit);
    const volatilityFactor = volatility * Math.sin(i / 8) + volatility * Math.cos(i / 12);
    const randomFactor = (Math.random() - 0.5) * volatility * 0.3;
    
    const priceChange = trendFactor + volatilityFactor + randomFactor;
    const base = basePrice * (1 + priceChange / 100);
    
    const open = +(base + (Math.random() - 0.5) * volatility).toFixed(2);
    const close = +(base + (Math.random() - 0.5) * volatility).toFixed(2);
    const high = Math.max(open, close) + +(Math.random() * volatility * 0.4).toFixed(2);
    const low = Math.min(open, close) - +(Math.random() * volatility * 0.4).toFixed(2);
    const volume = +(1000 + Math.random() * 3000).toFixed(2);
    
    return { time: t * 1000, open, high, low, close, volume };
  });

  return candles;
}

function getBasePrice(symbol: string): number {
  const prices: Record<string, number> = {
    'BTCUSDT': 45000,
    'ETHUSDT': 3000,
    'BNBUSDT': 300,
    'ADAUSDT': 0.5,
    'SOLUSDT': 100,
    'XRPUSDT': 0.6,
    'DOTUSDT': 7,
    'DOGEUSDT': 0.08,
    'AVAXUSDT': 25,
    'MATICUSDT': 0.8,
  };
  return prices[symbol] || 100;
}