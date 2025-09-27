"use client";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import CandlesChart from "@/components/CandlesChart";
import { MarketToolbar, type Interval, type Pair } from "@/components/MarketToolbar";

type Candle = { time:number; open:number; high:number; low:number; close:number; volume?:number };

export default function MarketPage() {
  const [symbol, setSymbol] = useState<Pair>("BTCUSDT");
  const [interval, setInterval] = useState<Interval>("1h");
  const [candles, setCandles] = useState<Candle[]>([]);
  const [loading, setLoading] = useState(false);

  const qs = useMemo(()=> new URLSearchParams({
    symbol, interval, limit: "200"
  }).toString(), [symbol, interval]);

  const fetchCandles = useCallback(async ()=>{
    setLoading(true);
    try {
      const r = await fetch(`/api/market/candles?${qs}`, { cache:"no-store" });
      const j = await r.json();
      if (j?.ok && Array.isArray(j.candles)) setCandles(j.candles);
    } finally { setLoading(false); }
  },[qs]);

  useEffect(()=>{
    fetchCandles();
    const id = window.setInterval(fetchCandles, 10000);
    return ()=> clearInterval(id);
  },[fetchCandles]);

  return (
    <main className="p-4 max-w-6xl mx-auto">
      <h1 className="text-xl font-semibold mb-3">Market</h1>
      <MarketToolbar
        symbol={symbol}
        interval={interval}
        onChangeSymbol={setSymbol}
        onChangeInterval={setInterval}
        onRefresh={fetchCandles}
      />
      {loading && <div className="text-sm text-gray-500 mb-2">Loading…</div>}
      <CandlesChart candles={candles} />
    </main>
  );
}