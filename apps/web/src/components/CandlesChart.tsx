/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import React, { useEffect, useRef } from "react";
import {
  createChart,
  type IChartApi,
  type CandlestickData, type HistogramData, type Time, UTCTimestamp
} from "lightweight-charts";

type Candle = { time:number; open:number; high:number; low:number; close:number; volume?:number };

export default function CandlesChart({
  candles, height = 420
}:{ candles: Candle[]; height?: number }) {
  const containerRef = useRef<HTMLDivElement|null>(null);
  const chartRef = useRef<IChartApi|null>(null);
  const candleRef = useRef<any>(null);
  const volumeRef = useRef<any>(null);

  useEffect(()=>{
    if (!containerRef.current) return;
    const chart = createChart(containerRef.current, {
      height,
      layout: { textColor: "#222" },
      rightPriceScale: { visible: true },
      leftPriceScale: { visible: true },
      timeScale: { borderVisible: false },
    });
    chartRef.current = chart;

    // Use the correct API for lightweight-charts
    const c = chart.addSeries({
      type: "Candlestick",
      upColor: "#26a69a", 
      downColor: "#ef5350",
      wickUpColor: "#26a69a", 
      wickDownColor: "#ef5350",
      borderVisible: false,
    } as any);
    candleRef.current = c;

    const v = chart.addSeries({
      type: "Histogram",
      priceFormat: { type: "volume" },
    } as any);
    volumeRef.current = v;

    const obs = new ResizeObserver(()=> chart.applyOptions({ width: containerRef.current!.clientWidth }));
    obs.observe(containerRef.current);
    return ()=>{ obs.disconnect(); chart.remove(); };
  },[height]);

  useEffect(()=>{
    if (!candleRef.current || !volumeRef.current) return;

    const cData: CandlestickData<Time>[] = candles.map(k => ({
      time: k.time as unknown as UTCTimestamp,
      open: k.open, high: k.high, low: k.low, close: k.close
    }));
    candleRef.current.setData(cData);

    const vData: HistogramData<Time>[] = candles.map(k => ({
      time: k.time as unknown as UTCTimestamp,
      value: (k.volume ?? 0)
    }));
    volumeRef.current.setData(vData);
  },[candles]);

  return <div ref={containerRef} className="w-full rounded-xl border p-2" />;
}
