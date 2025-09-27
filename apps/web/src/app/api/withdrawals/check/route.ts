import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions, type IronSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const session = await getIronSession(req, new NextResponse(), sessionOptions) as IronSession;
  if (!session.user) return NextResponse.json({ ok: false }, { status: 401 });

  try {
    // Check if user has any effective deposits
    const firstEffectiveDeposit = await prisma.deposit.findFirst({
      where: {
        userId: session.user.id,
        status: 'APPROVED',
        effectiveAt: { not: null }
      },
      orderBy: { effectiveAt: 'asc' }
    });

    if (!firstEffectiveDeposit) {
      return NextResponse.json({
        ok: true,
        info: {
          isLocked: true,
          unlockDate: null,
          daysSinceLastWithdrawal: null,
          feePct: null,
          feeAmount: null,
          netAmount: null,
          appliedRule: null
        }
      });
    }

    // Check 45-day rule
    const now = new Date();
    const daysSinceFirstDeposit = Math.floor(
      (now.getTime() - firstEffectiveDeposit.effectiveAt!.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceFirstDeposit < 45) {
      const unlockDate = new Date(firstEffectiveDeposit.effectiveAt!.getTime() + (45 * 24 * 60 * 60 * 1000));
      return NextResponse.json({
        ok: true,
        info: {
          isLocked: true,
          unlockDate: unlockDate.toISOString(),
          daysSinceLastWithdrawal: null,
          feePct: null,
          feeAmount: null,
          netAmount: null,
          appliedRule: null
        }
      });
    }

    // Get last approved withdrawal
    const lastWithdrawal = await prisma.withdrawal.findFirst({
      where: {
        userId: session.user.id,
        status: 'APPROVED',
        effectiveAt: { not: null }
      },
      orderBy: { effectiveAt: 'desc' }
    });

    // Calculate fee based on policies
    const policies = {
      firstWithdrawMinDays: 45,
      weeklyFeePct: 7,
      monthlyFeePct: 3,
      monthlyThresholdDays: 30
    };

    let feePct = 0;
    let appliedRule = '';
    let daysSinceLastWithdrawal = null;

    if (!lastWithdrawal) {
      // First withdrawal after 45 days - use monthly rate (3%)
      feePct = policies.monthlyFeePct;
      appliedRule = 'MONTHLY_3PCT';
    } else {
      // Calculate days since last withdrawal
      daysSinceLastWithdrawal = Math.floor(
        (now.getTime() - lastWithdrawal.effectiveAt!.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysSinceLastWithdrawal >= policies.monthlyThresholdDays) {
        feePct = policies.monthlyFeePct;
        appliedRule = 'MONTHLY_3PCT';
      } else {
        feePct = policies.weeklyFeePct;
        appliedRule = 'WEEKLY_7PCT';
      }
    }

    return NextResponse.json({
      ok: true,
      info: {
        isLocked: false,
        unlockDate: null,
        daysSinceLastWithdrawal,
        feePct,
        appliedRule
      }
    });
  } catch (error) {
    console.error('Error checking withdrawal status:', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to check withdrawal status' },
      { status: 500 }
    );
  }
}
