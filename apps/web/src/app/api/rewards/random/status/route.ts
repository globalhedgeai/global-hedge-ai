import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions, type IronSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { calculateRandomRewardEligibility, getUTCDateKey } from '@/lib/randomRewardUtils';
import { getPolicies } from '@/lib/policies';

export async function GET(req: NextRequest) {
  try {
    const session = await getIronSession(req, new NextResponse(), sessionOptions) as IronSession;
    if (!session.user) {
      return NextResponse.json({ 
        ok: true, 
        eligible: false, 
        amount: 0, 
        secondsToReset: 0, 
        resetAt: '', 
        meta: { reason: 'not_authenticated' } 
      });
    }

    // Get policies to check if random reward is enabled
    const { randomReward } = getPolicies();
    
    if (!randomReward.enabled) {
      return NextResponse.json({
        ok: true,
        eligible: false,
        amount: 0,
        secondsToReset: 0,
        resetAt: '',
        meta: { reason: 'disabled' }
      });
    }

    const { winRate, minAmount, maxAmount } = randomReward;
    
    // Get today's UTC date key
    const todayUTC = new Date();
    const dateKey = getUTCDateKey(todayUTC);
    
    // Check if user has already claimed today
    const existingClaim = await prisma.randomRewardClaim.findUnique({
      where: {
        userId_claimDate: {
          userId: session.user.id,
          claimDate: dateKey
        }
      }
    });

    if (existingClaim) {
      // Calculate next reset time (next UTC midnight)
      const nextReset = new Date(todayUTC);
      nextReset.setUTCDate(nextReset.getUTCDate() + 1);
      nextReset.setUTCHours(0, 0, 0, 0);
      
      const secondsToReset = Math.max(0, Math.floor((nextReset.getTime() - todayUTC.getTime()) / 1000));

      return NextResponse.json({
        ok: true,
        eligible: false,
        amount: existingClaim.amount.toNumber(),
        lastClaimAt: existingClaim.claimedAt.toISOString(),
        secondsToReset,
        resetAt: nextReset.toISOString(),
        meta: { reason: 'already_claimed_today' }
      });
    }

    // Calculate eligibility for today
    const { eligible, amount } = calculateRandomRewardEligibility(
      session.user.id,
      dateKey,
      winRate,
      minAmount,
      maxAmount
    );

    // Calculate next reset time (next UTC midnight)
    const nextReset = new Date(todayUTC);
    nextReset.setUTCDate(nextReset.getUTCDate() + 1);
    nextReset.setUTCHours(0, 0, 0, 0);
    
    const secondsToReset = Math.max(0, Math.floor((nextReset.getTime() - todayUTC.getTime()) / 1000));

    return NextResponse.json({
      ok: true,
      eligible,
      amount,
      lastClaimAt: null,
      secondsToReset,
      resetAt: nextReset.toISOString()
    });

  } catch (error) {
    console.error('Error fetching random reward status:', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to fetch random reward status' },
      { status: 500 }
    );
  }
}
