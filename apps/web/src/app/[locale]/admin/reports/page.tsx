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
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session?.ok || session?.user?.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Access Denied</h2>
          <p className="text-gray-300">You need admin privileges to access this page.</p>
          <a href="/en/admin" className="inline-block bg-yellow-500 text-black px-4 py-2 rounded-md hover:bg-yellow-400 transition-colors mt-4">
            Go to Admin Dashboard
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Financial Reports</h1>
          <p className="text-gray-300 text-lg">Comprehensive financial and user analytics</p>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-white">Financial Reports</h2>
            <a href="/en/admin" className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-500 transition-colors">
              Back to Dashboard
            </a>
          </div>

          {reports?.reports?.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-3 px-4 font-semibold text-white">Period</th>
                    <th className="text-left py-3 px-4 font-semibold text-white">Deposits</th>
                    <th className="text-left py-3 px-4 font-semibold text-white">Withdrawals</th>
                    <th className="text-left py-3 px-4 font-semibold text-white">Rewards</th>
                    <th className="text-left py-3 px-4 font-semibold text-white">Net Profit</th>
                    <th className="text-left py-3 px-4 font-semibold text-white">Users</th>
                    <th className="text-left py-3 px-4 font-semibold text-white">Transactions</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.reports.map((report: any, index: number) => (
                    <tr key={index} className="border-b border-gray-700 hover:bg-gray-700">
                      <td className="py-4 px-4">
                        <p className="text-white font-medium">{report.period}</p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-green-400 font-medium">
                          ${report.totalDeposits?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                        </p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-red-400 font-medium">
                          ${report.totalWithdrawals?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                        </p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-blue-400 font-medium">
                          ${report.totalRewards?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                        </p>
                      </td>
                      <td className="py-4 px-4">
                        <p className={`font-medium ${report.netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          ${report.netProfit?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                        </p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-white">{report.userCount || 0}</p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-white">{report.transactionCount || 0}</p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-700 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <p className="text-xl font-semibold text-gray-300">No reports found</p>
              <p className="text-sm text-gray-400">No financial reports to display</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}