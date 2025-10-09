import { Decimal } from '@prisma/client/runtime/library';
import { prisma } from '@/lib/prisma';
import { ReferralTierService } from '@/lib/referralTierService';
import { getPolicies } from '@/lib/policies';

/**
 * حساب المكافأة اليومية بناءً على الرصيد ونسبة الأرباح الشهرية للمستخدم
 * المكافأة اليومية = (الرصيد × نسبة الأرباح الشهرية) ÷ 30 يوم
 */
export class DailyRewardCalculator {
  /**
   * حساب نسبة الأرباح الشهرية للمستخدم بناءً على مستوى الدعوات
   */
  static async getUserMonthlyRate(userId: string): Promise<number> {
    // الحصول على إحصائيات الدعوات للمستخدم
    const referralStats = await prisma.referralStats.findUnique({
      where: { userId }
    });

    const confirmedInviteCount = referralStats?.invitedCount || 0;
    const tier = ReferralTierService.calculateTier(confirmedInviteCount);
    
    const { monthlyRates } = getPolicies();
    
    // تحديد نسبة الأرباح حسب المستوى
    switch (tier) {
      case 3: // 10+ دعوات مؤكدة
        return monthlyRates.tier2Rate; // 35%
      case 2: // 5+ دعوات مؤكدة
        return monthlyRates.tier1Rate; // 30%
      default: // المستوى الأساسي
        return monthlyRates.baseRate; // 25%
    }
  }

  /**
   * حساب المكافأة اليومية المتاحة للمستخدم
   * @param userId معرف المستخدم
   * @returns المكافأة اليومية بالدولار
   */
  static async calculateDailyReward(userId: string): Promise<{
    amount: Decimal;
    monthlyRate: number;
    tier: number;
    baseBalance: Decimal;
  }> {
    // الحصول على بيانات المستخدم
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        balance: true,
        deposits: {
          where: { status: 'APPROVED' },
          select: { amount: true }
        }
      }
    });

    if (!user) {
      throw new Error('User not found');
    }

    // حساب الرصيد الأساسي (مجموع الإيداعات المقبولة)
    const baseBalance = user.deposits.reduce(
      (sum, deposit) => sum.plus(deposit.amount),
      new Decimal(0)
    );

    // الحصول على نسبة الأرباح الشهرية للمستخدم
    const monthlyRate = await this.getUserMonthlyRate(userId);
    
    // حساب المكافأة اليومية
    // المكافأة اليومية = (الرصيد الأساسي × نسبة الأرباح الشهرية) ÷ 30
    const dailyRewardAmount = baseBalance
      .mul(monthlyRate)
      .div(100)
      .div(30);

    // الحصول على المستوى الحالي
    const referralStats = await prisma.referralStats.findUnique({
      where: { userId }
    });
    const confirmedInviteCount = referralStats?.invitedCount || 0;
    const tier = ReferralTierService.calculateTier(confirmedInviteCount);

    return {
      amount: dailyRewardAmount,
      monthlyRate,
      tier,
      baseBalance
    };
  }

  /**
   * التحقق من إمكانية المطالبة بالمكافأة اليومية
   * @param userId معرف المستخدم
   * @returns معلومات حالة المطالبة
   */
  static async checkClaimEligibility(userId: string): Promise<{
    canClaim: boolean;
    amount: Decimal;
    monthlyRate: number;
    tier: number;
    baseBalance: Decimal;
    lastClaimDate?: Date;
    reason?: string;
  }> {
    const now = new Date();
    const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

    // التحقق من وجود مطالبة اليوم
    const existingClaim = await prisma.dailyRewardClaim.findUnique({
      where: {
        userId_claimDate: {
          userId,
          claimDate: todayUTC
        }
      }
    });

    if (existingClaim) {
      return {
        canClaim: false,
        amount: new Decimal(0),
        monthlyRate: 0,
        tier: 0,
        baseBalance: new Decimal(0),
        lastClaimDate: existingClaim.claimedAt,
        reason: 'already_claimed_today'
      };
    }

    // حساب المكافأة اليومية
    const rewardData = await this.calculateDailyReward(userId);

    // التحقق من وجود رصيد أساسي
    if (rewardData.baseBalance.lte(0)) {
      return {
        canClaim: false,
        amount: new Decimal(0),
        monthlyRate: rewardData.monthlyRate,
        tier: rewardData.tier,
        baseBalance: rewardData.baseBalance,
        reason: 'no_base_balance'
      };
    }

    return {
      canClaim: true,
      amount: rewardData.amount,
      monthlyRate: rewardData.monthlyRate,
      tier: rewardData.tier,
      baseBalance: rewardData.baseBalance
    };
  }
}
