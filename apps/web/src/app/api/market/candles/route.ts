import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const Params = z.object({
  symbol: z.string().default("BTCUSDT"),
  interval: z.enum(["1m","5m","15m","1h","4h","1d"]).default("1h"),
  limit: z.coerce.number().min(1).max(500).default(200),
});

const INTERVAL_SEC: Record<string, number> = {
  "1m": 60, "5m": 300, "15m": 900, "1h": 3600, "4h": 14400, "1d": 86400,
};

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const parsed = Params.safeParse({
    symbol: url.searchParams.get("symbol") || undefined,
    interval: url.searchParams.get("interval") || undefined,
    limit: url.searchParams.get("limit") || undefined,
  });
  if (!parsed.success) {
    return NextResponse.json({ ok:false, error:"bad_params" }, { status: 400 });
  }
  const { symbol, interval, limit } = parsed.data;
  const step = INTERVAL_SEC[interval] ?? 3600;

  // mock candles with volume
  const now = Math.floor(Date.now()/1000);
  const candles = Array.from({ length: limit }).map((_, i) => {
    const t = now - (limit - i) * step;
    const base = 45000 + Math.sin(i/5) * 400 + Math.cos(i/7) * 250;
    const open  = +(base + (Math.random()-0.5)*80).toFixed(2);
    const close = +(base + (Math.random()-0.5)*80).toFixed(2);
    const high  = Math.max(open, close) + +(Math.random()*120).toFixed(2);
    const low   = Math.min(open, close) - +(Math.random()*120).toFixed(2);
    const volume = +(500 + Math.random()*1000).toFixed(2);
    return { time: t, open, high, low, close, volume };
  });

  return NextResponse.json({ ok:true, symbol, interval, candles });
}