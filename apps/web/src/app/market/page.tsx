import { cookies } from 'next/headers';

async function loadCandles() {
  const cookie = cookies().toString();
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3001';
  const url  = `${base}/api/market/candles?symbol=BTCUSDT&interval=1h&limit=50`;

  const res = await fetch(url, {
    headers: { Cookie: cookie },
    cache: 'no-store',
  });

  if (res.status === 401) return { ok:false, reason:'unauth' as const };
  if (!res.ok)          return { ok:false, reason:'bad' as const };

  const data = await res.json();
  return { ok:true, data };
}

export default async function MarketPage() {
  const result = await loadCandles();

  if (!result.ok) {
    if (result.reason === 'unauth') {
      return <div className="p-6">الرجاء تسجيل الدخول للوصول إلى السوق.</div>;
    }
    return <div className="p-6">تعذر تحميل بيانات السوق حالياً.</div>;
  }

  const { data } = result;
  // TODO: render your candlestick chart with data.candles
  return (
    <pre className="p-6 text-sm overflow-x-auto">
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}
