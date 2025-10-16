'use client';
import { useEffect, useState } from 'react';
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
        /* Professional Dashboard for Authenticated Users */
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-primary to-yellow-400 rounded-xl flex items-center justify-center">
                  <span className="text-xl font-bold text-primary-foreground">G</span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">{t('dashboard.title')}</h1>
                  <p className="text-sm text-muted-foreground">{t('dashboard.subtitle')}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">Total Balance</div>
                  <div className="text-xl font-bold text-primary">{formatCurrency(userBalance)}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Portfolio Value</p>
                  <p className="text-2xl font-bold text-foreground">{formatCurrency(userBalance)}</p>
                </div>
                <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                  <span className="text-primary text-lg">💰</span>
                </div>
              </div>
            </div>
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Users</p>
                  <p className="text-2xl font-bold text-success">{formatNumber(stats.totalUsers)}</p>
                </div>
                <div className="w-10 h-10 bg-success/20 rounded-lg flex items-center justify-center">
                  <span className="text-success text-lg">👥</span>
                </div>
              </div>
            </div>
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">24h Volume</p>
                  <p className="text-2xl font-bold text-info">{formatCurrency(stats.totalVolume)}</p>
                </div>
                <div className="w-10 h-10 bg-info/20 rounded-lg flex items-center justify-center">
                  <span className="text-info text-lg">📈</span>
                </div>
              </div>
            </div>
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Active Trades</p>
                  <p className="text-2xl font-bold text-warning">{formatNumber(stats.activeTrades)}</p>
                </div>
                <div className="w-10 h-10 bg-warning/20 rounded-lg flex items-center justify-center">
                  <span className="text-warning text-lg">⚡</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Rewards */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-card border border-border rounded-xl p-6">
                <DailyRewardCard />
              </div>
              <div className="bg-card border border-border rounded-xl p-6">
                <RandomRewardCard />
              </div>
            </div>

            {/* Right Column - Quick Actions */}
            <div className="space-y-6">
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">{t('dashboard.quickActions')}</h3>
                <div className="space-y-3">
                  <Link 
                    href={`/${locale}/deposit`} 
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                  >
                    <span>💰</span>
                    <span>{t('navigation.deposit')}</span>
                  </Link>
                  <Link 
                    href={`/${locale}/withdraw`} 
                    className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                  >
                    <span>💸</span>
                    <span>{t('navigation.withdraw')}</span>
                  </Link>
                  <Link 
                    href={`/${locale}/market`} 
                    className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                  >
                    <span>📈</span>
                    <span>{t('navigation.market')}</span>
                  </Link>
                </div>
              </div>

              {/* Market Overview */}
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Market Overview</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
                        <span className="text-primary text-sm">₿</span>
                      </div>
                      <div>
                        <div className="font-medium text-foreground">BTC/USDT</div>
                        <div className="text-xs text-muted-foreground">Bitcoin</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-foreground">$43,250.00</div>
                      <div className="text-xs text-success">+2.45%</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-success/20 rounded-lg flex items-center justify-center">
                        <span className="text-success text-sm">Ξ</span>
                      </div>
                      <div>
                        <div className="font-medium text-foreground">ETH/USDT</div>
                        <div className="text-xs text-muted-foreground">Ethereum</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-foreground">$2,650.00</div>
                      <div className="text-xs text-success">+1.85%</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-info/20 rounded-lg flex items-center justify-center">
                        <span className="text-info text-sm">B</span>
                      </div>
                      <div>
                        <div className="font-medium text-foreground">BNB/USDT</div>
                        <div className="text-xs text-muted-foreground">Binance Coin</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-foreground">$315.00</div>
                      <div className="text-xs text-error">-0.85%</div>
                    </div>
                  </div>
                </div>
                <Link 
                  href={`/${locale}/market`} 
                  className="w-full mt-4 bg-accent hover:bg-accent/90 text-accent-foreground py-2 px-4 rounded-lg text-sm font-medium transition-colors text-center block"
                >
                  View All Markets
                </Link>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Professional Landing Page for Non-Authenticated Users */
        <div className="min-h-screen">
          {/* Hero Section */}
          <div className="relative bg-gradient-to-br from-background via-background to-primary/5">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
              <div className="text-center">
                {/* Logo */}
                <div className="flex justify-center mb-8">
                  <div className="w-20 h-20 bg-gradient-to-r from-primary to-yellow-400 rounded-2xl flex items-center justify-center shadow-2xl">
                    <span className="text-3xl font-bold text-primary-foreground">G</span>
                  </div>
                </div>
                
                {/* Main Title */}
                <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
                  {t('landing.title')}
                </h1>
                
                {/* Subtitle */}
                <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
                  {t('landing.subtitle')}
                </p>
                
                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
                  <Link
                    href={`/${locale}/register`}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground py-4 px-8 rounded-xl font-semibold text-lg transition-colors shadow-lg hover:shadow-xl"
                  >
                    🚀 {t('landing.getStarted')}
                  </Link>
                  <Link
                    href={`/${locale}/login`}
                    className="bg-secondary hover:bg-secondary/90 text-secondary-foreground py-4 px-8 rounded-xl font-semibold text-lg transition-colors border border-border"
                  >
                    🔐 {t('landing.login')}
                  </Link>
                </div>

                {/* Trust Indicators */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl mx-auto">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-primary mb-2">
                      {formatNumber(stats.totalUsers)}
                    </div>
                    <div className="text-lg text-muted-foreground font-medium">{t('dashboard.totalUsers')}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-success mb-2">
                      {formatCurrency(stats.totalVolume)}
                    </div>
                    <div className="text-lg text-muted-foreground font-medium">{t('dashboard.totalVolume')}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-info mb-2">
                      {formatNumber(stats.activeTrades)}
                    </div>
                    <div className="text-lg text-muted-foreground font-medium">{t('dashboard.activeTrades')}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Features Section */}
          <div className="py-20 bg-card/30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                  {t('landing.features')}
                </h2>
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                  {t('landing.featuresSubtitle')}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <div className="bg-card border border-border rounded-2xl p-8 text-center hover:shadow-xl transition-shadow">
                  <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <span className="text-primary text-3xl">🤖</span>
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-4">{t('landing.feature1Title')}</h3>
                  <p className="text-muted-foreground leading-relaxed">{t('landing.feature1Desc')}</p>
                </div>
                <div className="bg-card border border-border rounded-2xl p-8 text-center hover:shadow-xl transition-shadow">
                  <div className="w-16 h-16 bg-success/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <span className="text-success text-3xl">🔒</span>
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-4">{t('landing.feature2Title')}</h3>
                  <p className="text-muted-foreground leading-relaxed">{t('landing.feature2Desc')}</p>
                </div>
                <div className="bg-card border border-border rounded-2xl p-8 text-center hover:shadow-xl transition-shadow">
                  <div className="w-16 h-16 bg-warning/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <span className="text-warning text-3xl">⚡</span>
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-4">{t('landing.feature3Title')}</h3>
                  <p className="text-muted-foreground leading-relaxed">{t('landing.feature3Desc')}</p>
                </div>
                <div className="bg-card border border-border rounded-2xl p-8 text-center hover:shadow-xl transition-shadow">
                  <div className="w-16 h-16 bg-info/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <span className="text-info text-3xl">📊</span>
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-4">{t('landing.feature4Title')}</h3>
                  <p className="text-muted-foreground leading-relaxed">{t('landing.feature4Desc')}</p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="py-20 bg-gradient-to-r from-primary/10 to-yellow-400/10">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                {t('landing.ctaTitle')}
              </h2>
              <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
                {t('landing.ctaSubtitle')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href={`/${locale}/register`}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground py-4 px-8 rounded-xl font-semibold text-lg transition-colors shadow-lg hover:shadow-xl"
                >
                  🚀 {t('landing.startTrading')}
                </Link>
                <Link
                  href={`/${locale}/info`}
                  className="bg-secondary hover:bg-secondary/90 text-secondary-foreground py-4 px-8 rounded-xl font-semibold text-lg transition-colors border border-border"
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