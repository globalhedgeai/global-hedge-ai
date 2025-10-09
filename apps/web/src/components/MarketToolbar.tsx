"use client";
import React from "react";
import { useTranslation } from '@/lib/translations';

interface MarketToolbarProps {
  symbol: string;
  interval: string;
  onChangeSymbol: (s: string) => void;
  onChangeInterval: (i: string) => void;
  onRefresh?: () => void;
  isLoading?: boolean;
}

const SYMBOLS = ["BTCUSDT", "ETHUSDT"] as const;
const INTERVALS = ["1m", "5m", "15m", "1h", "4h", "1d"] as const;

export default function MarketToolbar({
  symbol,
  interval,
  onChangeSymbol,
  onChangeInterval,
  onRefresh,
  isLoading = false
}: MarketToolbarProps) {
  const { t } = useTranslation();
  
  return (
    <div className="card hover-lift">
      <div className="flex flex-wrap items-center gap-6">
        {/* Symbol Selector */}
        <div className="flex items-center gap-3">
          <label htmlFor="symbol-select" className="text-sm font-semibold text-foreground whitespace-nowrap">
            {t('market.symbol')}
          </label>
          <div className="relative">
            <select
              id="symbol-select"
              value={symbol}
              onChange={(e) => onChangeSymbol(e.target.value)}
              disabled={isLoading}
              className="input min-w-[120px] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed appearance-none pr-8"
              aria-label={t('market.symbol')}
            >
              {SYMBOLS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Interval Selector */}
        <div className="flex items-center gap-3">
          <label htmlFor="interval-select" className="text-sm font-semibold text-foreground whitespace-nowrap">
            {t('market.interval')}
          </label>
          <div className="relative">
            <select
              id="interval-select"
              value={interval}
              onChange={(e) => onChangeInterval(e.target.value)}
              disabled={isLoading}
              className="input min-w-[100px] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed appearance-none pr-8"
              aria-label={t('market.interval')}
            >
              {INTERVALS.map((i) => (
                <option key={i} value={i}>
                  {i}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Refresh Button */}
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="btn-secondary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label={t('market.refresh')}
            aria-busy={isLoading}
            aria-disabled={isLoading}
          >
            <svg 
              className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
              />
            </svg>
            {isLoading ? t('market.refreshing') : t('market.refresh')}
          </button>
        )}

        {/* Status Indicator */}
        <div className="flex items-center gap-2 ml-auto">
          <div className={`w-2 h-2 rounded-full ${isLoading ? 'bg-warning animate-pulse' : 'bg-success'}`}></div>
          <span className="text-xs text-muted-foreground">
            {isLoading ? t('market.updating') : t('market.live')}
          </span>
        </div>
      </div>
    </div>
  );
}