import { NextResponse } from 'next/server';
import { getPolicies } from '@/lib/policies';

export async function GET() {
  const policies = getPolicies();
  return NextResponse.json({ ok: true, policies });
}