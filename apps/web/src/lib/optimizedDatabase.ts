import { prisma } from '@/lib/prisma';
import cacheService, { cacheKeys } from '@/lib/cache';

export class OptimizedDatabaseService {
  /**
   * Get user with optimized query and caching
   */
  static async getUser(id: string) {
    const cacheKey = cacheKeys.user(id);
    
    // Try cache first
    const cachedUser = await cacheService.get(cacheKey);
    if (cachedUser) {
      return cachedUser;
    }
    
    // Fetch from database with optimized query
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        role: true,
        balance: true,
        referralCode: true,
        walletAddress: true,
        createdAt: true,
        firstDepositAt: true,
        lastWithdrawalAt: true,
        invitedById: true,
      },
    });
    
    if (user) {
      // Cache for 5 minutes
      await cacheService.set(cacheKey, user, 300);
    }
    
    return user;
  }

  /**
   * Get user balance with caching
   */
  static async getUserBalance(id: string) {
    const cacheKey = cacheKeys.userBalance(id);
    
    // Try cache first
    const cachedBalance = await cacheService.get(cacheKey);
    if (cachedBalance !== null) {
      return cachedBalance;
    }
    
    // Fetch from database
    const user = await prisma.user.findUnique({
      where: { id },
      select: { balance: true },
    });
    
    const balance = user?.balance || 0;
    
    // Cache for 1 minute
    await cacheService.set(cacheKey, balance, 60);
    
    return balance;
  }

  /**
   * Get user deposits with pagination and caching
   */
  static async getUserDeposits(
    userId: string,
    page: number = 1,
    limit: number = 20
  ) {
    const cacheKey = `${cacheKeys.userDeposits(userId)}:${page}:${limit}`;
    
    // Try cache first
    const cachedDeposits = await cacheService.get(cacheKey);
    if (cachedDeposits) {
      return cachedDeposits;
    }
    
    // Fetch from database with optimized query
    const [deposits, total] = await Promise.all([
      prisma.deposit.findMany({
        where: { userId },
        select: {
          id: true,
          amount: true,
          cryptocurrency: true,
          status: true,
          txId: true,
          proofImageUrl: true,
          rewardAmount: true,
          createdAt: true,
          effectiveAt: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.deposit.count({ where: { userId } }),
    ]);
    
    const result = {
      deposits,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
    
    // Cache for 2 minutes
    await cacheService.set(cacheKey, result, 120);
    
    return result;
  }

  /**
   * Get user withdrawals with pagination and caching
   */
  static async getUserWithdrawals(
    userId: string,
    page: number = 1,
    limit: number = 20
  ) {
    const cacheKey = `${cacheKeys.userWithdrawals(userId)}:${page}:${limit}`;
    
    // Try cache first
    const cachedWithdrawals = await cacheService.get(cacheKey);
    if (cachedWithdrawals) {
      return cachedWithdrawals;
    }
    
    // Fetch from database with optimized query
    const [withdrawals, total] = await Promise.all([
      prisma.withdrawal.findMany({
        where: { userId },
        select: {
          id: true,
          amount: true,
          cryptocurrency: true,
          status: true,
          toAddress: true,
          txId: true,
          feeAmount: true,
          netAmount: true,
          createdAt: true,
          effectiveAt: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.withdrawal.count({ where: { userId } }),
    ]);
    
    const result = {
      withdrawals,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
    
    // Cache for 2 minutes
    await cacheService.set(cacheKey, result, 120);
    
    return result;
  }

  /**
   * Get daily reward status with caching
   */
  static async getDailyRewardStatus(userId: string, date: string) {
    const cacheKey = cacheKeys.dailyReward(userId, date);
    
    // Try cache first
    const cachedReward = await cacheService.get(cacheKey);
    if (cachedReward !== null) {
      return cachedReward;
    }
    
    // Fetch from database
    const reward = await prisma.dailyRewardClaim.findUnique({
      where: {
        userId_claimDate: {
          userId,
          claimDate: new Date(date),
        },
      },
      select: {
        amount: true,
        claimedAt: true,
      },
    });
    
    const result = reward ? {
      claimed: true,
      amount: reward.amount,
      claimedAt: reward.claimedAt,
    } : {
      claimed: false,
      amount: 0,
      claimedAt: null,
    };
    
    // Cache for 5 minutes
    await cacheService.set(cacheKey, result, 300);
    
    return result;
  }

  /**
   * Get random reward status with caching
   */
  static async getRandomRewardStatus(userId: string, date: string) {
    const cacheKey = cacheKeys.randomReward(userId, date);
    
    // Try cache first
    const cachedReward = await cacheService.get(cacheKey);
    if (cachedReward !== null) {
      return cachedReward;
    }
    
    // Fetch from database
    const reward = await prisma.randomRewardClaim.findUnique({
      where: {
        userId_claimDate: {
          userId,
          claimDate: date,
        },
      },
      select: {
        amount: true,
        claimedAt: true,
      },
    });
    
    const result = reward ? {
      claimed: true,
      amount: reward.amount,
      claimedAt: reward.claimedAt,
    } : {
      claimed: false,
      amount: 0,
      claimedAt: null,
    };
    
    // Cache for 5 minutes
    await cacheService.set(cacheKey, result, 300);
    
    return result;
  }

  /**
   * Get referral stats with caching
   */
  static async getReferralStats(userId: string) {
    const cacheKey = cacheKeys.referralStats(userId);
    
    // Try cache first
    const cachedStats = await cacheService.get(cacheKey);
    if (cachedStats) {
      return cachedStats;
    }
    
    // Fetch from database
    const stats = await prisma.referralStats.findUnique({
      where: { userId },
      select: {
        invitedCount: true,
        tier: true,
        updatedAt: true,
      },
    });
    
    const result = stats || {
      invitedCount: 0,
      tier: 1,
      updatedAt: new Date(),
    };
    
    // Cache for 10 minutes
    await cacheService.set(cacheKey, result, 600);
    
    return result;
  }

  /**
   * Get all policies with caching
   */
  static async getPolicies() {
    const cacheKey = cacheKeys.policies();
    
    // Try cache first
    const cachedPolicies = await cacheService.get(cacheKey);
    if (cachedPolicies) {
      return cachedPolicies;
    }
    
    // Fetch from database
    const policies = await prisma.policy.findMany({
      select: {
        key: true,
        value: true,
        createdAt: true,
      },
      orderBy: { key: 'asc' },
    });
    
    // Cache for 30 minutes
    await cacheService.set(cacheKey, policies, 1800);
    
    return policies;
  }

  /**
   * Get performance metrics with caching
   */
  static async getPerformanceMetrics(period: string) {
    const cacheKey = cacheKeys.performanceMetrics(period);
    
    // Try cache first
    const cachedMetrics = await cacheService.get(cacheKey);
    if (cachedMetrics) {
      return cachedMetrics;
    }
    
    // Fetch from database (this would use the existing PerformanceMonitoringService)
    // For now, return null to indicate cache miss
    return null;
  }

  /**
   * Invalidate user-related cache
   */
  static async invalidateUserCache(userId: string) {
    const keys = [
      cacheKeys.user(userId),
      cacheKeys.userBalance(userId),
      cacheKeys.userDeposits(userId),
      cacheKeys.userWithdrawals(userId),
      cacheKeys.referralStats(userId),
    ];
    
    // Delete all user-related cache entries
    await Promise.all(keys.map(key => cacheService.delete(key)));
  }

  /**
   * Invalidate all cache
   */
  static async invalidateAllCache() {
    await cacheService.clear();
  }

  /**
   * Get cache statistics
   */
  static async getCacheStats() {
    return await cacheService.getStats();
  }
}
