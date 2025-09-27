'use client';
import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';

type Policies = {
  depositFeePct: number;
  withdraw: {
    firstWithdrawMinDays: number;
    weeklyFeePct: number;
    monthlyFeePct: number;
    monthlyThresholdDays: number;
  };
  rewards: {
    enabled: boolean;
    chancePct: number;
    bonusPct: number;
  };
};

type WithdrawalInfo = {
  isLocked: boolean;
  unlockDate?: string;
  daysSinceLastWithdrawal?: number;
  feePct?: number;
  feeAmount?: number;
  netAmount?: number;
  appliedRule?: string;
};

export default function WithdrawPage() {
  const [amount, setAmount] = useState<string>('');
  const [address, setAddress] = useState('');
  const [policies, setPolicies] = useState<Policies | null>(null);
  const [withdrawalInfo, setWithdrawalInfo] = useState<WithdrawalInfo | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const t = useTranslations();

  useEffect(() => {
    fetchPolicies();
    checkWithdrawalStatus();
  }, []);

  async function fetchPolicies() {
    try {
      const response = await fetch("/api/policies");
      const data = await response.json();
      if (data?.ok) {
        setPolicies(data.policies);
      }
    } catch (error) {
      console.error("Failed to fetch policies:", error);
    }
  }

  async function checkWithdrawalStatus() {
    try {
      const response = await fetch("/api/withdrawals/check");
      const data = await response.json();
      if (data?.ok) {
        setWithdrawalInfo(data.info);
      }
    } catch (error) {
      console.error("Failed to check withdrawal status:", error);
    }
  }

  const calculateFee = () => {
    if (!policies || !amount || !withdrawalInfo) return { feeAmount: 0, netAmount: 0 };
    
    const amountNum = parseFloat(amount);
    if (withdrawalInfo.isLocked) return { feeAmount: 0, netAmount: 0 };
    
    const feePct = withdrawalInfo.feePct || 0;
    const feeAmount = (amountNum * feePct) / 100;
    const netAmount = amountNum - feeAmount;
    
    return { feeAmount, netAmount };
  };

  const { feeAmount, netAmount } = calculateFee();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch('/api/withdrawals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: parseFloat(amount), address })
      });
      
      const data = await response.json();
      
      if (!data.ok) {
        throw new Error(data.error || t('withdraw.error'));
      }
      
      setMessage(`✅ ${t('withdraw.success')}`);
      setAmount('');
      setAddress('');
      await checkWithdrawalStatus();
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : t('errors.generic');
      setMessage(`❌ ${errorMsg}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="p-6 space-y-4 max-w-4xl mx-auto">
      <h1 className="text-xl font-bold">{t('withdraw.title')}</h1>
      
      {/* Withdrawal Lock Status */}
      {withdrawalInfo?.isLocked && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="text-red-800 font-semibold mb-2">{t('withdraw.locked')}</h3>
          <p className="text-red-700 mb-2">{t('withdraw.lockedMessage')}</p>
          {withdrawalInfo.unlockDate && (
            <p className="text-red-600 text-sm">
              {t('withdraw.unlockDate')}: {new Date(withdrawalInfo.unlockDate).toLocaleDateString()}
            </p>
          )}
        </div>
      )}

      {/* Fee Information */}
      {!withdrawalInfo?.isLocked && policies && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-blue-800 font-semibold mb-2">{t('withdraw.feeInfo')}</h3>
          <div className="text-blue-700 text-sm space-y-1">
            <p>{t('policies.firstWithdrawMinDays')}: {policies.withdraw.firstWithdrawMinDays} {t('common.days')}</p>
            <p>{t('withdraw.weeklyFee')}: {policies.withdraw.weeklyFeePct}%</p>
            <p>{t('withdraw.monthlyFee')}: {policies.withdraw.monthlyFeePct}%</p>
          </div>
        </div>
      )}

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('withdraw.amount')} (USDT)
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder={t('withdraw.amount')}
            disabled={withdrawalInfo?.isLocked || submitting}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('withdraw.method')} (T...)
          </label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="TKaAamEouHjG9nZwoTPhgYUerejbBHGMop"
            disabled={withdrawalInfo?.isLocked || submitting}
            required
          />
        </div>

        {/* Fee Preview */}
        {!withdrawalInfo?.isLocked && amount && withdrawalInfo && (
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-2">{t('withdraw.feeInfo')}</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>{t('withdraw.feeAmount')}:</span>
                <span className="font-medium">{feeAmount.toFixed(2)} USDT</span>
              </div>
              <div className="flex justify-between">
                <span>{t('withdraw.netAmount')}:</span>
                <span className="font-medium text-green-600">{netAmount.toFixed(2)} USDT</span>
              </div>
              {withdrawalInfo.appliedRule && (
                <div className="flex justify-between">
                  <span>{t('withdraw.appliedRule')}:</span>
                  <span className="text-blue-600">{withdrawalInfo.appliedRule}</span>
                </div>
              )}
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={withdrawalInfo?.isLocked || submitting || !amount || !address}
          className="bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {submitting ? t('withdraw.processing') : t('withdraw.submit')}
        </button>

        {message && (
          <div className={`p-3 rounded-md ${message.includes('✅') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
            {message}
          </div>
        )}
      </form>
    </main>
  );
}
