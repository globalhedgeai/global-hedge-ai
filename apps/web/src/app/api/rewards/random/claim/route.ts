import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions, type IronSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { calculateRandomRewardEligibility, getUTCDateKey } from '@/lib/randomRewardUtils';
import { getPolicies } from '@/lib/policies';

export async function POST(req: NextRequest) {
  try {
    const session = await getIronSession(req, new NextResponse(), sessionOptions) as IronSession;
    if (!session.user) {
      return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
    }

    // Get policies to check if random reward is enabled
    const { randomReward } = getPolicies();
    
    if (!randomReward.enabled) {
      return NextResponse.json({ ok: false, error: 'disabled' });
    }

    const { winRate, minAmount, maxAmount } = randomReward;
    
    // Get today's UTC date key
    const now = new Date();
    const dateKey = getUTCDateKey(now);
    
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
      return NextResponse.json({ ok: false, error: 'already_claimed_today' });
    }

    // Calculate eligibility for today
    const { eligible, amount } = calculateRandomRewardEligibility(
      session.user.id,
      dateKey,
      winRate,
      minAmount,
      maxAmount
    );

    if (!eligible) {
      return NextResponse.json({ ok: false, error: 'not_eligible' });
    }

    // Create the claim and update user balance in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create the random reward claim
      const claim = await tx.randomRewardClaim.create({
        data: {
          userId: session.user!.id,
          amount,
          claimDate: dateKey,
          claimedAt: now,
          status: 'claimed'
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
    const nextReset = new Date(now);
    nextReset.setUTCDate(nextReset.getUTCDate() + 1);
    nextReset.setUTCHours(0, 0, 0, 0);

    return NextResponse.json({
      ok: true,
      amount: result.amount.toNumber(),
      claimedAt: result.claimedAt.toISOString(),
      resetAt: nextReset.toISOString()
    });

  } catch (error) {
    console.error('Error claiming random reward:', error);
    
    // Handle unique constraint violation (P2002)
    if (error instanceof Error && error.message.includes('P2002')) {
      return NextResponse.json({ ok: false, error: 'already_claimed_today' });
    }
    
    return NextResponse.json(
      { ok: false, error: 'Failed to claim random reward' },
      { status: 500 }
    );
  }
}
