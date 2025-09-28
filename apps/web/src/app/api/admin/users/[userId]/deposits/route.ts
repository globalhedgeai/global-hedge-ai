import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions, type IronSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await getIronSession(req, new NextResponse(), sessionOptions) as IronSession;
    const { userId } = await params;
    
    // Check if user is admin
    if (!session.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
    }

    // Get user deposits
    const deposits = await prisma.deposit.findMany({
      where: { userId },
      select: {
        id: true,
        amount: true,
        status: true,
        createdAt: true,
        effectiveAt: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      ok: true,
      deposits
    });

  } catch (error) {
    console.error('Error fetching user deposits:', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to fetch deposits' },
      { status: 500 }
    );
  }
}
