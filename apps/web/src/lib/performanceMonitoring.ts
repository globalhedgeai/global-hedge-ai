import { prisma } from '@/lib/prisma';
import { Decimal } from '@prisma/client/runtime/library';

export interface PerformanceMetrics {
  // User Metrics
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;
  
  // Financial Metrics
  totalDeposits: number;
  totalWithdrawals: number;
  totalRewards: number;
  netProfit: number;
  averageDepositAmount: number;
  averageWithdrawalAmount: number;
  
  // Transaction Metrics
  pendingDeposits: number;
  approvedDeposits: number;
  rejectedDeposits: number;
  pendingWithdrawals: number;
  approvedWithdrawals: number;
  rejectedWithdrawals: number;
  
  // Reward Metrics
  dailyRewardsClaimed: number;
  randomRewardsClaimed: number;
  totalRewardsToday: number;
  totalRewardsThisWeek: number;
  totalRewardsThisMonth: number;
  
  // Referral Metrics
  totalReferrals: number;
  activeReferrers: number;
  tier1Users: number;
  tier2Users: number;
  tier3Users: number;
  
  // System Health
  averageResponseTime: number;
  errorRate: number;
  uptime: number;
  
  // Timestamps
  lastUpdated: Date;
  period: 'today' | 'week' | 'month' | 'all';
}

