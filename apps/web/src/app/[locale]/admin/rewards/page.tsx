'use client';
import { useEffect, useState } from 'react';
import { useTranslation } from '@/lib/translations';

type RewardDeposit = {
  id: string;
  amount: number;
  rewardAmount: number;
  rewardMeta: string;
  status: string;
  createdAt: string;
  user: {
    email: string;
  };
};

export default function AdminRewardsPage() {
  const [rewards, setRewards] = useState<RewardDeposit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    fetchRewards();
  }, []);

  async function fetchRewards() {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/rewards');
      const data = await response.json();
      
      if (data?.ok) {
        setRewards(data.rewards);
      } else {
        setError('Failed to fetch rewards');
      }
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <main className="p-6 max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">{t('navigation.rewards')}</h1>
        <div className="text-center">{t('common.loading')}</div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="p-6 max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">{t('navigation.rewards')}</h1>
        <div className="text-red-600">{error}</div>
      </main>
    );
  }

  return (
    <main className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">{t('navigation.rewards')}</h1>
      
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b">
          <h2 className="text-lg font-semibold">Deposits with Rewards (Last 50)</h2>
        </div>
        
        {rewards.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No rewards found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Deposit Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reward Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Meta
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {rewards.map((reward) => {
                  const meta = JSON.parse(reward.rewardMeta || '{}');
                  return (
                    <tr key={reward.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                        {reward.id.slice(0, 8)}...
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {reward.user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {reward.amount} USDT
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                        +{reward.rewardAmount} USDT
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          reward.status === 'APPROVED' 
                            ? 'bg-green-100 text-green-800'
                            : reward.status === 'PENDING'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {reward.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(reward.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="text-xs">
                          <div>Chance: {meta.chancePct}%</div>
                          <div>Bonus: {meta.bonusPct}%</div>
                          <div>Applied: {meta.applied ? 'Yes' : 'No'}</div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
