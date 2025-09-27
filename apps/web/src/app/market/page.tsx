"use client";
import React, { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { createChart, type IChartApi, type CandlestickData, type UTCTimestamp } from "lightweight-charts";
import MarketToolbar from "@/components/MarketToolbar";

type Candle = { time: number; open: number; high: number; low: number; close: number; volume?: number };

export default function MarketPage() {
  const [symbol, setSymbol] = useState<string>("BTCUSDT");
  const [interval, setInterval] = useState<string>("1h");
  const [candles, setCandles] = useState<Candle[]>([]);
  const [loading, setLoading] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const seriesRef = useRef<any>(null);

  const queryString = useMemo(() => 
    new URLSearchParams({
      symbol,
      interval,
      limit: "200"
    }).toString(), 
    [symbol, interval]
  );

  const fetchCandles = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/market/candles?${queryString}`, { 
        cache: "no-store" 
      });
      const data = await response.json();
      if (data?.ok && Array.isArray(data.candles)) {
        setCandles(data.candles);
      }
    } catch (error) {
      console.error("Error fetching candles:", error);
    } finally {
      setLoading(false);
    }
  }, [queryString]);

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
        onChangeSymbol={setSymbol}
        onChangeInterval={setInterval}
        onRefresh={fetchCandles}
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