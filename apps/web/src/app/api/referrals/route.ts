import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions, type IronSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const session = await getIronSession(req, new NextResponse(), sessionOptions) as IronSession;
  if (!session.user) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });

  try {
    // Get or create referral code for user
    let referralCode = await prisma.referralCode.findFirst({
      where: { 
        ownerUserId: session.user.id,
        isActive: true 
      }
    });

    if (!referralCode) {
      // Generate a unique referral code
      const userCode = session.user.id.slice(-8).toUpperCase();
      referralCode = await prisma.referralCode.create({
        data: {
          code: userCode,
          ownerUserId: session.user.id,
          isActive: true
        }
      });
    }

    // Get referral stats
    const stats = await prisma.referralStats.findUnique({
      where: { userId: session.user.id }
    });

    // Get invited users
    const invitedUsers = await prisma.user.findMany({
      where: { invitedById: session.user.id },
      select: { 
        id: true, 
        email: true, 
        createdAt: true,
        balance: true 
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({
      ok: true,
      referralCode: referralCode.code,
      stats: {
        invitedCount: stats?.invitedCount || 0,
        tier: stats?.tier || 1
      },
      invitedUsers: invitedUsers.map(user => ({
        id: user.id,
        email: user.email,
        joinedAt: user.createdAt,
        balance: user.balance
      }))
    });
  } catch (error) {
    console.error('Error fetching referral data:', error);
    return NextResponse.json({ ok: false, error: 'server_error' }, { status: 500 });
  }
}
