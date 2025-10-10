import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions, type IronSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { Decimal } from '@prisma/client/runtime/library';

export async function GET(req: NextRequest) {
  const session = await getIronSession(req, new NextResponse(), sessionOptions) as IronSession;
  if (!session.user) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const period = searchParams.get('period') || '30d';

    // Calculate date range based on period
    const now = new Date();
    let startDate: Date;
    
    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Fetch deposits
    const deposits = await prisma.deposit.findMany({
      where: {
        userId: session.user.id,
        createdAt: { gte: startDate },
        status: 'APPROVED'
      },
      select: {
        amount: true,
        createdAt: true,
        rewardAmount: true
      }
    });

    // Fetch withdrawals
    const withdrawals = await prisma.withdrawal.findMany({
      where: {
        userId: session.user.id,
        createdAt: { gte: startDate },
        status: 'APPROVED'
      },
      select: {
        amount: true,
        createdAt: true
      }
    });

    // Fetch daily rewards
    const dailyRewards = await prisma.dailyRewardClaim.findMany({
      where: {
        userId: session.user.id,
        claimedAt: { gte: startDate }
      },
      select: {
        amount: true,
        claimedAt: true
      }
    });

    // Fetch random rewards
    const randomRewards = await prisma.randomRewardClaim.findMany({
      where: {
        userId: session.user.id,
        claimedAt: { gte: startDate }
      },
      select: {
        amount: true,
        claimedAt: true
      }
    });

    // Calculate totals
    const totalDeposits = deposits.reduce((sum, deposit) => sum + Number(deposit.amount), 0);
    const totalWithdrawals = withdrawals.reduce((sum, withdrawal) => sum + Number(withdrawal.amount), 0);
    const totalDepositRewards = deposits.reduce((sum, deposit) => sum + Number(deposit.rewardAmount || 0), 0);
    const totalDailyRewards = dailyRewards.reduce((sum, reward) => sum + Number(reward.amount), 0);
    const totalRandomRewards = randomRewards.reduce((sum, reward) => sum + Number(reward.amount), 0);
    const totalRewards = totalDepositRewards + totalDailyRewards + totalRandomRewards;
    const netProfit = totalRewards - totalWithdrawals;

    // Generate monthly data
    const monthlyData = generateMonthlyData(deposits, withdrawals, dailyRewards, randomRewards, startDate);

    // Generate daily data
    const dailyData = generateDailyData(deposits, withdrawals, dailyRewards, randomRewards, startDate);

    const report = {
      totalDeposits,
      totalWithdrawals,
      totalRewards,
      netProfit,
      monthlyData,
      dailyData
    };

    return NextResponse.json({ ok: true, report });
  } catch (error) {
    console.error('Financial report error:', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to generate financial report' },
      { status: 500 }
    );
  }
}

interface DepositData {
  amount: number | Decimal;
  rewardAmount?: number | Decimal;
  createdAt: Date;
}

interface WithdrawalData {
  amount: number | Decimal;
  createdAt: Date;
}

interface RewardData {
  amount: number | Decimal;
  createdAt?: Date;
  claimedAt?: Date;
}

function generateMonthlyData(
  deposits: DepositData[],
  withdrawals: WithdrawalData[],
  dailyRewards: RewardData[],
  randomRewards: RewardData[],
  startDate: Date
) {
  const monthlyMap = new Map<string, {
    deposits: number;
    withdrawals: number;
    rewards: number;
    profit: number;
  }>();

  // Initialize months
  const currentDate = new Date(startDate);
  while (currentDate <= new Date()) {
    const monthKey = currentDate.toISOString().substring(0, 7); // YYYY-MM
    monthlyMap.set(monthKey, {
      deposits: 0,
      withdrawals: 0,
      rewards: 0,
      profit: 0
    });
    currentDate.setMonth(currentDate.getMonth() + 1);
  }

  // Process deposits
  deposits.forEach(deposit => {
    const monthKey = deposit.createdAt.toISOString().substring(0, 7);
    const monthData = monthlyMap.get(monthKey);
    if (monthData) {
      const amount = typeof deposit.amount === 'object' && deposit.amount !== null && 'toNumber' in deposit.amount
        ? deposit.amount.toNumber()
        : Number(deposit.amount);
      const rewardAmount = typeof deposit.rewardAmount === 'object' && deposit.rewardAmount !== null && 'toNumber' in deposit.rewardAmount
        ? deposit.rewardAmount.toNumber()
        : Number(deposit.rewardAmount) || 0;
      monthData.deposits += amount;
      monthData.rewards += rewardAmount;
    }
  });

  // Process withdrawals
  withdrawals.forEach(withdrawal => {
    const monthKey = withdrawal.createdAt.toISOString().substring(0, 7);
    const monthData = monthlyMap.get(monthKey);
    if (monthData) {
      const amount = typeof withdrawal.amount === 'object' && withdrawal.amount !== null && 'toNumber' in withdrawal.amount
        ? withdrawal.amount.toNumber()
        : Number(withdrawal.amount);
      monthData.withdrawals += amount;
    }
  });

  // Process daily rewards
  dailyRewards.forEach(reward => {
    if (reward.claimedAt && typeof reward.claimedAt.toISOString === 'function') {
      const monthKey = reward.claimedAt.toISOString().substring(0, 7);
      const monthData = monthlyMap.get(monthKey);
      if (monthData) {
        const amount = typeof reward.amount === 'object' && reward.amount !== null && 'toNumber' in reward.amount
          ? reward.amount.toNumber()
          : Number(reward.amount);
        monthData.rewards += amount;
      }
    }
  });

  // Process random rewards
  randomRewards.forEach(reward => {
    if (reward.claimedAt && typeof reward.claimedAt.toISOString === 'function') {
      const monthKey = reward.claimedAt.toISOString().substring(0, 7);
      const monthData = monthlyMap.get(monthKey);
      if (monthData) {
        const amount = typeof reward.amount === 'object' && reward.amount !== null && 'toNumber' in reward.amount
          ? reward.amount.toNumber()
          : Number(reward.amount);
        monthData.rewards += amount;
      }
    }
  });

  // Calculate profits
  monthlyMap.forEach(monthData => {
    monthData.profit = monthData.rewards - monthData.withdrawals;
  });

  return Array.from(monthlyMap.entries()).map(([month, data]) => ({
    month: formatMonthName(month),
    ...data
  }));
}

