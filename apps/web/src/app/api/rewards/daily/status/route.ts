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

    // Get policies to check if daily reward is enabled
    const policiesResponse = await fetch(`${req.nextUrl.origin}/api/policies`);
    const policiesData = await policiesResponse.json();
    
    if (!policiesData.ok || !policiesData.policies.dailyReward.enabled) {
      return NextResponse.json({
        ok: true,
        canClaim: false,
        amount: 0,
        secondsToReset: 0,
        resetAt: '',
        meta: { reason: 'disabled' }
      });
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

    // Calculate next reset time (next UTC midnight)
    const nextReset = new Date(todayUTC);
    nextReset.setUTCDate(nextReset.getUTCDate() + 1);
    
    const secondsToReset = Math.max(0, Math.floor((nextReset.getTime() - now.getTime()) / 1000));

    return NextResponse.json({
      ok: true,
      canClaim: !existingClaim,
      amount,
      lastClaimAt: existingClaim?.claimedAt.toISOString(),
      secondsToReset,
      resetAt: nextReset.toISOString()
    });

  } catch (error) {
    console.error('Error fetching daily reward status:', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to fetch daily reward status' },
      { status: 500 }
    );
  }
}
