import { getIronSession } from 'iron-session';
import { sessionOptions, type IronSession } from './session';
import type { SessionUser } from './session';
import { NextRequest, NextResponse } from 'next/server';

export async function getSessionUser(req: Request): Promise<SessionUser | null> {
  const session = await getIronSession(req, new Response(), sessionOptions) as IronSession;
  return session.user || null;
}

export async function requireUserApi(req: NextRequest): Promise<NextResponse> {
  const res = new NextResponse();
  const session = await getIronSession(req, res, sessionOptions) as IronSession;
  if (!session.user) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }
  return res;
}