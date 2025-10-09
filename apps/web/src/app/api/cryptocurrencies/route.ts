import { NextResponse } from 'next/server';
import { getEnabledCryptocurrenciesWithAddresses } from '@/lib/cryptocurrencies';

export async function GET() {
  try {
    const cryptocurrencies = await getEnabledCryptocurrenciesWithAddresses();
    return NextResponse.json({ ok: true, cryptocurrencies });
  } catch (error) {
    console.error('Error fetching cryptocurrencies:', error);
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}
