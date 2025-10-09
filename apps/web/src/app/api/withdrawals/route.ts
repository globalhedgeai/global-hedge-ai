import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions, type IronSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { withdrawSchema } from '@/lib/validators';

export async function GET(req: NextRequest) {
  const session = await getIronSession(req, new NextResponse(), sessionOptions) as IronSession;
  if (!session.user) return NextResponse.json({ ok: false }, { status: 401 });

  const items = await prisma.withdrawal.findMany({ 
    where: { userId: session.user.id }, 
    orderBy: { createdAt: 'desc' } 
  });
  return NextResponse.json({ ok: true, items });
}

export async function POST(req: NextRequest) {
  const session = await getIronSession(req, new NextResponse(), sessionOptions) as IronSession;
  if (!session.user) return NextResponse.json({ ok: false }, { status: 401 });

  let json;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 });
  }
  
  const parsed = withdrawSchema.safeParse({ ...json });
  if (!parsed.success) return NextResponse.json({ ok: false, error: 'invalid' }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user?.walletAddress) return NextResponse.json({ ok: false, error: 'no_wallet' }, { status: 400 });

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
      ok: false, 
      error: 'withdrawal_locked_until',
      unlockAt: null,
      message: 'No effective deposits found'
    }, { status: 400 });
  }

  // Check 45-day rule
  const now = new Date();
  const daysSinceFirstDeposit = Math.floor(
    (now.getTime() - firstEffectiveDeposit.effectiveAt!.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysSinceFirstDeposit < 45) {
    const unlockDate = new Date(firstEffectiveDeposit.effectiveAt!.getTime() + (45 * 24 * 60 * 60 * 1000));
    return NextResponse.json({ 
      ok: false, 
      error: 'withdrawal_locked_until',
      unlockAt: unlockDate.toISOString(),
      message: `Withdrawal locked for ${45 - daysSinceFirstDeposit} more days`
    }, { status: 400 });
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

  if (!lastWithdrawal) {
    // First withdrawal after 45 days - use monthly rate (3%)
    feePct = policies.monthlyFeePct;
    appliedRule = 'MONTHLY_3PCT';
  } else {
    // Calculate days since last withdrawal
    const daysSinceLastWithdrawal = Math.floor(
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

  // Calculate amounts
  const amount = parsed.data.amount;
  const feeAmount = (amount * feePct) / 100;
  const netAmount = amount - feeAmount;

  const created = await prisma.withdrawal.create({
    data: {
      amount,
      toAddress: parsed.data.toAddress,
      status: 'PENDING',
      feePct,
      feeAmount,
      netAmount,
      policySnapshot: JSON.stringify(policies),
      appliedRule,
      user: { connect: { id: session.user.id } },
    },
  });

  return NextResponse.json({ 
    ok: true, 
    id: created.id,
    feePct,
    feeAmount: feeAmount,
    netAmount: netAmount,
    appliedRule
  });
}