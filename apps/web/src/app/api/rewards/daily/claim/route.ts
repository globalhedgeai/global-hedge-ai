import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions, type IronSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const session = await getIronSession(req, new NextResponse(), sessionOptions) as IronSession;
    if (!session.user) {
      return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
    }

    // Get policies to check if daily reward is enabled
    const policiesResponse = await fetch(`${req.nextUrl.origin}/api/policies`);
    const policiesData = await policiesResponse.json();
    
    if (!policiesData.ok || !policiesData.policies.dailyReward.enabled) {
      return NextResponse.json({ ok: false, error: 'disabled' });
    }

    const { amount } = policiesData.policies.dailyReward;
    
    // Get today's UTC date start (00:00:00.000Z)
    const now = new Date();
    const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    
    // Check if user has already claimed today
    const existingClaim = await prisma.dailyRewardClaim.findUnique({
      where: {
        userId_claimDate: {
          userId: session.user.id,
          claimDate: todayUTC
        }
      }
    });

    if (existingClaim) {
      return NextResponse.json({ ok: false, error: 'already_claimed_today' });
    }

    // Create the claim and update user balance in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create the daily reward claim
      const claim = await tx.dailyRewardClaim.create({
        data: {
          userId: session.user!.id,
          amount,
          claimDate: todayUTC,
          claimedAt: now
        }
      });

      // Update user balance
      await tx.user.update({
        where: { id: session.user!.id },
        data: {
          balance: {
            increment: amount
          }
        }
      });

      return claim;
    });

    // Calculate next reset time
    const nextReset = new Date(todayUTC);
    nextReset.setUTCDate(nextReset.getUTCDate() + 1);

    return NextResponse.json({
      ok: true,
      amount: result.amount,
      claimedAt: result.claimedAt.toISOString(),
      resetAt: nextReset.toISOString()
    });

  } catch (error) {
    console.error('Error claiming daily reward:', error);
    
    // Handle unique constraint violation (P2002)
    if (error instanceof Error && error.message.includes('P2002')) {
      return NextResponse.json({ ok: false, error: 'already_claimed_today' });
    }
    
    return NextResponse.json(
      { ok: false, error: 'Failed to claim daily reward' },
      { status: 500 }
    );
  }
}
