'use client';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import DailyRewardCard from '@/components/DailyRewardCard';
import RandomRewardCard from '@/components/RandomRewardCard';

interface User {
  id: string;
  email: string;
  role: 'USER' | 'ADMIN';
  walletAddress?: string;
}

interface ReferralData {
  referralCode: string;
  stats: {
    invitedCount: number;
    tier: number;
  };
  invitedUsers: Array<{
    id: string;
    email: string;
    joinedAt: string;
    balance: number;
  }>;
}

export default function AccountPage() {
  const t = useTranslations();
  const [user, setUser] = useState<User | null>(null);
  const [wallet, setWallet] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [referralData, setReferralData] = useState<ReferralData | null>(null);
  const [isLoadingReferrals, setIsLoadingReferrals] = useState(false);

  useEffect(() => { 
    fetch('/api/me')
      .then(r => r.json())
      .then(d => { 
        if (d?.user) { 
          setUser(d.user); 
          setWallet(d.user.walletAddress || ''); 
        } 
      }); 
  }, []);

  useEffect(() => {
    if (user) {
      fetchReferralData();
    }
  }, [user]);

  const fetchReferralData = async () => {
    setIsLoadingReferrals(true);
    try {
      const response = await fetch('/api/referrals');
      const data = await response.json();
      if (data.ok) {
        setReferralData(data);
      }
    } catch (error) {
      console.error('Error fetching referral data:', error);
    } finally {
      setIsLoadingReferrals(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      const response = await fetch('/api/me', { 
        method: 'PUT', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ walletAddress: wallet })
      });
      
      if (response.ok) {
        alert(t('common.success'));
      } else {
        alert(t('common.error'));
      }
    } catch {
      alert(t('common.error'));
    } finally {
      setIsSaving(false);
    }
  };

  const copyReferralCode = async () => {
    if (referralData?.referralCode) {
      try {
        await navigator.clipboard.writeText(referralData.referralCode);
        alert(t('referrals.codeCopied'));
      } catch (error) {
        console.error('Failed to copy:', error);
      }
    }
  };

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">{t('account.title')}</h1>
      
      {/* Daily Reward Card */}
      <DailyRewardCard />
      
      {/* Random Reward Card */}
      <RandomRewardCard />
      
      {/* User Info */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-3">{t('account.profile')}</h2>
        {user && (
          <div className="space-y-2">
            <div>
              <span className="font-medium">{t('auth.email')}: </span>
              <span>{user.email}</span>
            </div>
            <div>
              <span className="font-medium">{t('account.balance')}: </span>
              <span className="font-mono">0.00</span>
            </div>
          </div>
        )}
      </div>

      {/* Referrals Section */}
      {user && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-3">{t('referrals.title')}</h2>
          
          {isLoadingReferrals ? (
            <div className="text-center py-4">{t('common.loading')}</div>
          ) : referralData ? (
            <div className="space-y-4">
              {/* Referral Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('referrals.myCode')}
                </label>
                <div className="flex gap-2">
                  <input 
                    value={referralData.referralCode} 
                    readOnly
                    className="border border-gray-300 rounded-md p-2 flex-1 bg-gray-50 font-mono" 
                  />
                  <button 
                    onClick={copyReferralCode}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    {t('referrals.copyCode')}
                  </button>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded">
                  <div className="text-sm text-gray-600">{t('referrals.invitedCount')}</div>
                  <div className="text-lg font-semibold">{referralData.stats.invitedCount}</div>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <div className="text-sm text-gray-600">{t('referrals.currentTier')}</div>
                  <div className="text-lg font-semibold">Tier {referralData.stats.tier}</div>
                </div>
              </div>

              {/* Invited Users */}
              <div>
                <h3 className="font-medium mb-2">{t('referrals.invitedUsers')}</h3>
                {referralData.invitedUsers.length > 0 ? (
                  <div className="space-y-2">
                    {referralData.invitedUsers.map((invitedUser) => (
                      <div key={invitedUser.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <div>
                          <div className="font-medium">{invitedUser.email}</div>
                          <div className="text-sm text-gray-600">
                            {new Date(invitedUser.joinedAt).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="text-sm font-mono">
                          {invitedUser.balance.toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">{t('referrals.noInvites')}</p>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-4 text-gray-600">{t('common.error')}</div>
          )}
        </div>
      )}

      {/* Wallet Address Form */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-3">{t('account.settings')}</h2>
        <form className="space-y-3" onSubmit={handleSave}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('account.walletAddress') || 'Wallet Address'}
            </label>
            <input 
              value={wallet} 
              onChange={e => setWallet(e.target.value)} 
              className="border border-gray-300 rounded-md p-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
              placeholder="T..." 
            />
          </div>
          <button 
            type="submit"
            disabled={isSaving}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isSaving ? t('common.loading') : t('common.save')}
          </button>
        </form>
      </div>
    </main>
  );
}
