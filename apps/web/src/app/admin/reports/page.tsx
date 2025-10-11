"use client";
import React, { useState, useEffect } from 'react';

export default function AdminReportsPage() {
  const [reports, setReports] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const response = await fetch('/api/me');
      const data = await response.json();
      setSession(data);
      
      if (data.ok && data.user.role === 'ADMIN') {
        fetchReports();
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error('Error checking session:', error);
      setLoading(false);
    }
  };

  const fetchReports = async () => {
    try {
      const response = await fetch('/api/admin/reports/financial');
      const data = await response.json();
      
      if (data.ok) {
        setReports(data);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session?.ok || session?.user?.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">Access Denied</h2>
          <p className="text-muted-foreground">You need admin privileges to access this page.</p>
          <a href="/admin" className="btn-primary mt-4">
            Go to Admin Dashboard
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold gradient-text mb-2">Financial Reports</h1>
          <p className="text-muted-foreground text-lg">Comprehensive financial and user analytics</p>
        </div>

        <div className="card p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-foreground">Financial Reports</h2>
            <a href="/admin" className="btn-secondary">
              Back to Dashboard
            </a>
          </div>

          {reports?.reports?.length > 0 ? (
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
                  {reports.reports.map((report: any, index: number) => (
                    <tr key={index} className="border-b border-border hover:bg-muted/50">
                      <td className="py-4 px-4">
                        <p className="text-foreground font-medium">{report.period}</p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-green-600 font-medium">
                          ${report.totalDeposits?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                        </p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-red-600 font-medium">
                          ${report.totalWithdrawals?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                        </p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-blue-600 font-medium">
                          ${report.totalRewards?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                        </p>
                      </td>
                      <td className="py-4 px-4">
                        <p className={`font-medium ${report.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          ${report.netProfit?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                        </p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-foreground">{report.userCount || 0}</p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-foreground">{report.transactionCount || 0}</p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <p className="text-xl font-semibold text-muted-foreground">No reports found</p>
              <p className="text-sm text-muted-foreground">No financial reports to display</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
