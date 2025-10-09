import { Decimal } from '@prisma/client/runtime/library';
import { prisma } from './prisma';

export interface RewardPolicies {
  enabled: boolean;
  chancePct: number;
  bonusPct: number;
}

export interface RewardResult {
  success: boolean;
  rewardAmount: number;
  metadata: {
    chancePct: number;
    bonusPct: number;
    applied: boolean;
  };
}

export class RandomRewardService {
  static calculateReward(
    depositAmount: Decimal,
    policies: RewardPolicies
  ): RewardResult {
    const amount = depositAmount.toNumber();
    
    if (!policies.enabled) {
      return {
        success: true,
        rewardAmount: 0,
        metadata: {
          chancePct: policies.chancePct,
          bonusPct: policies.bonusPct,
          applied: false
        }
      };
    }

    // Generate random number between 0-100
    const randomValue = Math.random() * 100;
    
    if (randomValue < policies.chancePct) {
      // User wins the reward
      const rewardAmount = (amount * policies.bonusPct) / 100;
      
      return {
        success: true,
        rewardAmount,
        metadata: {
          chancePct: policies.chancePct,
          bonusPct: policies.bonusPct,
          applied: true
        }
      };
    }

    // No reward
    return {
      success: true,
      rewardAmount: 0,
      metadata: {
        chancePct: policies.chancePct,
        bonusPct: policies.bonusPct,
        applied: false
      }
    };
  }

  async processDepositReward(depositId: string, depositAmount: number): Promise<RewardResult> {
    try {
      // Get reward policies from database
      const policies = await prisma.policy.findMany({
        where: {
          key: {
            in: ['bonusChance', 'bonusAmount']
          }
        }
      });

      const rewardPolicies: RewardPolicies = {
        enabled: true,
        chancePct: 5, // Default 5% chance
        bonusPct: 0.2 // Default 0.2% bonus
      };

      // Parse policies
      policies.forEach(policy => {
        if (policy.key === 'bonusChance') {
          rewardPolicies.chancePct = parseFloat(policy.value) || 5;
        } else if (policy.key === 'bonusAmount') {
          rewardPolicies.bonusPct = parseFloat(policy.value) || 0.2;
        }
      });

      return RandomRewardService.calculateReward(new Decimal(depositAmount), rewardPolicies);
    } catch (error) {
      console.error('Error processing deposit reward:', error);
      return {
        success: false,
        rewardAmount: 0,
        metadata: {
          chancePct: 0,
          bonusPct: 0,
          applied: false
        }
      };
    }
  }
}
