"use client";
import React, { useState, useEffect } from 'react';

interface PlatformStats {
  totalUsers: number;
  totalDeposits: number;
  totalWithdrawals: number;
  totalBalance: number;
  customMessage: string;
}

interface Session {
  user: {
    id: string;
    email: string;
    role: string;
  };
  ok?: boolean;
}

export default function AdminStatsManagementPage() {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [editing, setEditing] = useState(false);
  const [editStats, setEditStats] = useState({
    totalUsers: 0,
    totalDeposits: 0,
    totalWithdrawals: 0,
    totalBalance: 0,
    customMessage: ''
  });

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const response = await fetch('/api/me');
      const data = await response.json();
      setSession(data);
      
      if (data.ok && data.user.role === 'ADMIN') {
        fetchStats();
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error('Error checking session:', error);
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/platform-stats');
      const data = await response.json();
      
      if (data.ok) {
        setStats(data.stats);
        setEditStats({
          totalUsers: data.stats.overview?.totalUsers || 0,
          totalDeposits: data.stats.overview?.totalDeposits || 0,
          totalWithdrawals: data.stats.overview?.totalWithdrawals || 0,
          totalBalance: data.stats.overview?.totalBalance || 0,
          customMessage: ''
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      // Here you would typically save to a database or config file
      // For now, we'll just update the local state
      setStats({
        ...stats,
        totalUsers: editStats.totalUsers,
        totalDeposits: editStats.totalDeposits,
        totalWithdrawals: editStats.totalWithdrawals,
        totalBalance: editStats.totalBalance,
        customMessage: stats?.customMessage || ''
      });
      
      setEditing(false);
      alert('Statistics updated successfully!');
    } catch (error) {
      console.error('Error saving stats:', error);
      alert('Error saving statistics');
    }
  };

  const handleReset = () => {
    fetchStats();
    setEditing(false);
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
          <h1 className="text-3xl font-bold text-white mb-2">Statistics Management</h1>
          <p className="text-gray-300 text-lg">Edit platform statistics and metrics</p>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-white">Platform Statistics</h2>
            <div className="flex gap-2">
              {!editing ? (
                <button
                  onClick={() => setEditing(true)}
                  className="bg-yellow-500 text-black px-4 py-2 rounded-md hover:bg-yellow-400 transition-colors"
                >
                  Edit Statistics
                </button>
              ) : (
                <>
                  <button
                    onClick={handleSave}
                    className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-400 transition-colors"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={handleReset}
                    className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                </>
              )}
              <a href="/en/admin" className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-500 transition-colors">
                Back to Dashboard
              </a>
            </div>
          </div>

          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Total Users */}
              <div className="bg-gray-700 p-6 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Total Users</p>
                    {editing ? (
                      <input
                        type="number"
                        value={editStats.totalUsers}
                        onChange={(e) => setEditStats({...editStats, totalUsers: parseInt(e.target.value) || 0})}
                        className="text-2xl font-bold text-white bg-gray-600 border border-gray-500 rounded px-2 py-1 w-full"
                      />
                    ) : (
                      <p className="text-2xl font-bold text-white">{stats.totalUsers || 0}</p>
                    )}
                  </div>
                  <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Total Deposits */}
              <div className="bg-gray-700 p-6 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Total Deposits</p>
                    {editing ? (
                      <input
                        type="number"
                        value={editStats.totalDeposits}
                        onChange={(e) => setEditStats({...editStats, totalDeposits: parseFloat(e.target.value) || 0})}
                        className="text-2xl font-bold text-white bg-gray-600 border border-gray-500 rounded px-2 py-1 w-full"
                      />
                    ) : (
                      <p className="text-2xl font-bold text-white">${Number(stats.totalDeposits || 0).toLocaleString()}</p>
                    )}
                  </div>
                  <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Total Withdrawals */}
              <div className="bg-gray-700 p-6 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Total Withdrawals</p>
                    {editing ? (
                      <input
                        type="number"
                        value={editStats.totalWithdrawals}
                        onChange={(e) => setEditStats({...editStats, totalWithdrawals: parseFloat(e.target.value) || 0})}
                        className="text-2xl font-bold text-white bg-gray-600 border border-gray-500 rounded px-2 py-1 w-full"
                      />
                    ) : (
                      <p className="text-2xl font-bold text-white">${Number(stats.totalWithdrawals || 0).toLocaleString()}</p>
                    )}
                  </div>
                  <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Total Balance */}
              <div className="bg-gray-700 p-6 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Total Balance</p>
                    {editing ? (
                      <input
                        type="number"
                        value={editStats.totalBalance}
                        onChange={(e) => setEditStats({...editStats, totalBalance: parseFloat(e.target.value) || 0})}
                        className="text-2xl font-bold text-white bg-gray-600 border border-gray-500 rounded px-2 py-1 w-full"
                      />
                    ) : (
                      <p className="text-2xl font-bold text-white">${Number(stats.totalBalance || 0).toLocaleString()}</p>
                    )}
                  </div>
                  <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Additional Statistics */}
          {stats && (
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-700 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-white mb-4">Pending Transactions</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Pending Deposits:</span>
                    <span className="text-yellow-400 font-medium">0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Pending Withdrawals:</span>
                    <span className="text-yellow-400 font-medium">0</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-700 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-white mb-4">Transaction Counts</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Total Deposits:</span>
                    <span className="text-green-400 font-medium">0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Total Withdrawals:</span>
                    <span className="text-blue-400 font-medium">0</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {editing && (
            <div className="mt-8 bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-lg">
              <p className="text-yellow-400 text-sm">
                <strong>Note:</strong> Changes made here will affect the displayed statistics on the platform. 
                Make sure the values are accurate before saving.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