function generateDailyData(
  deposits: DepositData[],
  withdrawals: WithdrawalData[],
  dailyRewards: RewardData[],
  randomRewards: RewardData[],
  startDate: Date
) {
  const dailyMap = new Map<string, {
    deposits: number;
    withdrawals: number;
    rewards: number;
    profit: number;
  }>();

  // Initialize days
  const currentDate = new Date(startDate);
  while (currentDate <= new Date()) {
    const dayKey = currentDate.toISOString().substring(0, 10); // YYYY-MM-DD
    dailyMap.set(dayKey, {
      deposits: 0,
      withdrawals: 0,
      rewards: 0,
      profit: 0
    });
    currentDate.setDate(currentDate.getDate() + 1);
  }

  // Process deposits
  deposits.forEach(deposit => {
    const dayKey = deposit.createdAt.toISOString().substring(0, 10);
    const dayData = dailyMap.get(dayKey);
    if (dayData) {
      const amount = typeof deposit.amount === 'object' && deposit.amount !== null && 'toNumber' in deposit.amount
        ? deposit.amount.toNumber()
        : Number(deposit.amount);
      const rewardAmount = typeof deposit.rewardAmount === 'object' && deposit.rewardAmount !== null && 'toNumber' in deposit.rewardAmount
        ? deposit.rewardAmount.toNumber()
        : Number(deposit.rewardAmount) || 0;
      dayData.deposits += amount;
      dayData.rewards += rewardAmount;
    }
  });

  // Process withdrawals
  withdrawals.forEach(withdrawal => {
    const dayKey = withdrawal.createdAt.toISOString().substring(0, 10);
    const dayData = dailyMap.get(dayKey);
    if (dayData) {
      const amount = typeof withdrawal.amount === 'object' && withdrawal.amount !== null && 'toNumber' in withdrawal.amount
        ? withdrawal.amount.toNumber()
        : Number(withdrawal.amount);
      dayData.withdrawals += amount;
    }
  });

  // Process daily rewards
  dailyRewards.forEach(reward => {
    if (reward.claimedAt && typeof reward.claimedAt.toISOString === 'function') {
      const dayKey = reward.claimedAt.toISOString().substring(0, 10);
      const dayData = dailyMap.get(dayKey);
      if (dayData) {
        const amount = typeof reward.amount === 'object' && reward.amount !== null && 'toNumber' in reward.amount
          ? reward.amount.toNumber()
          : Number(reward.amount);
        dayData.rewards += amount;
      }
    }
  });

  // Process random rewards
  randomRewards.forEach(reward => {
    if (reward.claimedAt && typeof reward.claimedAt.toISOString === 'function') {
      const dayKey = reward.claimedAt.toISOString().substring(0, 10);
      const dayData = dailyMap.get(dayKey);
      if (dayData) {
        const amount = typeof reward.amount === 'object' && reward.amount !== null && 'toNumber' in reward.amount
          ? reward.amount.toNumber()
          : Number(reward.amount);
        dayData.rewards += amount;
      }
    }
  });

  // Calculate profits
  dailyMap.forEach(dayData => {
    dayData.profit = dayData.rewards - dayData.withdrawals;
  });

  return Array.from(dailyMap.entries()).map(([date, data]) => ({
    date: formatDate(date),
    ...data
  }));
}

function formatMonthName(monthKey: string): string {
  const [year, month] = monthKey.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
}

function formatDate(dateKey: string): string {
  const date = new Date(dateKey);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
