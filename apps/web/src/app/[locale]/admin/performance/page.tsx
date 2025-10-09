'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation, useLanguage } from '@/lib/translations';

interface PerformanceMetrics {
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
  totalDeposits: number;
  totalWithdrawals: number;
  totalRewards: number;
  netProfit: number;
  pendingDeposits: number;
  pendingWithdrawals: number;
  dailyRewardsClaimed: number;
  randomRewardsClaimed: number;
  totalReferrals: number;
  tier1Users: number;
  tier2Users: number;
  tier3Users: number;
  lastUpdated: string;
}

interface TrendData {
  dates: string[];
  users: number[];
  deposits: number[];
  withdrawals: number[];
  rewards: number[];
}

interface TopPerformers {
  topDepositors: Array<{ email: string; amount: number }>;
  topReferrers: Array<{ email: string; count: number; tier: number }>;
  topRewardEarners: Array<{ email: string; amount: number }>;
}

interface SystemAlert {
  type: 'warning' | 'error' | 'info';
  message: string;
  timestamp: string;
}

export default function PerformanceMonitoringPage() {
  const { t } = useTranslation();
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [trends, setTrends] = useState<TrendData | null>(null);
  const [performers, setPerformers] = useState<TopPerformers | null>(null);
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month' | 'all'>('all');
  const [activeTab, setActiveTab] = useState<'overview' | 'trends' | 'performers' | 'alerts'>('overview');

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [selectedPeriod]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch metrics
      const metricsResponse = await fetch(`/api/admin/performance?type=metrics&period=${selectedPeriod}`);
      const metricsData = await metricsResponse.json();
      if (metricsData.ok) {
        setMetrics(metricsData.metrics);
      }

      // Fetch trends
      const trendsResponse = await fetch('/api/admin/performance?type=trends&days=30');
      const trendsData = await trendsResponse.json();
      if (trendsData.ok) {
        setTrends(trendsData.trends);
      }

      // Fetch performers
      const performersResponse = await fetch('/api/admin/performance?type=performers');
      const performersData = await performersResponse.json();
      if (performersData.ok) {
        setPerformers(performersData.performers);
      }

      // Fetch alerts
      const alertsResponse = await fetch('/api/admin/performance?type=alerts');
      const alertsData = await alertsResponse.json();
      if (alertsData.ok) {
        setAlerts(alertsData.alerts);
      }
    } catch (error) {
      console.error('Failed to fetch performance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  if (loading && !metrics) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center gap-3 text-muted-foreground">
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm">Loading performance data...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold gradient-text mb-2">Performance Monitoring</h1>
              <p className="text-muted-foreground text-lg">Real-time platform performance and analytics</p>
            </div>
            <div className="flex items-center gap-4">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value as any)}
                className="input"
              >
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="all">All Time</option>
              </select>
              <button
                onClick={fetchData}
                className="btn-secondary"
                disabled={loading}
              >
                <svg className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 animate-fade-in">
          <div className="flex space-x-1 bg-accent/50 p-1 rounded-lg">
            {[
              { id: 'overview', label: 'Overview', icon: '📊' },
              { id: 'trends', label: 'Trends', icon: '📈' },
              { id: 'performers', label: 'Top Performers', icon: '🏆' },
              { id: 'alerts', label: 'Alerts', icon: '⚠️' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && metrics && (
          <div className="space-y-6 animate-fade-in">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="card text-center">
                <div className="p-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-blue-400 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Total Users</h3>
                  <p className="text-2xl font-bold text-primary">{formatNumber(metrics.totalUsers)}</p>
                  <p className="text-sm text-muted-foreground mt-1">+{formatNumber(metrics.newUsersToday)} today</p>
                </div>
              </div>

              <div className="card text-center">
                <div className="p-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-success to-green-400 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Total Deposits</h3>
                  <p className="text-2xl font-bold text-success">{formatCurrency(metrics.totalDeposits)}</p>
                  <p className="text-sm text-muted-foreground mt-1">{metrics.pendingDeposits} pending</p>
                </div>
              </div>

              <div className="card text-center">
                <div className="p-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-warning to-yellow-400 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Total Rewards</h3>
                  <p className="text-2xl font-bold text-warning">{formatCurrency(metrics.totalRewards)}</p>
                  <p className="text-sm text-muted-foreground mt-1">{metrics.dailyRewardsClaimed + metrics.randomRewardsClaimed} claims</p>
                </div>
              </div>

              <div className="card text-center">
                <div className="p-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-info to-blue-400 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Net Profit</h3>
                  <p className={`text-2xl font-bold ${metrics.netProfit >= 0 ? 'text-success' : 'text-error'}`}>
                    {formatCurrency(metrics.netProfit)}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">Platform earnings</p>
                </div>
              </div>
            </div>

            {/* Detailed Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="card">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">User Statistics</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Active Users</span>
                      <span className="font-semibold">{formatNumber(metrics.activeUsers)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">New Users Today</span>
                      <span className="font-semibold text-success">+{formatNumber(metrics.newUsersToday)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Referrals</span>
                      <span className="font-semibold">{formatNumber(metrics.totalReferrals)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Tier Distribution</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tier 1 (25%)</span>
                      <span className="font-semibold">{formatNumber(metrics.tier1Users)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tier 2 (30%)</span>
                      <span className="font-semibold">{formatNumber(metrics.tier2Users)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tier 3 (35%)</span>
                      <span className="font-semibold">{formatNumber(metrics.tier3Users)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Transaction Status */}
            <div className="card">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Transaction Status</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-warning mb-2">{metrics.pendingDeposits}</div>
                    <p className="text-sm text-muted-foreground">Pending Deposits</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-success mb-2">{metrics.pendingDeposits + metrics.pendingDeposits}</div>
                    <p className="text-sm text-muted-foreground">Approved Deposits</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-warning mb-2">{metrics.pendingWithdrawals}</div>
                    <p className="text-sm text-muted-foreground">Pending Withdrawals</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Trends Tab */}
        {activeTab === 'trends' && trends && (
          <div className="space-y-6 animate-fade-in">
            <div className="card">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">30-Day Trends</h3>
                <div className="h-64 flex items-center justify-center bg-muted/20 rounded-lg">
                  <p className="text-muted-foreground">Chart visualization would go here</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Top Performers Tab */}
        {activeTab === 'performers' && performers && (
          <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="card">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Top Depositors</h3>
                  <div className="space-y-3">
                    {performers.topDepositors.map((user, index) => (
                      <div key={user.email} className="flex justify-between items-center">
                        <div>
                          <p className="font-medium text-foreground">{user.email}</p>
                          <p className="text-sm text-muted-foreground">#{index + 1}</p>
                        </div>
                        <span className="font-semibold text-success">{formatCurrency(user.amount)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Top Referrers</h3>
                  <div className="space-y-3">
                    {performers.topReferrers.map((user, index) => (
                      <div key={user.email} className="flex justify-between items-center">
                        <div>
                          <p className="font-medium text-foreground">{user.email}</p>
                          <p className="text-sm text-muted-foreground">Tier {user.tier}</p>
                        </div>
                        <span className="font-semibold text-primary">{user.count} invites</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Top Reward Earners</h3>
                  <div className="space-y-3">
                    {performers.topRewardEarners.map((user, index) => (
                      <div key={user.email} className="flex justify-between items-center">
                        <div>
                          <p className="font-medium text-foreground">{user.email}</p>
                          <p className="text-sm text-muted-foreground">#{index + 1}</p>
                        </div>
                        <span className="font-semibold text-warning">{formatCurrency(user.amount)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Alerts Tab */}
        {activeTab === 'alerts' && (
          <div className="space-y-6 animate-fade-in">
            <div className="card">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">System Alerts</h3>
                {alerts.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="text-muted-foreground">All systems operating normally</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {alerts.map((alert, index) => (
                      <div key={index} className={`p-4 rounded-lg border ${
                        alert.type === 'error' ? 'bg-error/10 border-error/20' :
                        alert.type === 'warning' ? 'bg-warning/10 border-warning/20' :
                        'bg-info/10 border-info/20'
                      }`}>
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${
                            alert.type === 'error' ? 'bg-error' :
                            alert.type === 'warning' ? 'bg-warning' :
                            'bg-info'
                          }`}></div>
                          <p className="font-medium text-foreground">{alert.message}</p>
                          <span className="text-sm text-muted-foreground ml-auto">
                            {new Date(alert.timestamp).toLocaleString(locale === 'ar' ? 'ar-SA' : 'en-US')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Last Updated */}
        {metrics && (
          <div className="text-center text-sm text-muted-foreground mt-8">
            Last updated: {new Date(metrics.lastUpdated).toLocaleString(locale === 'ar' ? 'ar-SA' : 'en-US')}
          </div>
        )}
      </div>
    </div>
  );
}