export class PerformanceMonitoringService {
  /**
   * Get comprehensive performance metrics
   */
  static async getMetrics(period: 'today' | 'week' | 'month' | 'all' = 'all'): Promise<PerformanceMetrics> {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // User Metrics
    const totalUsers = await prisma.user.count();
    const activeUsers = await prisma.user.count({
      where: {
        OR: [
          { deposits: { some: { status: 'APPROVED' } } },
          { withdrawals: { some: { status: 'APPROVED' } } },
          { claims: { some: {} } },
          { randomRewardClaims: { some: {} } }
        ]
      }
    });

    const newUsersToday = await prisma.user.count({
      where: { createdAt: { gte: startOfDay } }
    });

    const newUsersThisWeek = await prisma.user.count({
      where: { createdAt: { gte: startOfWeek } }
    });

    const newUsersThisMonth = await prisma.user.count({
      where: { createdAt: { gte: startOfMonth } }
    });

    // Financial Metrics
    const deposits = await prisma.deposit.findMany({
      where: period === 'today' ? { createdAt: { gte: startOfDay } } :     
             period === 'week' ? { createdAt: { gte: startOfWeek } } :     
             period === 'month' ? { createdAt: { gte: startOfMonth } } : {},
      select: { amount: true, status: true, rewardAmount: true }
    });

    const withdrawals = await prisma.withdrawal.findMany({
      where: period === 'today' ? { createdAt: { gte: startOfDay } } :     
             period === 'week' ? { createdAt: { gte: startOfWeek } } :     
             period === 'month' ? { createdAt: { gte: startOfMonth } } : {},
      select: { amount: true, status: true }
    });

    const totalDeposits = deposits.reduce((sum, d) => sum + Number(d.amount), 0);
    const totalWithdrawals = withdrawals.reduce((sum, w) => sum + Number(w.amount), 0);
    const totalRewards = deposits.reduce((sum, d) => sum + Number(d.rewardAmount || 0), 0);
    const netProfit = totalRewards - totalWithdrawals;

    const approvedDeposits = deposits.filter(d => d.status === 'APPROVED');
    const averageDepositAmount = approvedDeposits.length > 0 
      ? approvedDeposits.reduce((sum, d) => sum + Number(d.amount), 0) / approvedDeposits.length 
      : 0;

    const approvedWithdrawals = withdrawals.filter(w => w.status === 'APPROVED');
    const averageWithdrawalAmount = approvedWithdrawals.length > 0 
      ? approvedWithdrawals.reduce((sum, w) => sum + Number(w.amount), 0) / approvedWithdrawals.length 
      : 0;

    // Transaction Metrics
    const pendingDeposits = deposits.filter(d => d.status === 'PENDING').length;
    const approvedDepositsCount = deposits.filter(d => d.status === 'APPROVED').length;
    const rejectedDeposits = deposits.filter(d => d.status === 'REJECTED').length;
    
    const pendingWithdrawals = withdrawals.filter(w => w.status === 'PENDING').length;
    const approvedWithdrawalsCount = withdrawals.filter(w => w.status === 'APPROVED').length;
    const rejectedWithdrawals = withdrawals.filter(w => w.status === 'REJECTED').length;

    // Reward Metrics
    const dailyRewards = await prisma.dailyRewardClaim.findMany({
      where: period === 'today' ? { claimedAt: { gte: startOfDay } } :     
             period === 'week' ? { claimedAt: { gte: startOfWeek } } :     
             period === 'month' ? { claimedAt: { gte: startOfMonth } } : {},
      select: { amount: true }
    });

    const randomRewards = await prisma.randomRewardClaim.findMany({
      where: period === 'today' ? { claimedAt: { gte: startOfDay } } :     
             period === 'week' ? { claimedAt: { gte: startOfWeek } } :     
             period === 'month' ? { claimedAt: { gte: startOfMonth } } : {},
      select: { amount: true }
    });

    const dailyRewardsClaimed = dailyRewards.length;
    const randomRewardsClaimed = randomRewards.length;
    const totalRewardsToday = dailyRewards.reduce((sum, r) => sum + Number(r.amount), 0) +
                             randomRewards.reduce((sum, r) => sum + Number(r.amount), 0);

    // Referral Metrics
    const referralStats = await prisma.referralStats.findMany();
    const totalReferrals = referralStats.reduce((sum, s) => sum + s.invitedCount, 0);
    const activeReferrers = referralStats.filter(s => s.invitedCount > 0).length;
    const tier1Users = referralStats.filter(s => s.tier === 1).length;
    const tier2Users = referralStats.filter(s => s.tier === 2).length;
    const tier3Users = referralStats.filter(s => s.tier === 3).length;

    return {
      // User Metrics
      totalUsers,
      activeUsers,
      newUsersToday,
      newUsersThisWeek,
      newUsersThisMonth,
      
      // Financial Metrics
      totalDeposits,
      totalWithdrawals,
      totalRewards,
      netProfit,
      averageDepositAmount,
      averageWithdrawalAmount,
      
      // Transaction Metrics
      pendingDeposits,
      approvedDeposits: approvedDepositsCount,
      rejectedDeposits,
      pendingWithdrawals,
      approvedWithdrawals: approvedWithdrawalsCount,
      rejectedWithdrawals,
      
      // Reward Metrics
      dailyRewardsClaimed,
      randomRewardsClaimed,
      totalRewardsToday,
      totalRewardsThisWeek: 0, // Will be calculated separately
      totalRewardsThisMonth: 0, // Will be calculated separately
      
      // Referral Metrics
      totalReferrals,
      activeReferrers,
      tier1Users,
      tier2Users,
      tier3Users,
      
      // System Health (placeholder values)
      averageResponseTime: 0,
      errorRate: 0,
      uptime: 99.9,
      
      // Timestamps
      lastUpdated: new Date(),
      period
    };
  }

