import { NextResponse } from 'next/server';

export async function GET() {
  const withdrawals = {
    firstWithdrawalAfterDays: 45,
    weeklyFeePct: 7,
    monthlyFeePct: 3,
    monthlyThresholdDays: 30,
  };

  const dailyReward = {
    enabled: true,
    amount: 1.0,
    reset: 'utc_midnight',
  };

  // Random Reward: 5% win rate daily, between $0.20 and $2.00
  const randomReward = {
    enabled: true,
    winRate: 0.05,
    minAmount: 0.20,
    maxAmount: 2.00,
    reset: 'utc_midnight',
  };

  // Legacy rewards block (keep disabled if unused)
  const rewards = {
    enabled: false,
    chancePct: 5,
    bonusPct: 2,
  };

  return NextResponse.json({
    ok: true,
    policies: {
      withdrawals,
      rewards,
      dailyReward,
      randomReward,
    }
  });
}