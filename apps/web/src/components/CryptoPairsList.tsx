"use client";
import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/lib/translations';

interface CryptoPair {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  volume24h: number;
  icon: string;
}

const CRYPTO_PAIRS: CryptoPair[] = [
  { symbol: 'BTCUSDT', name: 'Bitcoin', price: 0, change24h: 0, volume24h: 0, icon: '₿' },
  { symbol: 'ETHUSDT', name: 'Ethereum', price: 0, change24h: 0, volume24h: 0, icon: 'Ξ' },
  { symbol: 'BNBUSDT', name: 'BNB', price: 0, change24h: 0, volume24h: 0, icon: 'B' },
  { symbol: 'ADAUSDT', name: 'Cardano', price: 0, change24h: 0, volume24h: 0, icon: '₳' },
  { symbol: 'SOLUSDT', name: 'Solana', price: 0, change24h: 0, volume24h: 0, icon: '◎' },
  { symbol: 'XRPUSDT', name: 'XRP', price: 0, change24h: 0, volume24h: 0, icon: 'X' },
  { symbol: 'DOTUSDT', name: 'Polkadot', price: 0, change24h: 0, volume24h: 0, icon: '●' },
  { symbol: 'DOGEUSDT', name: 'Dogecoin', price: 0, change24h: 0, volume24h: 0, icon: 'Ð' },
  { symbol: 'AVAXUSDT', name: 'Avalanche', price: 0, change24h: 0, volume24h: 0, icon: 'A' },
  { symbol: 'MATICUSDT', name: 'Polygon', price: 0, change24h: 0, volume24h: 0, icon: 'M' },
];

export default function CryptoPairsList({ 
  onSelectPair, 
  selectedPair 
}: { 
  onSelectPair: (pair: CryptoPair) => void;
  selectedPair: string;
}) {
  const { t } = useTranslation();
  const [pairs, setPairs] = useState<CryptoPair[]>(CRYPTO_PAIRS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPrices();
    const interval = setInterval(fetchPrices, 10000); // Update every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchPrices = async () => {
    try {
      const promises = CRYPTO_PAIRS.map(async (pair) => {
        try {
          // Fetch 24h ticker data from Binance
          const response = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${pair.symbol}`);
          if (!response.ok) throw new Error('API Error');
          
          const data = await response.json();
          return {
            ...pair,
            price: parseFloat(data.lastPrice),
            change24h: parseFloat(data.priceChangePercent),
            volume24h: parseFloat(data.volume),
          };
        } catch (error) {
          console.warn(`Failed to fetch data for ${pair.symbol}:`, error);
          return pair; // Return original pair if fetch fails
        }
      });

      const updatedPairs = await Promise.all(promises);
      setPairs(updatedPairs);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching crypto prices:', error);
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <div className="p-4">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
          {t('market.cryptoPairs')}
        </h3>
        
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-12 bg-muted/20 rounded-lg"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {pairs.map((pair) => (
              <div
                key={pair.symbol}
                onClick={() => onSelectPair(pair)}
                className={`p-3 rounded-lg cursor-pointer transition-all duration-200 hover:bg-accent/50 ${
                  selectedPair === pair.symbol 
                    ? 'bg-primary/20 border border-primary/30' 
                    : 'hover:bg-accent/30'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary to-yellow-400 rounded-lg flex items-center justify-center text-primary-foreground font-bold text-sm">
                      {pair.icon}
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">{pair.name}</div>
                      <div className="text-sm text-muted-foreground">{pair.symbol}</div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="font-semibold text-foreground">
                      ${pair.price > 0 ? pair.price.toFixed(2) : '--'}
                    </div>
                    <div className={`text-sm ${
                      pair.change24h >= 0 ? 'text-success' : 'text-error'
                    }`}>
                      {pair.change24h >= 0 ? '+' : ''}{pair.change24h.toFixed(2)}%
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="mt-4 pt-4 border-t border-border">
          <div className="text-xs text-muted-foreground text-center">
            {t('market.dataSource')}: Binance API • {t('market.updateEvery')}: 10s
          </div>
        </div>
      </div>
    </div>
  );
}
