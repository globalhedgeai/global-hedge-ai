import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions, type IronSession } from '@/lib/session';
import { getPolicies } from '@/lib/policies';
import { DailyRewardCalculator } from '@/lib/dailyRewardCalculator';

export async function GET(req: NextRequest) {
  try {
    const session = await getIronSession(req, new NextResponse(), sessionOptions) as IronSession;
    if (!session.user) {
      return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
    }

    // Get policies to check if daily reward is enabled
    const { dailyReward } = getPolicies();
    
    if (!dailyReward.enabled) {
      return NextResponse.json({
        ok: true,
        canClaim: false,
        amount: 0,
        secondsToReset: 0,
        resetAt: '',
        meta: { reason: 'disabled' }
      });
    }

    // التحقق من إمكانية المطالبة وحساب المكافأة
    const eligibility = await DailyRewardCalculator.checkClaimEligibility(session.user.id);
    
    // Get today's UTC date start (00:00:00.000Z)
    const now = new Date();
    const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    
    // Calculate next reset time (next UTC midnight)
    const nextReset = new Date(todayUTC);
    nextReset.setUTCDate(nextReset.getUTCDate() + 1);
    
    const secondsToReset = Math.max(0, Math.floor((nextReset.getTime() - now.getTime()) / 1000));

    return NextResponse.json({
      ok: true,
      canClaim: eligibility.canClaim,
      amount: eligibility.amount.toNumber(),
      lastClaimAt: eligibility.lastClaimDate?.toISOString(),
      secondsToReset,
      resetAt: nextReset.toISOString(),
      details: {
        monthlyRate: eligibility.monthlyRate,
        tier: eligibility.tier,
        baseBalance: eligibility.baseBalance.toNumber(),
        dailyRate: (eligibility.monthlyRate / 30).toFixed(4) + '%',
        reason: eligibility.reason
      }
    });

  } catch (error) {
    console.error('Error fetching daily reward status:', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to fetch daily reward status' },
      { status: 500 }
    );
  }
}
