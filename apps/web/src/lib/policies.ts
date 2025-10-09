export type Policies = {
  withdrawals: {
    firstWithdrawalAfterDays: number;
    weeklyFeePct: number;
    monthlyFeePct: number;
    monthlyThresholdDays: number;
  };
  deposits: {
    feePct: number;  // رسوم الإيداع
  };
  rewards: { enabled: boolean; chancePct: number; bonusPct: number };
  dailyReward: { 
    enabled: boolean; 
    reset: 'utc_midnight';
    // المكافأة اليومية تُحسب بناءً على الأرباح الشهرية للمستخدم
  };
  monthlyRates: {
    baseRate: number;    // 25% للمستوى الأساسي
    tier1Rate: number;   // 30% بعد 5 دعوات مؤكدة
    tier2Rate: number;   // 35% بعد 10 دعوات مؤكدة
  };
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
    deposits: {
      feePct: 2,  // رسوم الإيداع 2%
    },
    // كتلة قديمة (تبقى disabled)
    rewards: { enabled: false, chancePct: 5, bonusPct: 2 },

    dailyReward: { enabled: true, reset: 'utc_midnight' },

    monthlyRates: {
      baseRate: 25,    // 25% للمستوى الأساسي
      tier1Rate: 30,   // 30% بعد 5 دعوات مؤكدة
      tier2Rate: 35,    // 35% بعد 10 دعوات مؤكدة
    },

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
