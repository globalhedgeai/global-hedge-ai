import { prisma } from '@/lib/prisma';

export class ReferralTierService {
  /**
   * Calculate tier based on confirmed invite count
   * Default tiers from spec:
   * - Base: 5% commission
   * - Tier 1: 7% after 5 confirmed invites
   * - Tier 2: 10% after 10 confirmed invites
   */
  static calculateTier(confirmedInviteCount: number): number {
    if (confirmedInviteCount >= 10) return 3; // 10%
    if (confirmedInviteCount >= 5) return 2;  // 7%
    return 1; // 5% base
  }

  /**
   * Get commission rate based on tier
   */
  static getCommissionRate(tier: number): number {
    switch (tier) {
      case 3: return 0.10; // 10%
      case 2: return 0.07;  // 7%
      case 1: return 0.05;  // 5%
      default: return 0.05; // 5% base
    }
  }

  /**
   * Update referral tier for a user based on their confirmed invite count
   */
  static async updateUserTier(userId: string): Promise<void> {
    // Count confirmed invites (users who have made at least one approved deposit)
    const confirmedInviteCount = await prisma.user.count({
      where: {
        invitedById: userId,
        deposits: {
          some: {
            status: 'APPROVED'
          }
        }
      }
    });

    const newTier = this.calculateTier(confirmedInviteCount);

    // Update or create referral stats
    await prisma.referralStats.upsert({
      where: { userId },
      update: {
        invitedCount: confirmedInviteCount,
        tier: newTier,
        updatedAt: new Date()
      },
      create: {
        userId,
        invitedCount: confirmedInviteCount,
        tier: newTier
      }
    });
  }

  /**
   * Handle referral tier updates when a deposit is approved
   * This should be called when a deposit status changes from PENDING to APPROVED
   */
  static async handleDepositApproval(depositId: string): Promise<void> {
    const deposit = await prisma.deposit.findUnique({
      where: { id: depositId },
      include: {
        user: {
          select: { id: true, invitedById: true }
        }
      }
    });

    if (!deposit || !deposit.user.invitedById) {
      return; // No referrer to update
    }

    // Check if this is the user's first approved deposit
    const isFirstApprovedDeposit = await prisma.deposit.count({
      where: {
        userId: deposit.userId,
        status: 'APPROVED',
        id: { not: depositId } // Exclude current deposit
      }
    }) === 0;

    if (isFirstApprovedDeposit) {
      // This is the first approved deposit, so update the referrer's tier and stats
      await this.updateUserTier(deposit.user.invitedById);
      
      // Update referral stats with commission
      const commissionRate = this.getCommissionRate(1); // Base tier commission
      const commissionAmount = deposit.amount.toNumber() * commissionRate;
      
      await prisma.referralStats.upsert({
        where: { userId: deposit.user.invitedById },
        update: {
          updatedAt: new Date()
        },
        create: {
          userId: deposit.user.invitedById,
          invitedCount: 0,
          tier: 1
        }
      });

      // Add commission to referrer's balance
      await prisma.user.update({
        where: { id: deposit.user.invitedById },
        data: {
          balance: { increment: commissionAmount }
        }
      });
    }
  }
}
