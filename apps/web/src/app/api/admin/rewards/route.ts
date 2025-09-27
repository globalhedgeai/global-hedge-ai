import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions, type IronSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const session = await getIronSession(req, new NextResponse(), sessionOptions) as IronSession;
  if (!session.user) return NextResponse.json({ ok: false }, { status: 401 });

  // Check if user is admin
  if (session.user.role !== 'ADMIN') {
    return NextResponse.json({ ok: false, error: 'Forbidden' }, { status: 403 });
  }

  try {
    const rewards = await prisma.deposit.findMany({
      where: {
        rewardAmount: { gt: 0 }
      },
      include: {
        user: {
          select: {
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    return NextResponse.json({
      ok: true,
      rewards
    });
  } catch (error) {
    console.error('Error fetching rewards:', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to fetch rewards' },
      { status: 500 }
    );
  }
}
