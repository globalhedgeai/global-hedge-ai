'use client';

import { useEffect, useState } from 'react';
import { useTranslation, useLanguage } from '@/lib/translations';
import AuthGuard from '@/components/AuthGuard';

interface FinancialReport {
  totalDeposits: number;
  totalWithdrawals: number;
  totalRewards: number;
  netProfit: number;
  monthlyData: MonthlyData[];
  dailyData: DailyData[];
}

interface MonthlyData {
  month: string;
  deposits: number;
  withdrawals: number;
  rewards: number;
  profit: number;
}

interface DailyData {
  date: string;
  deposits: number;
  withdrawals: number;
  rewards: number;
  profit: number;
}

export default function FinancialReportsPage() {
  const { t } = useTranslation();
  const { locale } = useLanguage();
  const [report, setReport] = useState<FinancialReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'1d' | '1w' | '1m' | '3m' | '6m' | '1y'>('1m');
  const isRTL = locale === 'ar';

  useEffect(() => {
    fetchFinancialReport();
  }, [selectedPeriod]);

  async function fetchFinancialReport() {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/financial-reports?period=${selectedPeriod}`);
      const data = await response.json();

      if (data.ok) {
        setReport(data.report);
      } else {
        setError(data.error || t('errors.generic'));
      }
    } catch (err) {
      setError(t('errors.networkError'));
    } finally {
      setLoading(false);
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(locale === 'ar' ? 'ar-SA' : 'en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return new Intl.NumberFormat(locale === 'ar' ? 'ar-SA' : 'en-US', {
      style: 'percent',
      minimumFractionDigits: 2,
    }).format(value / 100);
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

  if (!report) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="card">
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{t('reports.noData')}</h3>
              <p className="text-muted-foreground">{t('reports.noDataDesc')}</p>
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
            <div className="w-10 h-10 bg-gradient-to-br from-success to-green-400 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold gradient-text">{t('reports.title')}</h1>
          </div>
          <p className="text-muted-foreground text-lg">{t('reports.subtitle')}</p>
        </div>

        {/* Period Selector */}
        <div className="mb-6 animate-fade-in">
          <div className="card">
            <div className="p-4">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-foreground">{t('reports.selectPeriod')}:</span>
                <div className="flex gap-2">
                  {[
                    { key: '7d', label: t('reports.last7Days') },
                    { key: '30d', label: t('reports.last30Days') },
                    { key: '90d', label: t('reports.last90Days') },
                    { key: '1y', label: t('reports.lastYear') }
                  ].map((period) => (
                    <button
                      key={period.key}
                      onClick={() => setSelectedPeriod(period.key as '1d' | '1w' | '1m' | '3m' | '6m' | '1y')}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 ${
                        selectedPeriod === period.key
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-accent text-accent-foreground hover:bg-accent/80'
                      }`}
                    >
                      {period.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-fade-in">
          <div className="card text-center">
            <div className="p-6">
              <div className="w-12 h-12 bg-gradient-to-br from-success to-green-400 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{t('reports.totalDeposits')}</h3>
              <p className="text-2xl font-bold text-success">{formatCurrency(report.totalDeposits)}</p>
            </div>
          </div>

          <div className="card text-center">
            <div className="p-6">
              <div className="w-12 h-12 bg-gradient-to-br from-error to-red-400 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4m16 0l-4-4m4 4l-4 4" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{t('reports.totalWithdrawals')}</h3>
              <p className="text-2xl font-bold text-error">{formatCurrency(report.totalWithdrawals)}</p>
            </div>
          </div>

          <div className="card text-center">
            <div className="p-6">
              <div className="w-12 h-12 bg-gradient-to-br from-warning to-yellow-400 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{t('reports.totalRewards')}</h3>
              <p className="text-2xl font-bold text-warning">{formatCurrency(report.totalRewards)}</p>
            </div>
          </div>

          <div className="card text-center">
            <div className="p-6">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-blue-400 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{t('reports.netProfit')}</h3>
              <p className={`text-2xl font-bold ${report.netProfit >= 0 ? 'text-success' : 'text-error'}`}>
                {formatCurrency(report.netProfit)}
              </p>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8 animate-fade-in">
          {/* Monthly Performance Chart */}
          <div className="card">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">{t('reports.monthlyPerformance')}</h3>
              <div className="space-y-4">
                {report.monthlyData.map((month, index) => (
                  <div key={month.month} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">{month.month}</span>
                      <span className={`text-sm font-semibold ${month.profit >= 0 ? 'text-success' : 'text-error'}`}>
                        {formatCurrency(month.profit)}
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${month.profit >= 0 ? 'bg-success' : 'bg-error'}`}
                        style={{ width: `${Math.min(Math.abs(month.profit) / Math.max(...report.monthlyData.map(m => Math.abs(m.profit))) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Daily Performance Chart */}
          <div className="card">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">{t('reports.dailyPerformance')}</h3>
              <div className="space-y-3">
                {report.dailyData.slice(-7).map((day, index) => (
                  <div key={day.date} className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{day.date}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-success">+{formatCurrency(day.rewards)}</span>
                      <span className={`text-sm font-medium ${day.profit >= 0 ? 'text-success' : 'text-error'}`}>
                        {formatCurrency(day.profit)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="card animate-fade-in">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-6">{t('reports.performanceMetrics')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary mb-2">
                  {formatPercentage((report.totalRewards / Math.max(report.totalDeposits, 1)) * 100)}
                </div>
                <p className="text-sm text-muted-foreground">{t('reports.rewardRate')}</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-success mb-2">
                  {formatCurrency(report.totalRewards / Math.max(report.monthlyData.length, 1))}
                </div>
                <p className="text-sm text-muted-foreground">{t('reports.avgMonthlyReward')}</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-warning mb-2">
                  {report.netProfit >= 0 ? '+' : ''}{formatPercentage((report.netProfit / Math.max(report.totalDeposits, 1)) * 100)}
                </div>
                <p className="text-sm text-muted-foreground">{t('reports.totalReturn')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </AuthGuard>
  );
}
