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
      {isAuthenticated ? (
        /* Authenticated User Dashboard */
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary to-yellow-400 rounded-3xl mb-6 shadow-2xl">
              <span className="text-primary-foreground font-bold text-3xl">G</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-4">
              {t('dashboard.title')}
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {t('dashboard.subtitle')}
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
            <div className="card text-center hover-lift p-6">
              <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-yellow-400/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <div className="text-primary text-2xl">💰</div>
              </div>
              <div className="text-3xl font-bold text-primary mb-2">
                {formatCurrency(userBalance)}
              </div>
              <div className="text-sm text-muted-foreground">{t('common.balance')}</div>
            </div>
            <div className="card text-center hover-lift p-6">
              <div className="w-16 h-16 bg-gradient-to-br from-success/20 to-green-400/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <div className="text-success text-2xl">👥</div>
              </div>
              <div className="text-3xl font-bold text-success mb-2">
                {formatNumber(stats.totalUsers)}
              </div>
              <div className="text-sm text-muted-foreground">{t('dashboard.totalUsers')}</div>
            </div>
            <div className="card text-center hover-lift p-6">
              <div className="w-16 h-16 bg-gradient-to-br from-info/20 to-blue-400/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <div className="text-info text-2xl">📈</div>
              </div>
              <div className="text-3xl font-bold text-info mb-2">
                {formatCurrency(stats.totalVolume)}
              </div>
              <div className="text-sm text-muted-foreground">{t('dashboard.totalVolume')}</div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Daily Reward */}
            <div className="card hover-lift">
              <DailyRewardCard />
            </div>

            {/* Random Reward */}
            <div className="card hover-lift">
              <RandomRewardCard />
            </div>

            {/* Quick Actions */}
            <div className="card hover-lift md:col-span-2 lg:col-span-1">
              <h3 className="text-xl font-semibold text-foreground mb-6">{t('dashboard.quickActions')}</h3>
              <div className="space-y-4">
                <Link href={`/${locale}/deposit`} className="btn-primary w-full text-center py-4 text-lg">
                  💰 {t('navigation.deposit')}
                </Link>
                <Link href={`/${locale}/withdraw`} className="btn-secondary w-full text-center py-4 text-lg">
                  💸 {t('navigation.withdraw')}
                </Link>
                <Link href={`/${locale}/market`} className="btn-secondary w-full text-center py-4 text-lg">
                  📈 {t('navigation.market')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Landing Page for Non-Authenticated Users */
        <div>
          {/* Hero Section */}
          <div className="relative overflow-hidden bg-gradient-to-br from-background via-background to-primary/10">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-50"></div>
            
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 lg:py-48">
              <div className="text-center">
                {/* Logo */}
                <div className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-br from-primary to-yellow-400 rounded-3xl mb-8 shadow-2xl">
                  <span className="text-primary-foreground font-bold text-5xl">G</span>
                </div>
                
                {/* Main Title */}
                <h1 className="text-6xl md:text-8xl font-bold gradient-text mb-8 leading-tight">
                  {t('landing.title')}
                </h1>
                
                {/* Subtitle */}
                <p className="text-2xl md:text-3xl text-muted-foreground mb-16 max-w-4xl mx-auto leading-relaxed">
                  {t('landing.subtitle')}
                </p>
                
                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-8 justify-center mb-20">
                  <Link
                    href={`/${locale}/register`}
                    className="btn-primary text-2xl px-16 py-8 text-xl font-bold shadow-2xl hover:shadow-primary/25 transition-all duration-300 transform hover:scale-105"
                  >
                    🚀 {t('landing.getStarted')}
                  </Link>
                  <Link
                    href={`/${locale}/login`}
                    className="btn-secondary text-2xl px-16 py-8 text-xl font-bold shadow-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                  >
                    🔐 {t('landing.login')}
                  </Link>
                </div>

                {/* Trust Indicators */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-12 max-w-5xl mx-auto">
                  <div className="text-center">
                    <div className="text-6xl font-bold text-primary mb-4">
                      {formatNumber(stats.totalUsers)}
                    </div>
                    <div className="text-xl text-muted-foreground font-semibold">{t('dashboard.totalUsers')}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-6xl font-bold text-success mb-4">
                      {formatCurrency(stats.totalVolume)}
                    </div>
                    <div className="text-xl text-muted-foreground font-semibold">{t('dashboard.totalVolume')}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-6xl font-bold text-info mb-4">
                      {formatNumber(stats.activeTrades)}
                    </div>
                    <div className="text-xl text-muted-foreground font-semibold">{t('dashboard.activeTrades')}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Features Section */}
          <div className="py-32 bg-card/30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-20">
                <h2 className="text-5xl md:text-7xl font-bold gradient-text mb-8">
                  {t('landing.features')}
                </h2>
                <p className="text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
                  {t('landing.featuresSubtitle')}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                <div className="card hover-lift text-center p-12">
                  <div className="w-28 h-28 bg-gradient-to-br from-primary/20 to-yellow-400/20 rounded-3xl flex items-center justify-center mx-auto mb-8">
                    <div className="text-primary text-5xl">🤖</div>
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-6">{t('landing.feature1')}</h3>
                  <p className="text-lg text-muted-foreground leading-relaxed">{t('landing.feature1Desc')}</p>
                </div>
                <div className="card hover-lift text-center p-12">
                  <div className="w-28 h-28 bg-gradient-to-br from-success/20 to-green-400/20 rounded-3xl flex items-center justify-center mx-auto mb-8">
                    <div className="text-success text-5xl">🔒</div>
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-6">{t('landing.feature2')}</h3>
                  <p className="text-lg text-muted-foreground leading-relaxed">{t('landing.feature2Desc')}</p>
                </div>
                <div className="card hover-lift text-center p-12">
                  <div className="w-28 h-28 bg-gradient-to-br from-warning/20 to-yellow-400/20 rounded-3xl flex items-center justify-center mx-auto mb-8">
                    <div className="text-warning text-5xl">⚡</div>
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-6">{t('landing.feature3')}</h3>
                  <p className="text-lg text-muted-foreground leading-relaxed">{t('landing.feature3Desc')}</p>
                </div>
                <div className="card hover-lift text-center p-12">
                  <div className="w-28 h-28 bg-gradient-to-br from-info/20 to-blue-400/20 rounded-3xl flex items-center justify-center mx-auto mb-8">
                    <div className="text-info text-5xl">📊</div>
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-6">{t('landing.feature4')}</h3>
                  <p className="text-lg text-muted-foreground leading-relaxed">{t('landing.feature4Desc')}</p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="py-32 bg-gradient-to-r from-primary/10 to-yellow-400/10">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h2 className="text-5xl md:text-7xl font-bold gradient-text mb-8">
                {t('landing.ctaTitle')}
              </h2>
              <p className="text-2xl text-muted-foreground mb-16 max-w-3xl mx-auto leading-relaxed">
                {t('landing.ctaSubtitle')}
              </p>
              <div className="flex flex-col sm:flex-row gap-8 justify-center">
                <Link
                  href={`/${locale}/register`}
                  className="btn-primary text-2xl px-16 py-8 text-xl font-bold shadow-2xl hover:shadow-primary/25 transition-all duration-300 transform hover:scale-105"
                >
                  🚀 {t('landing.startTrading')}
                </Link>
                <Link
                  href={`/${locale}/info`}
                  className="btn-secondary text-2xl px-16 py-8 text-xl font-bold shadow-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                >
                  ℹ️ {t('landing.learnMore')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}