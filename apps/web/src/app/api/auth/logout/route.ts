import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions } from '@/lib/session';

export async function POST(req: NextRequest) {
  const res = NextResponse.json({ ok: true });
  const session = await getIronSession(req, res, sessionOptions);
  session.destroy();
  
  // إضافة header لمسح التخزين المؤقت على العميل
  res.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.headers.set('Pragma', 'no-cache');
  res.headers.set('Expires', '0');
  
  // إضافة header لإعلام العميل بمسح التخزين المؤقت
  res.headers.set('X-Clear-Auth-Cache', 'true');
  
  return res;
}