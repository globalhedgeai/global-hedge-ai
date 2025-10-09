import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions, type IronSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { getPolicies } from '@/lib/policies';
import { DailyRewardCalculator } from '@/lib/dailyRewardCalculator';

export async function POST(req: NextRequest) {
  try {
    const session = await getIronSession(req, new NextResponse(), sessionOptions) as IronSession;
    if (!session.user) {
      return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
    }

    // Get policies to check if daily reward is enabled
    const { dailyReward } = getPolicies();
    
    if (!dailyReward.enabled) {
      return NextResponse.json({ ok: false, error: 'disabled' });
    }

    // التحقق من إمكانية المطالبة وحساب المكافأة
    const eligibility = await DailyRewardCalculator.checkClaimEligibility(session.user.id);
    
    if (!eligibility.canClaim) {
      return NextResponse.json({ 
        ok: false, 
        error: eligibility.reason || 'cannot_claim',
        details: {
          monthlyRate: eligibility.monthlyRate,
          tier: eligibility.tier,
          baseBalance: eligibility.baseBalance.toNumber(),
          lastClaimDate: eligibility.lastClaimDate?.toISOString()
        }
      });
    }

    // Get today's UTC date start (00:00:00.000Z)
    const now = new Date();
    const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    
    // Create the claim and update user balance in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create the daily reward claim
      const claim = await tx.dailyRewardClaim.create({
        data: {
          userId: session.user!.id,
          amount: eligibility.amount,
          claimDate: todayUTC,
          claimedAt: now,
          meta: {
            monthlyRate: eligibility.monthlyRate,
            tier: eligibility.tier,
            baseBalance: eligibility.baseBalance.toNumber(),
            calculatedAt: now.toISOString()
          }
        }
      });

      // Update user balance
      await tx.user.update({
        where: { id: session.user!.id },
        data: {
          balance: {
            increment: eligibility.amount
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
      amount: result.amount.toNumber(),
      claimedAt: result.claimedAt.toISOString(),
      resetAt: nextReset.toISOString(),
      details: {
        monthlyRate: eligibility.monthlyRate,
        tier: eligibility.tier,
        baseBalance: eligibility.baseBalance.toNumber(),
        dailyRate: (eligibility.monthlyRate / 30).toFixed(4) + '%'
      }
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
