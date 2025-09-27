import { Decimal } from '@prisma/client/runtime/library';

export interface RewardPolicies {
  enabled: boolean;
  chancePct: number;
  bonusPct: number;
}

export interface RewardResult {
  rewardAmount: Decimal;
  rewardMeta: {
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
        rewardAmount: new Decimal(0),
        rewardMeta: {
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
      const rewardAmount = new Decimal((amount * policies.bonusPct) / 100);
      
      return {
        rewardAmount,
        rewardMeta: {
          chancePct: policies.chancePct,
          bonusPct: policies.bonusPct,
          applied: true
        }
      };
    }

    // No reward
    return {
      rewardAmount: new Decimal(0),
      rewardMeta: {
        chancePct: policies.chancePct,
        bonusPct: policies.bonusPct,
        applied: false
      }
    };
  }
}
