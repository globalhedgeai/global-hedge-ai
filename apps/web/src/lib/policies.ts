export type Policies = {
  withdrawals: {
    firstWithdrawalAfterDays: number;
    weeklyFeePct: number;
    monthlyFeePct: number;
    monthlyThresholdDays: number;
  };
  rewards: { enabled: boolean; chancePct: number; bonusPct: number };
  dailyReward: { enabled: boolean; amount: number; reset: 'utc_midnight' };
  randomReward: {
    enabled: boolean;
    winRate: number;     // 0.05 = 5%
    minAmount: number;   // 0.20
    maxAmount: number;   // 2.00
    reset: 'utc_midnight';
  };
};

export function getPolicies(): Policies {
  return {
    withdrawals: {
      firstWithdrawalAfterDays: 45,
      weeklyFeePct: 7,
      monthlyFeePct: 3,
      monthlyThresholdDays: 30,
    },
    // كتلة قديمة (تبقى disabled)
    rewards: { enabled: false, chancePct: 5, bonusPct: 2 },

    dailyReward: { enabled: true, amount: 1.0, reset: 'utc_midnight' },

    // Random Reward: 5% يوميًا، بين $0.20 و $2.00
    randomReward: {
      enabled: true,
      winRate: 0.05,
      minAmount: 0.20,
      maxAmount: 2.00,
      reset: 'utc_midnight',
    },
  };
}
