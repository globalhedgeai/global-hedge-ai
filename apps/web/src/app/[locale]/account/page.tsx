'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslation, useLanguage } from '@/lib/translations';
import { formatCurrency } from '@/lib/numberFormat';
import DailyRewardCard from '@/components/DailyRewardCard';
import RandomRewardCard from '@/components/RandomRewardCard';

interface User {
  id: string;
  email: string;
  role: 'USER' | 'ADMIN';
  walletAddress?: string;
  balance?: number;
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
  const { t } = useTranslation();
  const { locale } = useLanguage();
  const [user, setUser] = useState<User | null>(null);
  const [wallet, setWallet] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [referralData, setReferralData] = useState<ReferralData | null>(null);
  const [isLoadingReferrals, setIsLoadingReferrals] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

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
    setMessage(null);
    
    try {
      const response = await fetch('/api/me', { 
        method: 'PUT', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ walletAddress: wallet })
      });
      
      if (response.ok) {
        setMessage(`✅ ${t('account.profileUpdated')}`);
      } else {
        setMessage(`❌ ${t('account.updateError')}`);
      }
    } catch {
      setMessage(`❌ ${t('account.updateError')}`);
    } finally {
      setIsSaving(false);
    }
  };

  const copyReferralCode = async () => {
    if (referralData?.referralCode) {
      try {
        await navigator.clipboard.writeText(referralData.referralCode);
        setMessage(`✅ ${t('referrals.copyCode')}`);
      } catch (error) {
        console.error('Failed to copy:', error);
        setMessage(`❌ ${t('errors.generic')}`);
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-yellow-400 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold gradient-text">{t('account.title')}</h1>
          </div>
          <p className="text-muted-foreground text-lg">{t('account.subtitle')}</p>
        </div>

        {/* App Download Notice */}
        <div className="mb-6 p-4 bg-gradient-to-r from-primary/10 to-yellow-400/10 border border-primary/20 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-yellow-400 rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold">G</span>
              </div>
              <div>
                <h3 className="font-bold text-foreground">📱 تطبيق الهاتف متاح الآن!</h3>
                <p className="text-sm text-muted-foreground">استخدم التطبيق للوصول السريع والآمن</p>
              </div>
            </div>
            <Link href={`/${locale}/download`} className="btn-primary px-4 py-2 text-sm">
              تحميل التطبيق
            </Link>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg text-sm ${
            message.includes('✅') 
              ? 'bg-success/10 text-success border border-success/20' 
              : 'bg-error/10 text-error border border-error/20'
          }`}>
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Daily Reward Card */}
            <DailyRewardCard />
            
            {/* Random Reward Card */}
            <RandomRewardCard />
            
            {/* User Info */}
            <div className="card">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-foreground mb-4">{t('account.profile')}</h2>
                {user && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-accent/30 rounded-lg">
                      <span className="font-medium text-foreground">{t('auth.email')}:</span>
                      <span className="text-muted-foreground">{user.email}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-accent/30 rounded-lg">
                      <span className="font-medium text-foreground">{t('account.balance')}:</span>
                      <span className="font-mono text-success font-semibold">{formatCurrency(Number(user.balance) || 0, locale)} USDT</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-accent/30 rounded-lg">
                      <span className="font-medium text-foreground">{t('account.role')}:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.role === 'ADMIN' ? 'bg-primary/10 text-primary' : 'bg-success/10 text-success'
                      }`}>
                        {user.role}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Wallet Address Form */}
            <div className="card">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-foreground mb-4">{t('account.settings')}</h2>
                <form className="space-y-4" onSubmit={handleSave}>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      {t('account.walletAddress')}
                    </label>
                    <input 
                      value={wallet} 
                      onChange={e => setWallet(e.target.value)} 
                      className="input w-full" 
                      placeholder="TKaAamEouHjG9nZwoTPhgYUerejbBHGMop" 
                    />
                  </div>
                  <button 
                    type="submit"
                    disabled={isSaving}
                    className="btn-primary w-full py-3"
                  >
                    {isSaving ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
                        <span>{t('account.saving')}</span>
                      </div>
                    ) : (
                      t('account.save')
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Right Column - Referrals */}
          {user && (
            <div className="space-y-6">
              <div className="card">
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-foreground mb-4">{t('referrals.title')}</h2>
                  
                  {isLoadingReferrals ? (
                    <div className="text-center py-8">
                      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="text-muted-foreground">{t('common.loading')}</p>
                    </div>
                  ) : referralData ? (
                    <div className="space-y-6">
                      {/* Referral Code */}
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          {t('referrals.myCode')}
                        </label>
                        <div className="flex gap-2">
                          <input 
                            value={referralData.referralCode} 
                            readOnly
                            className="input flex-1 font-mono bg-accent/30" 
                          />
                          <button 
                            onClick={copyReferralCode}
                            className="btn-secondary px-4 py-2"
                          >
                            {t('referrals.copyCode')}
                          </button>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="card p-4 text-center">
                          <div className="text-sm text-muted-foreground mb-1">{t('referrals.invitedCount')}</div>
                          <div className="text-2xl font-bold text-success">{referralData.stats.invitedCount}</div>
                        </div>
                        <div className="card p-4 text-center">
                          <div className="text-sm text-muted-foreground mb-1">{t('referrals.currentTier')}</div>
                          <div className="text-2xl font-bold text-primary">Tier {referralData.stats.tier}</div>
                        </div>
                        <div className="card p-4 text-center">
                          <div className="text-sm text-muted-foreground mb-1">{t('referrals.monthlyRate')}</div>
                          <div className="text-2xl font-bold text-warning">
                            {referralData.stats.tier === 1 ? '25%' : 
                             referralData.stats.tier === 2 ? '30%' : 
                             referralData.stats.tier === 3 ? '35%' : '25%'}
                          </div>
                        </div>
                      </div>

                      {/* Tier Progress */}
                      <div className="card p-4">
                        <h4 className="font-semibold text-foreground mb-4">{t('referrals.tierProgress')}</h4>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Tier 1 (25%)</span>
                            <div className="flex items-center gap-2">
                              <div className="w-24 bg-accent/30 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full ${referralData.stats.tier >= 1 ? 'bg-success' : 'bg-accent'}`}
                                  style={{ width: `${Math.min((referralData.stats.invitedCount / 5) * 100, 100)}%` }}
                                ></div>
                              </div>
                              <span className="text-xs text-muted-foreground">{referralData.stats.invitedCount}/5</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Tier 2 (30%)</span>
                            <div className="flex items-center gap-2">
                              <div className="w-24 bg-accent/30 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full ${referralData.stats.tier >= 2 ? 'bg-success' : 'bg-accent'}`}
                                  style={{ width: `${Math.min(((referralData.stats.invitedCount - 5) / 5) * 100, 100)}%` }}
                                ></div>
                              </div>
                              <span className="text-xs text-muted-foreground">{Math.max(referralData.stats.invitedCount - 5, 0)}/5</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Tier 3 (35%)</span>
                            <div className="flex items-center gap-2">
                              <div className="w-24 bg-accent/30 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full ${referralData.stats.tier >= 3 ? 'bg-success' : 'bg-accent'}`}
                                  style={{ width: `${Math.min(((referralData.stats.invitedCount - 10) / 10) * 100, 100)}%` }}
                                ></div>
                              </div>
                              <span className="text-xs text-muted-foreground">{Math.max(referralData.stats.invitedCount - 10, 0)}/10</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Invited Users */}
                      <div>
                        <h3 className="font-semibold text-foreground mb-4">{t('referrals.invitedUsers')}</h3>
                        {referralData.invitedUsers.length > 0 ? (
                          <div className="space-y-3">
                            {referralData.invitedUsers.map((invitedUser) => (
                              <div key={invitedUser.id} className="flex justify-between items-center p-3 bg-accent/30 rounded-lg">
                                <div>
                                  <div className="font-medium text-foreground">{invitedUser.email}</div>
                                  <div className="text-sm text-muted-foreground">
                                    {new Date(invitedUser.joinedAt).toLocaleDateString()}
                                  </div>
                                </div>
                                <div className="text-sm font-mono text-success font-semibold">
                                  ${invitedUser.balance.toFixed(2)}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-4">
                              <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                              </svg>
                            </div>
                            <p className="text-muted-foreground">{t('referrals.noInvites')}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-error">
                      <p>{t('common.error')}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