  /**
   * Get performance trends over time
   */
  static async getTrends(days: number = 30): Promise<{
    dates: string[];
    users: number[];
    deposits: number[];
    withdrawals: number[];
    rewards: number[];
  }> {
    const trends = {
      dates: [] as string[],
      users: [] as number[],
      deposits: [] as number[],
      withdrawals: [] as number[],
      rewards: [] as number[]
    };

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

      const dayUsers = await prisma.user.count({
        where: { createdAt: { gte: startOfDay, lt: endOfDay } }
      });

      const dayDeposits = await prisma.deposit.findMany({
        where: { 
          createdAt: { gte: startOfDay, lt: endOfDay },
          status: 'APPROVED'
        },
        select: { amount: true }
      });

      const dayWithdrawals = await prisma.withdrawal.findMany({
        where: { 
          createdAt: { gte: startOfDay, lt: endOfDay },
          status: 'APPROVED'
        },
        select: { amount: true }
      });

      const dayRewards = await prisma.dailyRewardClaim.findMany({
        where: { claimedAt: { gte: startOfDay, lt: endOfDay } },
        select: { amount: true }
      });

      trends.dates.push(date.toISOString().split('T')[0]);
      trends.users.push(dayUsers);
      trends.deposits.push(dayDeposits.reduce((sum, d) => sum + Number(d.amount), 0));
      trends.withdrawals.push(dayWithdrawals.reduce((sum, w) => sum + Number(w.amount), 0));
      trends.rewards.push(dayRewards.reduce((sum, r) => sum + Number(r.amount), 0));
    }

    return trends;
  }

  /**
   * Get top performers
   */
  static async getTopPerformers(): Promise<{
    topDepositors: Array<{ email: string; amount: number }>;
    topReferrers: Array<{ email: string; count: number; tier: number }>;
    topRewardEarners: Array<{ email: string; amount: number }>;
  }> {
    // Top Depositors
    const topDepositors = await prisma.user.findMany({
      select: {
        email: true,
        deposits: {
          where: { status: 'APPROVED' },
          select: { amount: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    const topDepositorsFormatted = topDepositors.map(user => ({
      email: user.email,
      amount: user.deposits.reduce((sum, d) => sum + Number(d.amount), 0)
    })).sort((a, b) => b.amount - a.amount).slice(0, 5);

    // Top Referrers
    const topReferrers = await prisma.referralStats.findMany({
      include: {
        user: { select: { email: true } }
      },
      orderBy: { invitedCount: 'desc' },
      take: 5
    });

    const topReferrersFormatted = topReferrers.map(stat => ({
      email: stat.user.email,
      count: stat.invitedCount,
      tier: stat.tier
    }));

    // Top Reward Earners
    const topRewardEarners = await prisma.user.findMany({
      select: {
        email: true,
        claims: { select: { amount: true } },
        randomRewardClaims: { select: { amount: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    const topRewardEarnersFormatted = topRewardEarners.map(user => ({
      email: user.email,
      amount: user.claims.reduce((sum, c) => sum + Number(c.amount), 0) +
              user.randomRewardClaims.reduce((sum, r) => sum + Number(r.amount), 0)
    })).sort((a, b) => b.amount - a.amount).slice(0, 5);

    return {
      topDepositors: topDepositorsFormatted,
      topReferrers: topReferrersFormatted,
      topRewardEarners: topRewardEarnersFormatted
    };
  }

  /**
   * Get system alerts
   */
  static async getSystemAlerts(): Promise<Array<{
    type: 'warning' | 'error' | 'info';
    message: string;
    timestamp: Date;
  }>> {
    const alerts = [];

    // Check for high pending deposits
    const pendingDeposits = await prisma.deposit.count({
      where: { status: 'PENDING' }
    });

    if (pendingDeposits > 50) {
      alerts.push({
        type: 'warning' as const,
        message: `High number of pending deposits: ${pendingDeposits}`,
        timestamp: new Date()
      });
    }

    // Check for high pending withdrawals
    const pendingWithdrawals = await prisma.withdrawal.count({
      where: { status: 'PENDING' }
    });

    if (pendingWithdrawals > 20) {
      alerts.push({
        type: 'warning' as const,
        message: `High number of pending withdrawals: ${pendingWithdrawals}`,
        timestamp: new Date()
      });
    }

    // Check for users with high balances
    const highBalanceUsers = await prisma.user.count({
      where: { balance: { gt: 10000 } }
    });

    if (highBalanceUsers > 0) {
      alerts.push({
        type: 'info' as const,
        message: `${highBalanceUsers} users have balances over $10,000`,
        timestamp: new Date()
      });
    }

    return alerts;
  }
}
