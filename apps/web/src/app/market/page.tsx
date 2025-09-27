"use client";
import React, { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createChart, type IChartApi, type CandlestickData, type UTCTimestamp } from "lightweight-charts";
import MarketToolbar from "@/components/MarketToolbar";

type Candle = { time: number; open: number; high: number; low: number; close: number; volume?: number };

const VALID_SYMBOLS = ["BTCUSDT", "ETHUSDT"] as const;
const VALID_INTERVALS = ["1m", "5m", "15m", "1h", "4h", "1d"] as const;

// Simple client-side cache
const cache = new Map<string, { ts: number; data: CandlestickData[] }>();
const CACHE_TTL = 30000; // 30 seconds

export default function MarketPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Initialize state from URL params with validation
  const [symbol, setSymbol] = useState<string>(() => {
    const param = searchParams.get("symbol");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return VALID_SYMBOLS.includes(param as any) ? param! : "BTCUSDT";
  });
  
  const [interval, setInterval] = useState<string>(() => {
    const param = searchParams.get("interval");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return VALID_INTERVALS.includes(param as any) ? param! : "1h";
  });
  
  const [candles, setCandles] = useState<Candle[]>([]);
  const [loading, setLoading] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const seriesRef = useRef<any>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const queryString = useMemo(() => 
    new URLSearchParams({
      symbol,
      interval,
      limit: "200"
    }).toString(), 
    [symbol, interval]
  );

  const fetchCandles = useCallback(async () => {
    const cacheKey = `${symbol}:${interval}`;
    const cached = cache.get(cacheKey);
    
    // Check cache first
    if (cached && Date.now() - cached.ts < CACHE_TTL) {
      setCandles(cached.data.map(d => ({
        time: d.time as number,
        open: d.open,
        high: d.high,
        low: d.low,
        close: d.close
      })));
      return;
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/market/candles?${queryString}`, { 
        cache: "no-store",
        signal: controller.signal
      });
      
      if (response.status === 401) {
        // Handle unauthorized - redirect to login
        alert("انتهت صلاحية الجلسة. سيتم توجيهك لصفحة تسجيل الدخول.");
        router.push("/login");
        return;
      }
      
      const data = await response.json();
      if (data?.ok && Array.isArray(data.candles)) {
        const formattedData: CandlestickData[] = data.candles.map((c: Candle) => ({
          time: c.time as UTCTimestamp,
          open: c.open,
          high: c.high,
          low: c.low,
          close: c.close
        }));
        
        // Cache the data
        cache.set(cacheKey, { ts: Date.now(), data: formattedData });
        
        setCandles(data.candles);
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return; // Request was cancelled, ignore
      }
      console.error("Error fetching candles:", error);
    } finally {
      setLoading(false);
    }
  }, [queryString, symbol, interval, router]);

  // Handle symbol/interval changes
  const handleSymbolChange = useCallback((newSymbol: string) => {
    setSymbol(newSymbol);
    router.replace(`/market?symbol=${newSymbol}&interval=${interval}`, { scroll: false });
  }, [interval, router]);

  const handleIntervalChange = useCallback((newInterval: string) => {
    setInterval(newInterval);
    router.replace(`/market?symbol=${symbol}&interval=${newInterval}`, { scroll: false });
  }, [symbol, router]);

  // Initialize chart
  useEffect(() => {
    if (!containerRef.current) return;
    
    const chart = createChart(containerRef.current, {
      height: 420,
      layout: { textColor: "#222" },
      rightPriceScale: { visible: true },
      timeScale: { borderVisible: false },
    });
    chartRef.current = chart;

    const series = chart.addSeries({
      type: "Candlestick",
      upColor: "#26a69a",
      downColor: "#ef5350",
      wickUpColor: "#26a69a",
      wickDownColor: "#ef5350",
      borderVisible: false,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
    seriesRef.current = series;

    const resizeObserver = new ResizeObserver(() => {
      if (containerRef.current) {
        chart.applyOptions({ width: containerRef.current.clientWidth });
      }
    });
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
    };
  }, []);

  // Update chart data when candles change
  useEffect(() => {
    if (!seriesRef.current || !candles.length) return;

    const data: CandlestickData[] = candles.map(c => ({
      time: c.time as UTCTimestamp,
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close
    }));
    seriesRef.current.setData(data);
  }, [candles]);

  // Fetch data and set up auto-refresh
  useEffect(() => {
    fetchCandles();
    const id = window.setInterval(fetchCandles, 10000);
    return () => clearInterval(id);
  }, [fetchCandles]);

  return (
    <main className="p-4 max-w-6xl mx-auto" dir="rtl">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">السوق</h1>
      
      <MarketToolbar
        symbol={symbol}
        interval={interval}
        onChangeSymbol={handleSymbolChange}
        onChangeInterval={handleIntervalChange}
        onRefresh={fetchCandles}
        isLoading={loading}
      />
      
      {loading && (
        <div className="text-sm text-gray-500 mb-4 text-center">
          جاري تحميل البيانات...
        </div>
      )}
      
      <div 
        ref={containerRef} 
        className="w-full rounded-xl border p-4 bg-white shadow-sm"
        style={{ height: "420px" }}
      />
    </main>
  );
}