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
    <div className="min-h-screen bg-gray-900">
      {isAuthenticated ? (
        /* Authenticated User Dashboard */
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="w-16 h-16 bg-yellow-400 rounded-2xl mx-auto mb-4 flex items-center justify-center">
              <span className="text-2xl font-bold text-black">G</span>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Dashboard
            </h1>
            <p className="text-gray-300">
              Welcome to the smart investment platform
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gray-800 rounded-lg p-6 text-center">
              <div className="text-2xl mb-2">💰</div>
              <div className="text-2xl font-bold text-yellow-400 mb-1">
                {formatCurrency(userBalance)}
              </div>
              <div className="text-sm text-gray-300">Balance</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-6 text-center">
              <div className="text-2xl mb-2">👥</div>
              <div className="text-2xl font-bold text-green-400 mb-1">
                {formatNumber(stats.totalUsers)}
              </div>
              <div className="text-sm text-gray-300">Total Users</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-6 text-center">
              <div className="text-2xl mb-2">📈</div>
              <div className="text-2xl font-bold text-blue-400 mb-1">
                {formatCurrency(stats.totalVolume)}
              </div>
              <div className="text-sm text-gray-300">Total Volume</div>
            </div>
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-800 rounded-lg p-6">
              <DailyRewardCard />
            </div>
            <div className="bg-gray-800 rounded-lg p-6">
              <RandomRewardCard />
            </div>
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link href={`/${locale}/deposit`} className="w-full bg-yellow-400 hover:bg-yellow-500 text-black py-3 px-4 rounded-lg text-center block font-semibold transition-colors">
                  💰 Deposit
                </Link>
                <Link href={`/${locale}/withdraw`} className="w-full bg-gray-700 hover:bg-gray-600 text-white py-3 px-4 rounded-lg text-center block font-semibold transition-colors">
                  💸 Withdraw
                </Link>
                <Link href={`/${locale}/market`} className="w-full bg-gray-700 hover:bg-gray-600 text-white py-3 px-4 rounded-lg text-center block font-semibold transition-colors">
                  📈 Market
                </Link>
              </div>
            </div>
          </div>
        </div>
          ) : (
            /* Clean Professional Landing Page */
            <div className="min-h-screen bg-gray-900">
              {/* Professional Header */}
              <div className="bg-gray-800 border-b border-gray-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="flex justify-between items-center py-4">
                    <div className="flex items-center space-x-4">
                      <Link
                        href={`/${locale}/register`}
                        className="bg-yellow-400 hover:bg-yellow-500 text-black px-4 py-2 rounded-md font-semibold text-sm transition-colors"
                      >
                        Create Account
                      </Link>
                      <Link
                        href={`/${locale}/login`}
                        className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-md font-semibold text-sm transition-colors"
                      >
                        Login
                      </Link>
                    </div>
                    
                    <div className="flex items-center space-x-6">
                      <Link href={`/${locale}/market`} className="text-blue-400 hover:text-blue-300 transition-colors text-sm font-medium">
                        Market
                      </Link>
                      <Link href={`/${locale}/info`} className="text-blue-400 hover:text-blue-300 transition-colors text-sm font-medium">
                        About Platform
                      </Link>
                      <Link href={`/${locale}`} className="text-blue-400 hover:text-blue-300 transition-colors text-sm font-medium">
                        Home
                      </Link>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className="text-white font-bold text-sm">Global Hedge AI</span>
                      <div className="w-6 h-6 bg-yellow-400 rounded flex items-center justify-center">
                        <span className="text-black font-bold text-xs">G</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Clean Hero Section */}
              <div className="py-20">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                  <div className="w-20 h-20 bg-yellow-400 rounded-lg mx-auto mb-8 flex items-center justify-center shadow-lg">
                    <span className="text-black font-bold text-3xl">G</span>
                  </div>
                  
                  <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
                    Global Hedge AI
                  </h1>
                  
                  <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
                    Leading Trading and Cloud Mining Platform
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                      href={`/${locale}/register`}
                      className="bg-yellow-400 hover:bg-yellow-500 text-black px-8 py-4 rounded-lg font-semibold text-lg transition-colors shadow-lg hover:shadow-xl"
                    >
                      Get Started
                    </Link>
                    <Link
                      href={`/${locale}/login`}
                      className="bg-gray-700 hover:bg-gray-600 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors border border-gray-600 hover:border-yellow-400"
                    >
                      Login
                    </Link>
                  </div>
                </div>
              </div>

              {/* Professional Features */}
              <div className="py-20 bg-gray-800">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                  <h2 className="text-3xl font-bold text-white text-center mb-12">Features</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    <div className="bg-gray-700 rounded-lg p-6 text-center hover:bg-gray-600 transition-colors">
                      <div className="w-12 h-12 bg-gray-600 rounded-lg mx-auto mb-4 flex items-center justify-center">
                        <span className="text-yellow-400 text-xl">📊</span>
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-3">Detailed Reports</h3>
                      <p className="text-gray-400 text-sm">Track your investment performance with comprehensive reports</p>
                    </div>
                    <div className="bg-gray-700 rounded-lg p-6 text-center hover:bg-gray-600 transition-colors">
                      <div className="w-12 h-12 bg-gray-600 rounded-lg mx-auto mb-4 flex items-center justify-center">
                        <span className="text-yellow-400 text-xl">💰</span>
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-3">Daily Rewards</h3>
                      <p className="text-gray-400 text-sm">Get daily and random rewards to increase your profits</p>
                    </div>
                    <div className="bg-gray-700 rounded-lg p-6 text-center hover:bg-gray-600 transition-colors">
                      <div className="w-12 h-12 bg-gray-600 rounded-lg mx-auto mb-4 flex items-center justify-center">
                        <span className="text-yellow-400 text-xl">🔒</span>
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-3">Advanced Security</h3>
                      <p className="text-gray-400 text-sm">Multi-layer protection for your funds and personal data</p>
                    </div>
                    <div className="bg-gray-700 rounded-lg p-6 text-center hover:bg-gray-600 transition-colors">
                      <div className="w-12 h-12 bg-gray-600 rounded-lg mx-auto mb-4 flex items-center justify-center">
                        <span className="text-yellow-400 text-xl">📈</span>
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-3">Smart Trading</h3>
                      <p className="text-gray-400 text-sm">Use artificial intelligence to make informed trading decisions</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Professional CTA */}
              <div className="py-20">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                  <h2 className="text-4xl font-bold text-white mb-6">
                    Ready to Start Your Investment Journey?
                  </h2>
                  <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
                    Join us today and start building your future wealth
                  </p>
                  <div className="flex flex-col sm:flex-row gap-6 justify-center">
                    <Link
                      href={`/${locale}/register`}
                      className="bg-yellow-400 hover:bg-yellow-500 text-black px-10 py-4 rounded-lg font-semibold text-lg transition-colors shadow-lg hover:shadow-xl"
                    >
                      Start Trading
                    </Link>
                    <Link
                      href={`/${locale}/info`}
                      className="bg-gray-700 hover:bg-gray-600 text-white px-10 py-4 rounded-lg font-semibold text-lg transition-colors border border-gray-600 hover:border-yellow-400"
                    >
                      Learn More
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
    </div>
  );
}