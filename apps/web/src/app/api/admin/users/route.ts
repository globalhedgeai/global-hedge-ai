import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions, type IronSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const session = await getIronSession(req, new NextResponse(), sessionOptions) as IronSession;
    
    // Check if user is admin
    if (!session.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
    }

    // Get all users with their basic info
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        balance: true,
        role: true,
        createdAt: true,
        firstDepositAt: true,
        lastWithdrawalAt: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      ok: true,
      users
    });

  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}
