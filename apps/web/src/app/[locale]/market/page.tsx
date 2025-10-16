"use client";
import React, { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import MarketToolbar from "@/components/MarketToolbar";
import CandlesChart from "@/components/CandlesChart";
import CryptoPairsList from "@/components/CryptoPairsList";
import { useTranslation } from '@/lib/translations';
import { formatCurrency, formatPercentage } from '@/lib/numberFormat';

type Candle = { time: number; open: number; high: number; low: number; close: number; volume?: number };

interface MarketPrice {
  symbol: string;
  price: number;
  change24h: number;
  change24hPercent: number;
  volume24h: number;
}

const VALID_SYMBOLS = ["BTCUSDT", "ETHUSDT", "BNBUSDT", "ADAUSDT", "SOLUSDT", "XRPUSDT", "DOTUSDT", "DOGEUSDT", "AVAXUSDT", "MATICUSDT"] as const;
const VALID_INTERVALS = ["1m", "5m", "15m", "1h", "4h", "1d"] as const;

// Simple client-side cache
const cache = new Map<string, { ts: number; data: Candle[] }>();
const CACHE_TTL = 30000; // 30 seconds

export default function MarketPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, locale } = useTranslation();
  
  // Initialize state from URL params with validation
  const [symbol, setSymbol] = useState<string>(() => {
    const param = searchParams.get("symbol");
    return VALID_SYMBOLS.includes(param as typeof VALID_SYMBOLS[number]) ? param! : "BTCUSDT";
  });
  
  const [interval, setInterval] = useState<string>(() => {
    const param = searchParams.get("interval");
    return VALID_INTERVALS.includes(param as typeof VALID_INTERVALS[number]) ? param! : "1h";
  });
  
  const [candles, setCandles] = useState<Candle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [marketPrices, setMarketPrices] = useState<MarketPrice[]>([]);
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [priceChange24h, setPriceChange24h] = useState<number>(0);
  const [volume24h, setVolume24h] = useState<number>(0);
  
  const abortControllerRef = useRef<AbortController | null>(null);

  const queryString = useMemo(() => 
    new URLSearchParams({
      symbol,
      interval,
      limit: "200"
    }).toString(), 
    [symbol, interval]
  );

  const fetchMarketPrices = useCallback(async () => {
    try {
      const response = await fetch('/api/market/prices');
      const data = await response.json();
      
      if (data.ok) {
        setMarketPrices(data.prices);
        
        // Update current symbol's price info
        const currentSymbolData = data.prices.find((p: MarketPrice) => p.symbol === symbol);
        if (currentSymbolData) {
          setCurrentPrice(currentSymbolData.price);
          setPriceChange24h(currentSymbolData.change24hPercent);
          setVolume24h(currentSymbolData.volume24h);
        }
      }
    } catch (error) {
      console.error('Error fetching market prices:', error);
    }
  }, [symbol]);

  const fetchCandles = useCallback(async () => {
    const cacheKey = `${symbol}:${interval}`;
    const cached = cache.get(cacheKey);
    
    // Check cache first
    if (cached && Date.now() - cached.ts < CACHE_TTL) {
      setCandles(cached.data);
      setError(null);
      return;
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/market/candles?${queryString}`, { 
        cache: "no-store",
        signal: controller.signal
      });
      
      if (response.status === 401) {
        // Handle unauthorized - redirect to login
        alert(t('market.sessionExpired'));
        router.push("/login");
        return;
      }
      
      const data = await response.json();
      if (data?.ok && Array.isArray(data.candles)) {
        // Cache the data
        cache.set(cacheKey, { ts: Date.now(), data: data.candles });
        
        setCandles(data.candles);
        setError(null);
      } else {
        setError(t('market.error'));
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return; // Request was cancelled, ignore
      }
      console.error("Error fetching candles:", error);
      setError(t('market.error'));
    } finally {
      setLoading(false);
    }
  }, [queryString, symbol, interval, router, t]);

  // Handle symbol/interval changes
  const handleSymbolChange = useCallback((newSymbol: string) => {
    setSymbol(newSymbol);
    router.replace(`/market?symbol=${newSymbol}&interval=${interval}`, { scroll: false });
  }, [interval, router]);

  const handleIntervalChange = useCallback((newInterval: string) => {
    setInterval(newInterval);
    router.replace(`/market?symbol=${symbol}&interval=${newInterval}`, { scroll: false });
  }, [symbol, router]);

  // Handle crypto pair selection
  const handlePairSelect = useCallback((pair: { symbol: string }) => {
    handleSymbolChange(pair.symbol);
  }, [handleSymbolChange]);

  // Fetch data and set up auto-refresh
  useEffect(() => {
    fetchCandles();
    fetchMarketPrices();
    
    const candlesInterval = window.setInterval(fetchCandles, 10000);
    const pricesInterval = window.setInterval(fetchMarketPrices, 5000); // Update prices more frequently
    
    return () => {
      clearInterval(candlesInterval);
      clearInterval(pricesInterval);
    };
  }, [fetchCandles, fetchMarketPrices]);

  // Calculate current price and change (use real data if available)
  const displayPrice = currentPrice > 0 ? currentPrice : (candles.length > 0 ? candles[candles.length - 1].close : 0);
  const displayChange = priceChange24h !== 0 ? priceChange24h : (candles.length > 1 ? ((candles[candles.length - 1].close - candles[candles.length - 2].close) / candles[candles.length - 2].close * 100) : 0);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Professional Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-primary to-yellow-400 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">{t('market.title')}</h1>
                <p className="text-sm text-muted-foreground">{t('market.subtitle')}</p>
              </div>
            </div>
            
            {/* Live Price Display */}
            <div className="flex items-center space-x-6">
              <div className="text-right">
                <div className="text-sm text-muted-foreground">Current Price</div>
                <div className="text-xl font-bold text-foreground">
                  {formatCurrency(displayPrice, locale)}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-muted-foreground">24h Change</div>
                <div className={`text-xl font-bold ${displayChange >= 0 ? 'text-success' : 'text-error'}`}>
                  {displayChange >= 0 ? '+' : ''}{formatPercentage(displayChange, locale)}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-muted-foreground">24h Volume</div>
                <div className="text-lg font-semibold text-info">
                  {formatCurrency(volume24h, locale)}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Market Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Total Volume</p>
                <p className="text-lg font-bold text-foreground">$2.4B</p>
              </div>
              <div className="w-8 h-8 bg-success/20 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Active Pairs</p>
                <p className="text-lg font-bold text-foreground">24</p>
              </div>
              <div className="w-8 h-8 bg-info/20 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-info" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Market Cap</p>
                <p className="text-lg font-bold text-foreground">$1.2T</p>
              </div>
              <div className="w-8 h-8 bg-warning/20 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">24h High</p>
                <p className="text-lg font-bold text-success">
                  {candles.length > 0 ? formatCurrency(Math.max(...candles.map(c => c.high)), locale) : '$0.00'}
                </p>
              </div>
              <div className="w-8 h-8 bg-success/20 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                </svg>
              </div>
            </div>
          </div>
        </div>
        
        {/* Main Trading Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Crypto Pairs List */}
          <div className="lg:col-span-1">
            <div className="bg-card border border-border rounded-xl p-4">
              <h3 className="text-lg font-semibold text-foreground mb-4">Markets</h3>
              <CryptoPairsList 
                onSelectPair={handlePairSelect}
                selectedPair={symbol}
              />
            </div>
          </div>
          
          {/* Chart Section */}
          <div className="lg:col-span-3">
            {/* Trading Toolbar */}
            <div className="bg-card border border-border rounded-xl p-4 mb-4">
              <MarketToolbar
                symbol={symbol}
                interval={interval}
                onChangeSymbol={handleSymbolChange}
                onChangeInterval={handleIntervalChange}
                onRefresh={fetchCandles}
                isLoading={loading}
              />
            </div>
            
            {/* Chart Container */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              {/* Chart Header */}
              <div className="p-4 border-b border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
                        <span className="text-primary text-sm font-bold">
                          {symbol.includes('BTC') ? '₿' : symbol.includes('ETH') ? 'Ξ' : symbol.includes('BNB') ? 'B' : 'C'}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">{symbol}</h3>
                        <p className="text-xs text-muted-foreground">{t('market.priceChart')}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-6">
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">Price</p>
                      <p className="text-lg font-bold text-foreground">
                        {formatCurrency(displayPrice, locale)}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">24h Change</p>
                      <p className={`text-lg font-bold ${displayChange >= 0 ? 'text-success' : 'text-error'}`}>
                        {displayChange >= 0 ? '+' : ''}{formatPercentage(displayChange, locale)}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">24h Volume</p>
                      <p className="text-sm font-semibold text-info">
                        {formatCurrency(volume24h, locale)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Chart Content */}
              <div className="p-4">
                {loading && (
                  <div className="flex items-center justify-center py-12">
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-sm">{t('market.loadingData')}</span>
                    </div>
                  </div>
                )}
                
                {error && (
                  <div className="flex items-center justify-center py-12">
                    <div className="flex items-center gap-3 text-error">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm">{error}</span>
                    </div>
                  </div>
                )}
                
                {!loading && !error && (
                  <CandlesChart candles={candles} height={500} />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}