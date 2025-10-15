'use client';

import { useEffect, useState, useCallback } from 'react';
import { useTranslation, useLanguage } from '@/lib/translations';
import AuthGuard from '@/components/AuthGuard';
import Link from 'next/link';

interface ReferralStats {
  referralCode: string;
  totalInvited: number;
  successfulReferrals: number;
  totalEarnings: number;
  tier: number;
  invitedUsers: Array<{
    id: string;
    email: string;
    joinedAt: string;
    hasDeposited: boolean;
    firstDepositAt: string | null;
    totalDeposits: number;
  }>;
}

export default function ReferralsPage() {
  const { t } = useTranslation();
  const { locale } = useLanguage();
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReferralStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/referrals/stats');
      const data = await response.json();

      if (data.ok) {
        setStats(data.stats);
      } else {
        setError(data.error || t('errors.generic'));
      }
    } catch {
      setError(t('errors.networkError'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchReferralStats();
  }, [fetchReferralStats]);

  const copyReferralCode = async () => {
    if (stats?.referralCode) {
      try {
        await navigator.clipboard.writeText(stats.referralCode);
        // You could add a toast notification here
      } catch (err) {
        console.error('Failed to copy referral code:', err);
      }
    }
  };

  const getProfitRate = (successfulReferrals: number) => {
    if (successfulReferrals >= 10) return '35%';
    if (successfulReferrals >= 5) return '30%';
    return '25%';
  };

  const getNextTierInfo = (successfulReferrals: number) => {
    if (successfulReferrals < 5) {
      return {
        needed: 5 - successfulReferrals,
        nextRate: '30%',
        current: '25%',
      };
    } else if (successfulReferrals < 10) {
      return {
        needed: 10 - successfulReferrals,
        nextRate: '35%',
        current: '30%',
      };
    }
    return null;
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center gap-3 text-muted-foreground">
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm">{t('common.loading')}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="card border-error/20 bg-error/5">
            <div className="flex items-center gap-3 p-4">
              <svg className="w-5 h-5 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-error font-medium">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8 animate-fade-in">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-yellow-400 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold gradient-text">{t('referrals.title')}</h1>
            </div>
            <p className="text-muted-foreground text-lg">{t('referrals.subtitle')}</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-fade-in">
            <div className="card text-center">
              <div className="p-6">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-blue-400 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{t('referrals.yourCode')}</h3>
                <p className="text-2xl font-bold text-primary mb-2">{stats?.referralCode || 'N/A'}</p>
                <button
                  onClick={copyReferralCode}
                  className="btn-secondary text-sm px-3 py-1"
                >
                  {t('referrals.copyCode')}
                </button>
              </div>
            </div>

            <div className="card text-center">
              <div className="p-6">
                <div className="w-12 h-12 bg-gradient-to-br from-success to-green-400 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{t('referrals.invitedUsers')}</h3>
                <p className="text-2xl font-bold text-success">{stats?.totalInvited || 0}</p>
              </div>
            </div>

            <div className="card text-center">
              <div className="p-6">
                <div className="w-12 h-12 bg-gradient-to-br from-warning to-yellow-400 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{t('referrals.successfulReferrals')}</h3>
                <p className="text-2xl font-bold text-warning">{stats?.successfulReferrals || 0}</p>
              </div>
            </div>

            <div className="card text-center">
              <div className="p-6">
                <div className="w-12 h-12 bg-gradient-to-br from-info to-cyan-400 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{t('referrals.currentProfitRate')}</h3>
                <p className="text-2xl font-bold text-info">{getProfitRate(stats?.successfulReferrals || 0)}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {t('referrals.monthlyProfit')}
                </p>
              </div>
            </div>
          </div>

          {/* Tier Progress Card */}
          {(() => {
            const nextTier = getNextTierInfo(stats?.successfulReferrals || 0);
            return nextTier && (
              <div className="card mb-8 animate-fade-in" style={{ animationDelay: '0.1s' }}>
                <div className="p-6 bg-gradient-to-br from-warning/10 to-yellow-500/5 border border-warning/20">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-warning to-yellow-400 rounded-xl flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-foreground">{t('referrals.nextTier')}</h3>
                  </div>
                  <p className="text-muted-foreground mb-4">
                    {t('referrals.inviteMore').replace('{count}', nextTier.needed.toString()).replace('{rate}', nextTier.nextRate.toString())}
                  </p>
                  <div className="relative h-3 bg-accent/30 rounded-full overflow-hidden mb-2">
                    <div 
                      className="absolute top-0 left-0 h-full bg-gradient-to-r from-warning to-yellow-400 transition-all duration-500 rounded-full"
                      style={{ width: `${((stats?.successfulReferrals || 0) / (stats?.successfulReferrals || 0) + nextTier.needed) * 100}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{stats?.successfulReferrals || 0} / {(stats?.successfulReferrals || 0) + nextTier.needed} {t('referrals.depositors')}</span>
                    <span>{nextTier.current} → {nextTier.nextRate}</span>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Profit Rates Info Card */}
          <div className="card mb-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-info to-cyan-400 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-foreground">{t('referrals.profitRates')}</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-accent/30 rounded-xl border border-border hover:border-primary/30 transition-all duration-200">
                  <div>
                    <p className="font-semibold text-foreground">{t('referrals.baseRate')}</p>
                    <p className="text-sm text-muted-foreground">{t('referrals.allUsers')}</p>
                  </div>
                  <span className="text-2xl font-bold text-primary">25%</span>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-warning/10 rounded-xl border border-warning/20 hover:border-warning/40 transition-all duration-200">
                  <div>
                    <p className="font-semibold text-foreground">{t('referrals.tier1Rate')}</p>
                    <p className="text-sm text-muted-foreground">5 {t('referrals.depositors')}</p>
                  </div>
                  <span className="text-2xl font-bold text-warning">30%</span>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-success/10 rounded-xl border border-success/20 hover:border-success/40 transition-all duration-200">
                  <div>
                    <p className="font-semibold text-foreground">{t('referrals.tier2Rate')}</p>
                    <p className="text-sm text-muted-foreground">10 {t('referrals.depositors')}</p>
                  </div>
                  <span className="text-2xl font-bold text-success">35%</span>
                </div>
              </div>

              <div className="mt-6 p-4 bg-info/10 rounded-xl border-l-4 border-info">
                <div className="flex gap-3">
                  <svg className="w-5 h-5 text-info flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-info-foreground">
                    <strong>{t('referrals.important')}:</strong> {t('referrals.depositRequirement')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Invited Users List */}
          <div className="card animate-fade-in">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-6">{t('referrals.invitedUsers')}</h3>
              
              {stats?.invitedUsers.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <p className="text-muted-foreground">{t('referrals.noInvites')}</p>
                  <Link href={`/${locale}/register`} className="btn-primary mt-4">
                    {t('referrals.inviteFriends')}
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {stats?.invitedUsers.map((user) => (
                    <div
                      key={user.id}
                      className={`p-4 rounded-xl border transition-all duration-200 hover:shadow-md ${
                        user.hasDeposited 
                          ? 'bg-success/10 border-success/20 hover:bg-success/15' 
                          : 'bg-accent/30 border-border hover:bg-accent/40'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                            user.hasDeposited ? 'bg-success/20 text-success' : 'bg-muted text-muted-foreground'
                          }`}>
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">{user.email}</p>
                            <p className="text-sm text-muted-foreground">
                              {t('referrals.joined')}: {new Date(user.joinedAt).toLocaleDateString(locale)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            user.hasDeposited 
                              ? 'bg-success/10 text-success border border-success/20' 
                              : 'bg-warning/10 text-warning border border-warning/20'
                          }`}>
                            <div className={`w-2 h-2 rounded-full mr-2 ${
                              user.hasDeposited ? 'bg-success' : 'bg-warning'
                            }`}></div>
                            {user.hasDeposited ? t('referrals.active') : t('referrals.pending')}
                          </div>
                          {user.hasDeposited && (
                            <p className="text-xs text-muted-foreground mt-2">
                              {t('referrals.deposits')}: <span className="font-medium text-success">{user.totalDeposits}</span>
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
