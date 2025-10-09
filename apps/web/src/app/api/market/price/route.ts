import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const symbol = searchParams.get('symbol') || 'BTCUSDT';

    // Use Binance API for real-time price
    const binanceUrl = `https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`;
    
    console.log('🔄 Fetching real-time price from Binance:', binanceUrl);
    
    const response = await fetch(binanceUrl, {
      headers: {
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(5000), // 5 second timeout
    });

    if (!response.ok) {
      throw new Error(`Binance API error: ${response.status}`);
    }

    const data = await response.json();
    
    const price = parseFloat(data.price);
    
    console.log(`✅ Real-time price for ${symbol}: $${price}`);

    return NextResponse.json({
      ok: true,
      symbol,
      price,
      source: 'binance',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error fetching real-time price:', error);
    
    // Fallback price
    const fallbackPrice = 45000;
    
    return NextResponse.json({
      ok: true,
      symbol: 'BTCUSDT',
      price: fallbackPrice,
      source: 'fallback',
      error: 'Using fallback price due to API error',
      timestamp: new Date().toISOString()
    });
  }
}
