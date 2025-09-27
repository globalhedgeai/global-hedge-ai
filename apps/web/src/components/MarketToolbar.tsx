"use client";
import React from "react";
import { useTranslations } from 'next-intl';

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
  const t = useTranslations();
  
  return (
    <div className="flex flex-wrap items-center gap-4 mb-6 p-4 bg-gray-50 rounded-lg border" dir="rtl">
      <div className="flex items-center gap-2">
        <label htmlFor="symbol-select" className="text-sm font-medium text-gray-700">
          {t('market.symbol')}
        </label>
        <select
          id="symbol-select"
          value={symbol}
          onChange={(e) => onChangeSymbol(e.target.value)}
          disabled={isLoading}
          className="border rounded px-3 py-2 bg-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          aria-label={t('market.symbol')}
        >
          {SYMBOLS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-2">
        <label htmlFor="interval-select" className="text-sm font-medium text-gray-700">
          {t('market.interval')}
        </label>
        <select
          id="interval-select"
          value={interval}
          onChange={(e) => onChangeInterval(e.target.value)}
          disabled={isLoading}
          className="border rounded px-3 py-2 bg-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          aria-label={t('market.interval')}
        >
          {INTERVALS.map((i) => (
            <option key={i} value={i}>
              {i}
            </option>
          ))}
        </select>
      </div>

      {onRefresh && (
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          aria-label={t('market.refresh')}
          aria-busy={isLoading}
          aria-disabled={isLoading}
        >
          {isLoading ? t('market.refreshing') : t('market.refresh')}
        </button>
      )}
    </div>
  );
}