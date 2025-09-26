import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions, type IronSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { walletSchema } from '@/lib/validators';

export async function GET(req: NextRequest) {
  const session = await getIronSession(req, new NextResponse(), sessionOptions) as IronSession;
  if (!session.user) return NextResponse.json({ ok: false }, { status: 401 });
  
  const user = await prisma.user.findUnique({ 
    where: { id: session.user.id }, 
    select: { id: true, email: true, role: true, walletAddress: true } 
  });
  return NextResponse.json({ ok: true, user });
}

export async function PUT(req: NextRequest) {
  const session = await getIronSession(req, new NextResponse(), sessionOptions) as IronSession;
  if (!session.user) return NextResponse.json({ ok: false }, { status: 401 });

  const { walletAddress } = await req.json().catch(() => ({}));
  const parsed = walletSchema.safeParse(walletAddress);
  if (!parsed.success) return NextResponse.json({ ok: false, error: 'invalid_wallet' }, { status: 400 });
  await prisma.user.update({ where: { id: session.user.id }, data: { walletAddress } });
  return NextResponse.json({ ok: true });
}