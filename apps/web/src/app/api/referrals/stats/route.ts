import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions, type IronSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const session = await getIronSession(req, new NextResponse(), sessionOptions) as IronSession;
    if (!session.user) {
      return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
    }

    // Get user's referral stats
    const referralStats = await prisma.referralStats.findUnique({
      where: { userId: session.user.id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            referralCode: true,
            createdAt: true
          }
        }
      }
    });

    // Get list of users invited by this user
    const invitedUsers = await prisma.user.findMany({
      where: { invitedById: session.user.id },
      select: {
        id: true,
        email: true,
        createdAt: true,
        deposits: {
          where: { status: 'APPROVED' },
          select: {
            id: true,
            amount: true,
            createdAt: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Calculate additional stats
    const totalInvited = invitedUsers.length;
    const successfulReferrals = invitedUsers.filter(user => user.deposits.length > 0).length;
    const totalEarnings = 0; // Calculate from deposits if needed

    return NextResponse.json({
      ok: true,
      stats: {
        referralCode: referralStats?.user?.referralCode || 'N/A',
        totalInvited,
        successfulReferrals,
        totalEarnings,
        tier: referralStats?.tier || 1,
        invitedUsers: invitedUsers.map(user => ({
          id: user.id,
          email: user.email,
          joinedAt: user.createdAt,
          hasDeposited: user.deposits.length > 0,
          firstDepositAt: user.deposits[0]?.createdAt || null,
          totalDeposits: user.deposits.length
        }))
      }
    });

  } catch (error) {
    console.error('Error fetching referral stats:', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to fetch referral stats' },
      { status: 500 }
    );
  }
}
