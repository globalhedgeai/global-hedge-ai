import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions, type IronSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { withdrawSchema } from '@/lib/validators';

export async function GET(req: NextRequest) {
  const session = await getIronSession(req, new NextResponse(), sessionOptions) as IronSession;
  if (!session.user) return NextResponse.json({ ok: false }, { status: 401 });

  const items = await prisma.withdrawal.findMany({ 
    where: { userId: session.user.id }, 
    orderBy: { createdAt: 'desc' } 
  });
  return NextResponse.json({ ok: true, items });
}

export async function POST(req: NextRequest) {
  const session = await getIronSession(req, new NextResponse(), sessionOptions) as IronSession;
  if (!session.user) return NextResponse.json({ ok: false }, { status: 401 });

  const json = await req.json().catch(() => ({}));
  const parsed = withdrawSchema.safeParse({ ...json });
  if (!parsed.success) return NextResponse.json({ ok: false, error: 'invalid' }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user?.walletAddress) return NextResponse.json({ ok: false, error: 'no_wallet' }, { status: 400 });

  const created = await prisma.withdrawal.create({
    data: {
      amount: parsed.data.amount,
      toAddress: parsed.data.address,
      status: 'PENDING',
      user: { connect: { id: session.user.id } },
    },
  });
  return NextResponse.json({ ok: true, id: created.id });
}