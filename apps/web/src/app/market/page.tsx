'use client';
import { useEffect, useRef, useState } from 'react';
import { createChart, UTCTimestamp } from 'lightweight-charts';

type Candle = { time: number; open: number; high: number; low: number; close: number };

export default function MarketPage() {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<unknown>(null);
  const seriesRef = useRef<unknown>(null);
  const [candles, setCandles] = useState<Candle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCandles = async () => {
    try {
      const res = await fetch('/api/market/candles?symbol=BTCUSDT&interval=1h&limit=50');
      
      if (res.status === 401) {
        setError('الرجاء تسجيل الدخول للوصول إلى السوق.');
        return;
      }
      
      if (!res.ok) {
        setError('تعذر تحميل بيانات السوق حالياً.');
        return;
      }

      const data = await res.json();
      if (data.ok && data.candles) {
        setCandles(data.candles);
        setError(null);
      } else {
        setError('تعذر تحميل بيانات السوق حالياً.');
      }
    } catch {
      setError('تعذر تحميل بيانات السوق حالياً.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandles();
    
    const id = window.setInterval(fetchCandles, 10000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Create chart
    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 400,
      layout: {
        background: { color: 'white' },
        textColor: 'black',
      },
      grid: {
        vertLines: { color: '#f0f0f0' },
        horzLines: { color: '#f0f0f0' },
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
      },
    });

    // Add candlestick series
    const candlestickSeries = (chart as unknown as { addCandlestickSeries: (options: unknown) => unknown }).addCandlestickSeries({
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderVisible: false,
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
    });

    chartRef.current = chart;
    seriesRef.current = candlestickSeries;

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current && chart) {
        chart.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, []);

  useEffect(() => {
    if (seriesRef.current && candles.length > 0) {
      const formattedCandles = candles.map(c => ({
        time: c.time as UTCTimestamp,
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
      }));
      
      (seriesRef.current as { setData: (data: unknown) => void }).setData(formattedCandles);
    }
  }, [candles]);

  if (loading) {
    return <div className="p-6">جاري تحميل بيانات السوق...</div>;
  }

  if (error) {
    return <div className="p-6">{error}</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">سوق العملات الرقمية</h1>
      <div ref={chartContainerRef} className="w-full" />
    </div>
  );
}
