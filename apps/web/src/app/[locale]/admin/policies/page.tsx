'use client';
import { useEffect, useState } from 'react';
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

export default function AdminPoliciesPage() {
  const [policies, setPolicies] = useState<Policies | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const t = useTranslations();

  useEffect(() => {
    fetchPolicies();
  }, []);

  async function fetchPolicies() {
    try {
      setLoading(true);
      const response = await fetch('/api/policies');
      const data = await response.json();
      
      if (data?.ok) {
        setPolicies(data.policies);
      } else {
        setError('Failed to fetch policies');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <main className="p-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">{t('policies.title')}</h1>
        <div className="text-center">{t('common.loading')}</div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="p-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">{t('policies.title')}</h1>
        <div className="text-red-600">{error}</div>
      </main>
    );
  }

  return (
    <main className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">{t('policies.title')}</h1>
      
      <div className="space-y-6">
        {/* Deposit Fee */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">{t('policies.depositFee')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('policies.depositFee')} (%)
              </label>
              <div className="p-3 bg-gray-50 border rounded-md">
                {policies?.depositFeePct || 0}%
              </div>
            </div>
          </div>
        </div>

        {/* Withdrawal Rules */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">{t('policies.withdrawalRules')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('policies.firstWithdrawMinDays')}
              </label>
              <div className="p-3 bg-gray-50 border rounded-md">
                {policies?.withdraw.firstWithdrawMinDays || 45} {t('common.days')}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('policies.weeklyFeePct')}
              </label>
              <div className="p-3 bg-gray-50 border rounded-md">
                {policies?.withdraw.weeklyFeePct || 7}%
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('policies.monthlyFeePct')}
              </label>
              <div className="p-3 bg-gray-50 border rounded-md">
                {policies?.withdraw.monthlyFeePct || 3}%
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('policies.monthlyThresholdDays')}
              </label>
              <div className="p-3 bg-gray-50 border rounded-md">
                {policies?.withdraw.monthlyThresholdDays || 30} {t('common.days')}
              </div>
            </div>
          </div>
        </div>

        {/* Rewards */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">{t('policies.rewards')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('policies.enabled')}
              </label>
              <div className="p-3 bg-gray-50 border rounded-md">
                {policies?.rewards.enabled ? t('common.yes') : t('common.no')}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('policies.chancePct')}
              </label>
              <div className="p-3 bg-gray-50 border rounded-md">
                {policies?.rewards.chancePct || 5}%
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('policies.bonusPct')}
              </label>
              <div className="p-3 bg-gray-50 border rounded-md">
                {policies?.rewards.bonusPct || 2}%
              </div>
            </div>
          </div>
        </div>

        {/* Raw JSON */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Raw JSON</h2>
          <pre className="bg-gray-50 p-4 rounded-md overflow-auto text-sm">
            {JSON.stringify(policies, null, 2)}
          </pre>
        </div>
      </div>
    </main>
  );
}
