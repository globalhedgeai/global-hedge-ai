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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {isAuthenticated ? (
        /* Authenticated User Dashboard */
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-2xl">
              <span className="text-3xl font-bold text-black">G</span>
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">
              {t('dashboard.title')}
            </h1>
            <p className="text-gray-400 text-lg">
              {t('dashboard.subtitle')}
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 text-center hover:border-yellow-400 transition-all duration-300">
              <div className="text-3xl mb-3">💰</div>
              <div className="text-3xl font-bold text-yellow-400 mb-2">
                {formatCurrency(userBalance)}
              </div>
              <div className="text-sm text-gray-400">{t('common.balance')}</div>
            </div>
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 text-center hover:border-green-400 transition-all duration-300">
              <div className="text-3xl mb-3">👥</div>
              <div className="text-3xl font-bold text-green-400 mb-2">
                {formatNumber(stats.totalUsers)}
              </div>
              <div className="text-sm text-gray-400">{t('dashboard.totalUsers')}</div>
            </div>
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 text-center hover:border-blue-400 transition-all duration-300">
              <div className="text-3xl mb-3">📈</div>
              <div className="text-3xl font-bold text-blue-400 mb-2">
                {formatCurrency(stats.totalVolume)}
              </div>
              <div className="text-sm text-gray-400">{t('dashboard.totalVolume')}</div>
            </div>
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
              <DailyRewardCard />
            </div>
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
              <RandomRewardCard />
            </div>
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4">{t('dashboard.quickActions')}</h3>
              <div className="space-y-3">
                <Link href={`/${locale}/deposit`} className="w-full bg-yellow-400 hover:bg-yellow-500 text-black py-3 px-4 rounded-lg text-center block font-semibold transition-colors">
                  💰 {t('navigation.deposit')}
                </Link>
                <Link href={`/${locale}/withdraw`} className="w-full bg-gray-700 hover:bg-gray-600 text-white py-3 px-4 rounded-lg text-center block font-semibold transition-colors">
                  💸 {t('navigation.withdraw')}
                </Link>
                <Link href={`/${locale}/market`} className="w-full bg-gray-700 hover:bg-gray-600 text-white py-3 px-4 rounded-lg text-center block font-semibold transition-colors">
                  📈 {t('navigation.market')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Professional Landing Page */
        <div className="min-h-screen">
          {/* Hero Section */}
          <div className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/10 to-transparent"></div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
              <div className="text-center">
                {/* Logo */}
                <div className="flex justify-center mb-8">
                  <div className="w-24 h-24 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-3xl flex items-center justify-center shadow-2xl">
                    <span className="text-4xl font-bold text-black">G</span>
                  </div>
                </div>
                
                {/* Main Title */}
                <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
                  {t('landing.title')}
                </h1>
                
                {/* Subtitle */}
                <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
                  {t('landing.subtitle')}
                </p>
                
                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
                  <Link
                    href={`/${locale}/register`}
                    className="bg-yellow-400 hover:bg-yellow-500 text-black py-4 px-12 rounded-xl font-bold text-xl transition-all duration-300 shadow-2xl hover:shadow-yellow-400/25 transform hover:scale-105"
                  >
                    🚀 {t('landing.getStarted')}
                  </Link>
                  <Link
                    href={`/${locale}/login`}
                    className="bg-gray-800 hover:bg-gray-700 text-white py-4 px-12 rounded-xl font-bold text-xl transition-all duration-300 border-2 border-gray-600 hover:border-yellow-400 shadow-2xl"
                  >
                    🔐 {t('landing.login')}
                  </Link>
                </div>

                {/* Trust Indicators */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl mx-auto">
                  <div className="bg-gray-800 border border-gray-700 rounded-2xl p-8 text-center hover:border-yellow-400 transition-all duration-300">
                    <div className="text-4xl font-bold text-yellow-400 mb-3">
                      {formatNumber(stats.totalUsers)}
                    </div>
                    <div className="text-lg text-gray-300 font-medium">{t('dashboard.totalUsers')}</div>
                  </div>
                  <div className="bg-gray-800 border border-gray-700 rounded-2xl p-8 text-center hover:border-green-400 transition-all duration-300">
                    <div className="text-4xl font-bold text-green-400 mb-3">
                      {formatCurrency(stats.totalVolume)}
                    </div>
                    <div className="text-lg text-gray-300 font-medium">{t('dashboard.totalVolume')}</div>
                  </div>
                  <div className="bg-gray-800 border border-gray-700 rounded-2xl p-8 text-center hover:border-blue-400 transition-all duration-300">
                    <div className="text-4xl font-bold text-blue-400 mb-3">
                      {formatNumber(stats.activeTrades)}
                    </div>
                    <div className="text-lg text-gray-300 font-medium">{t('dashboard.activeTrades')}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Features Section */}
          <div className="py-20 bg-gray-800/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                  {t('landing.features')}
                </h2>
                <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                  {t('landing.featuresSubtitle')}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <div className="bg-gray-800 border border-gray-700 rounded-2xl p-8 text-center hover:border-yellow-400 transition-all duration-300 hover:transform hover:scale-105 hover:shadow-2xl">
                  <div className="w-20 h-20 bg-gradient-to-br from-yellow-400/20 to-yellow-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <span className="text-yellow-400 text-4xl">🤖</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">{t('landing.feature1Title')}</h3>
                  <p className="text-gray-300 leading-relaxed text-lg">{t('landing.feature1Desc')}</p>
                </div>
                <div className="bg-gray-800 border border-gray-700 rounded-2xl p-8 text-center hover:border-green-400 transition-all duration-300 hover:transform hover:scale-105 hover:shadow-2xl">
                  <div className="w-20 h-20 bg-gradient-to-br from-green-400/20 to-green-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <span className="text-green-400 text-4xl">🔒</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">{t('landing.feature2Title')}</h3>
                  <p className="text-gray-300 leading-relaxed text-lg">{t('landing.feature2Desc')}</p>
                </div>
                <div className="bg-gray-800 border border-gray-700 rounded-2xl p-8 text-center hover:border-yellow-400 transition-all duration-300 hover:transform hover:scale-105 hover:shadow-2xl">
                  <div className="w-20 h-20 bg-gradient-to-br from-yellow-400/20 to-yellow-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <span className="text-yellow-400 text-4xl">⚡</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">{t('landing.feature3Title')}</h3>
                  <p className="text-gray-300 leading-relaxed text-lg">{t('landing.feature3Desc')}</p>
                </div>
                <div className="bg-gray-800 border border-gray-700 rounded-2xl p-8 text-center hover:border-blue-400 transition-all duration-300 hover:transform hover:scale-105 hover:shadow-2xl">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-400/20 to-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <span className="text-blue-400 text-4xl">📊</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">{t('landing.feature4Title')}</h3>
                  <p className="text-gray-300 leading-relaxed text-lg">{t('landing.feature4Desc')}</p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="py-20 bg-gradient-to-r from-yellow-400/10 to-transparent">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                {t('landing.ctaTitle')}
              </h2>
              <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed">
                {t('landing.ctaSubtitle')}
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Link
                  href={`/${locale}/register`}
                  className="bg-yellow-400 hover:bg-yellow-500 text-black py-4 px-12 rounded-xl font-bold text-xl transition-all duration-300 shadow-2xl hover:shadow-yellow-400/25 transform hover:scale-105"
                >
                  🚀 {t('landing.startTrading')}
                </Link>
                <Link
                  href={`/${locale}/info`}
                  className="bg-gray-800 hover:bg-gray-700 text-white py-4 px-12 rounded-xl font-bold text-xl transition-all duration-300 border-2 border-gray-600 hover:border-yellow-400 shadow-2xl"
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