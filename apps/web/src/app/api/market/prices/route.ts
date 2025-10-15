import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const symbols = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'ADAUSDT', 'SOLUSDT', 'XRPUSDT', 'DOTUSDT', 'DOGEUSDT', 'AVAXUSDT', 'MATICUSDT'];
    
    // Try to get real prices from multiple sources
    let prices: Array<{
      symbol: string;
      price: number;
      change24h: number;
      volume24h: number;
    }> = [];
    let source = 'unknown';
    
    // Try CoinGecko first
    try {
      console.log('🔄 Fetching real prices from CoinGecko...');
      const coinGeckoUrl = 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,binancecoin,cardano,solana,ripple,polkadot,dogecoin,avalanche-2,matic-network&vs_currencies=usd&include_24hr_change=true';
      
      const cgResponse = await fetch(coinGeckoUrl, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'GlobalHedgeAI/1.0',
        },
        signal: AbortSignal.timeout(8000),
      });

      if (cgResponse.ok) {
        const cgData = await cgResponse.json();
        
        const symbolMapping: Record<string, string> = {
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

        prices = symbols.map(symbol => {
          const coinId = symbolMapping[symbol];
          const coinData = cgData[coinId];
          
          if (coinData) {
            return {
              symbol,
              price: coinData.usd,
              change24h: coinData.usd_24h_change || 0,
              volume24h: coinData.usd_24h_vol || 0,
            };
          }
          
          return {
            symbol,
            price: getFallbackPrice(symbol),
            change24h: (Math.random() - 0.5) * 100,
            volume24h: Math.random() * 1000000,
          };
        });
        
        source = 'coingecko';
        console.log(`✅ Fetched ${prices.length} prices from CoinGecko`);
      }
    } catch (cgError) {
      console.log('❌ CoinGecko failed:', cgError);
    }

    // If CoinGecko failed, try Binance
    if (prices.length === 0) {
      try {
        console.log('🔄 Fetching prices from Binance...');
        const binanceUrl = `https://api.binance.com/api/v3/ticker/24hr?symbols=${JSON.stringify(symbols)}`;
        
        const binanceResponse = await fetch(binanceUrl, {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'GlobalHedgeAI/1.0',
          },
          signal: AbortSignal.timeout(8000),
        });

        if (binanceResponse.ok) {
          const binanceData = await binanceResponse.json();
          prices = binanceData.map((ticker: {
            symbol: string;
            price: string;
            priceChangePercent: string;
            volume: string;
          }) => ({
            symbol: ticker.symbol,
            price: parseFloat(ticker.price),
            change24h: parseFloat(ticker.priceChangePercent),
            volume24h: parseFloat(ticker.volume),
          }));
          source = 'binance';
          console.log(`✅ Fetched ${prices.length} prices from Binance`);
        }
      } catch (binanceError) {
        console.log('❌ Binance failed:', binanceError);
      }
    }

    // Fallback to realistic mock data
    if (prices.length === 0) {
      console.log('🔄 Using fallback mock prices...');
      prices = symbols.map(symbol => ({
        symbol,
        price: getFallbackPrice(symbol),
        change24h: (Math.random() - 0.5) * 200,
        volume24h: Math.random() * 1000000,
      }));
      source = 'mock';
    }

    return NextResponse.json({
      ok: true,
      prices,
      source,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('❌ Error fetching market prices:', error);
    
    return NextResponse.json({
      ok: false,
      error: 'Failed to fetch market prices',
      prices: [],
      source: 'error',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}

function getFallbackPrice(symbol: string): number {
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
