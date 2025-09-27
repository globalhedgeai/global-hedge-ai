"use client";
import React from "react";

const PAIRS = ["BTCUSDT","ETHUSDT","SOLUSDT"] as const;
const INTERVALS = ["1m","5m","15m","1h","4h","1d"] as const;
export type Pair = typeof PAIRS[number];
export type Interval = typeof INTERVALS[number];

export function MarketToolbar({
  symbol, interval, onChangeSymbol, onChangeInterval, onRefresh
}:{
  symbol: Pair; interval: Interval;
  onChangeSymbol:(s:Pair)=>void;
  onChangeInterval:(i:Interval)=>void;
  onRefresh:()=>void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3 mb-4">
      <div className="flex items-center gap-2">
        <label className="text-sm">Pair</label>
        <select
          className="border rounded px-2 py-1"
          value={symbol}
          onChange={(e)=>onChangeSymbol(e.target.value as Pair)}
        >
          {PAIRS.map(p=> <option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      <div className="flex items-center gap-2">
        <label className="text-sm">Interval</label>
        <select
          className="border rounded px-2 py-1"
          value={interval}
          onChange={(e)=>onChangeInterval(e.target.value as Interval)}
        >
          {INTERVALS.map(i=> <option key={i} value={i}>{i}</option>)}
        </select>
      </div>

      <button
        className="border rounded px-3 py-1 hover:bg-gray-100"
        onClick={onRefresh}
      >
        Refresh
      </button>
    </div>
  );
}
