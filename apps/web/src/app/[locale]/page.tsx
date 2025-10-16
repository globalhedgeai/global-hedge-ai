'use client';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useTranslation, useLanguage } from '@/lib/translations';
import DailyRewardCard from '@/components/DailyRewardCard';
import RandomRewardCard from '@/components/RandomRewardCard';
import { formatNumber, formatCurrency } from '@/lib/numberFormat';

export default function HomePage() {
  const { t } = useTranslation();
  const { locale } = useLanguage();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalVolume: 0,
    activeTrades: 0
  });
  const [userBalance, setUserBalance] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuthentication();
    fetchPlatformStats();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchUserBalance();
    }
  }, [isAuthenticated]);

  async function checkAuthentication() {
    try {
      const response = await fetch('/api/me');
      if (response.ok) {
        const data = await response.json();
        setIsAuthenticated(!!data.user);
      }
    } catch {
      setIsAuthenticated(false);
    }
  }

  async function fetchPlatformStats() {
    try {
      const response = await fetch('/api/admin/platform-stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats || { totalUsers: 0, totalVolume: 0, activeTrades: 0 });
      }
    } catch {
      // Use default stats
    }
  }

  async function fetchUserBalance() {
    try {
      const response = await fetch('/api/me');
      if (response.ok) {
        const data = await response.json();
        const balance = typeof data.user.balance === 'object' && data.user.balance.toNumber 
          ? data.user.balance.toNumber() 
          : Number(data.user.balance) || 0;
        setUserBalance(balance);
      }
    } catch (error) {
      console.error('Failed to fetch user balance:', error);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isAuthenticated ? (
          /* Authenticated User Dashboard */
          <div className="space-y-8">
            {/* Welcome Header */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary to-yellow-400 rounded-2xl mb-4 shadow-lg">
                <span className="text-primary-foreground font-bold text-2xl">G</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold gradient-text mb-2">
                {t('dashboard.title')}
              </h1>
              <p className="text-muted-foreground text-lg">
                {t('dashboard.subtitle')}
              </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="card text-center">
                <div className="text-2xl font-bold text-primary mb-1">
                  {formatCurrency(userBalance)}
                </div>
                <div className="text-sm text-muted-foreground">{t('common.balance')}</div>
              </div>
              <div className="card text-center">
                <div className="text-2xl font-bold text-success mb-1">
                  {formatNumber(stats.totalUsers)}
                </div>
                <div className="text-sm text-muted-foreground">{t('dashboard.totalUsers')}</div>
              </div>
              <div className="card text-center">
                <div className="text-2xl font-bold text-info mb-1">
                  {formatCurrency(stats.totalVolume)}
                </div>
                <div className="text-sm text-muted-foreground">{t('dashboard.totalVolume')}</div>
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Daily Reward */}
              <div className="card">
                <DailyRewardCard />
              </div>

              {/* Random Reward */}
              <div className="card">
                <RandomRewardCard />
              </div>

              {/* Quick Actions */}
              <div className="card md:col-span-2 lg:col-span-1">
                <h3 className="text-lg font-semibold text-foreground mb-4">{t('dashboard.quickActions')}</h3>
                <div className="space-y-3">
                  <Link href={`/${locale}/deposit`} className="btn-primary w-full text-center py-3">
                    💰 {t('navigation.deposit')}
                  </Link>
                  <Link href={`/${locale}/withdraw`} className="btn-secondary w-full text-center py-3">
                    💸 {t('navigation.withdraw')}
                  </Link>
                  <Link href={`/${locale}/market`} className="btn-secondary w-full text-center py-3">
                    📈 {t('navigation.market')}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Landing Page for Non-Authenticated Users */
          <div className="space-y-16">
            {/* Hero Section */}
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gradient-to-br from-primary to-yellow-400 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl">
                <span className="text-primary-foreground font-bold text-4xl">G</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold gradient-text mb-6">
                {t('landing.title')}
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
                {t('landing.subtitle')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href={`/${locale}/register`}
                  className="btn-primary text-lg px-8 py-4"
                >
                  {t('landing.getStarted')}
                </Link>
                <Link
                  href={`/${locale}/login`}
                  className="btn-secondary text-lg px-8 py-4"
                >
                  {t('landing.login')}
                </Link>
              </div>
            </div>

            {/* Features Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-yellow-400/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <div className="text-primary text-2xl">💰</div>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{t('landing.feature1')}</h3>
                <p className="text-sm text-muted-foreground">{t('landing.feature1Desc')}</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-yellow-400/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <div className="text-primary text-2xl">📈</div>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{t('landing.feature2')}</h3>
                <p className="text-sm text-muted-foreground">{t('landing.feature2Desc')}</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-yellow-400/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <div className="text-primary text-2xl">🔒</div>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{t('landing.feature3')}</h3>
                <p className="text-sm text-muted-foreground">{t('landing.feature3Desc')}</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-yellow-400/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <div className="text-primary text-2xl">⚡</div>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{t('landing.feature4')}</h3>
                <p className="text-sm text-muted-foreground">{t('landing.feature4Desc')}</p>
              </div>
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="card text-center">
                <div className="text-3xl font-bold text-primary mb-2">
                  {formatNumber(stats.totalUsers)}
                </div>
                <div className="text-muted-foreground">{t('dashboard.totalUsers')}</div>
              </div>
              <div className="card text-center">
                <div className="text-3xl font-bold text-success mb-2">
                  {formatCurrency(stats.totalVolume)}
                </div>
                <div className="text-muted-foreground">{t('dashboard.totalVolume')}</div>
              </div>
              <div className="card text-center">
                <div className="text-3xl font-bold text-info mb-2">
                  {formatNumber(stats.activeTrades)}
                </div>
                <div className="text-muted-foreground">{t('dashboard.activeTrades')}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}