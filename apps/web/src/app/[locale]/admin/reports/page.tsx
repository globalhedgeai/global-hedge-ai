"use client";
import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/lib/translations';
import { formatCurrency } from '@/lib/numberFormat';

interface FinancialReport {
  period: string;
  totalDeposits: number;
  totalWithdrawals: number;
  totalRewards: number;
  netProfit: number;
  userCount: number;
  transactionCount: number;
}

interface UserReport {
  id: string;
  email: string;
  balance: number;
  totalDeposits: number;
  totalWithdrawals: number;
  totalRewards: number;
  referralCount: number;
  createdAt: string;
  lastLoginAt: string | null;
}

export default function AdminReportsPage() {
  const { t, locale } = useTranslation();
  const [reports, setReports] = useState<FinancialReport[]>([]);
  const [userReports, setUserReports] = useState<UserReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchReports();
  }, [selectedPeriod, dateRange]);

  const fetchReports = async () => {
    try {
      const [financialRes, usersRes] = await Promise.all([
        fetch(`/api/admin/reports/financial?period=${selectedPeriod}&start=${dateRange.start}&end=${dateRange.end}`),
        fetch('/api/admin/reports/users')
      ]);

      if (financialRes.ok) {
        const financialData = await financialRes.json();
        setReports(financialData.reports || []);
      }

      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUserReports(usersData.users || []);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = (data: any[], filename: string) => {
    if (data.length === 0) return;
    
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => row[header]).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getTotalStats = () => {
    const totalDeposits = reports.reduce((sum, report) => sum + report.totalDeposits, 0);
    const totalWithdrawals = reports.reduce((sum, report) => sum + report.totalWithdrawals, 0);
    const totalRewards = reports.reduce((sum, report) => sum + report.totalRewards, 0);
    const netProfit = totalDeposits - totalWithdrawals - totalRewards;
    
    return {
      totalDeposits,
      totalWithdrawals,
      totalRewards,
      netProfit
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading reports...</p>
        </div>
      </div>
    );
  }

  const totalStats = getTotalStats();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold gradient-text">Financial Reports</h1>
          </div>
          <p className="text-muted-foreground text-lg">Comprehensive financial and user analytics</p>
        </div>

        {/* Controls */}
        <div className="card mb-6">
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Report Period
                </label>
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value as any)}
                  className="w-full p-3 border border-border rounded-lg bg-background text-foreground"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                  className="w-full p-3 border border-border rounded-lg bg-background text-foreground"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                  className="w-full p-3 border border-border rounded-lg bg-background text-foreground"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => exportToCSV(reports, `financial-report-${selectedPeriod}.csv`)}
                  className="w-full px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-medium"
                >
                  Export CSV
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Deposits</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(totalStats.totalDeposits, locale)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Withdrawals</p>
                  <p className="text-2xl font-bold text-red-600">
                    {formatCurrency(totalStats.totalWithdrawals, locale)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Rewards</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatCurrency(totalStats.totalRewards, locale)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Net Profit</p>
                  <p className={`text-2xl font-bold ${totalStats.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(totalStats.netProfit, locale)}
                  </p>
                </div>
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${totalStats.netProfit >= 0 ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                  <svg className={`w-6 h-6 ${totalStats.netProfit >= 0 ? 'text-green-500' : 'text-red-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Financial Reports Table */}
        <div className="card mb-6">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Financial Reports</h3>
              <button
                onClick={() => exportToCSV(reports, `financial-reports-${selectedPeriod}.csv`)}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 text-sm"
              >
                Export Reports
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Period</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Deposits</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Withdrawals</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Rewards</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Net Profit</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Users</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Transactions</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((report, index) => (
                    <tr key={index} className="border-b border-border hover:bg-muted/50">
                      <td className="py-4 px-4">
                        <p className="text-foreground font-medium">{report.period}</p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-green-600 font-medium">
                          {formatCurrency(report.totalDeposits, locale)}
                        </p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-red-600 font-medium">
                          {formatCurrency(report.totalWithdrawals, locale)}
                        </p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-blue-600 font-medium">
                          {formatCurrency(report.totalRewards, locale)}
                        </p>
                      </td>
                      <td className="py-4 px-4">
                        <p className={`font-medium ${report.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(report.netProfit, locale)}
                        </p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-foreground">{report.userCount}</p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-foreground">{report.transactionCount}</p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* User Reports Table */}
        <div className="card">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">User Reports ({userReports.length})</h3>
              <button
                onClick={() => exportToCSV(userReports, 'user-reports.csv')}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 text-sm"
              >
                Export Users
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-semibold text-foreground">User</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Balance</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Deposits</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Withdrawals</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Rewards</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Referrals</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Joined</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Last Login</th>
                  </tr>
                </thead>
                <tbody>
                  {userReports.map((user) => (
                    <tr key={user.id} className="border-b border-border hover:bg-muted/50">
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium text-foreground">{user.email}</p>
                          <p className="text-sm text-muted-foreground">ID: {user.id.slice(-8)}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-foreground font-medium">
                          {formatCurrency(user.balance, locale)}
                        </p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-green-600 font-medium">
                          {formatCurrency(user.totalDeposits, locale)}
                        </p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-red-600 font-medium">
                          {formatCurrency(user.totalWithdrawals, locale)}
                        </p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-blue-600 font-medium">
                          {formatCurrency(user.totalRewards, locale)}
                        </p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-foreground">{user.referralCount}</p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-sm text-muted-foreground">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-sm text-muted-foreground">
                          {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Never'}
                        </p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
