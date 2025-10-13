"use client";
import React, { useState, useEffect } from 'react';

interface Transaction {
  id: string;
  type: string;
  amount: number;
  status: string;
  userId: string;
  createdAt?: string;
  userEmail?: string;
}

interface Report {
  period: string;
  users: number;
  transactions: number;
  totalDeposits?: number;
  totalWithdrawals?: number;
  totalRewards?: number;
  netProfit?: number;
  userCount?: number;
  transactionCount?: number;
}

interface Session {
  user: {
    id: string;
    email: string;
    role: string;
  };
  ok?: boolean;
}

export default function AdminReportsPage() {
  const [reports, setReports] = useState<{ reports: Report[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editData, setEditData] = useState({
    date: '',
    time: '',
    amount: 0,
    status: 'PENDING'
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
        fetchReports();
        fetchTransactions();
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

  const fetchTransactions = async () => {
    try {
      const response = await fetch('/api/admin/transactions');
      const data = await response.json();
      
      if (data.ok) {
        setTransactions(data.transactions || []);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const handleEditTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/admin/transactions/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transactionId: selectedTransaction?.id,
          ...editData
        }),
      });
      
      const data = await response.json();
      
      if (data.ok) {
        setShowEditForm(false);
        setSelectedTransaction(null);
        fetchTransactions();
        alert('Transaction updated successfully!');
      } else {
        alert('Error updating transaction: ' + data.error);
      }
    } catch (error) {
      console.error('Error updating transaction:', error);
      alert('Error updating transaction');
    }
  };

  const startEdit = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    const date = new Date(transaction.createdAt || '');
    setEditData({
      date: date.toISOString().split('T')[0],
      time: date.toTimeString().split(' ')[0],
      amount: transaction.amount || 0,
      status: transaction.status || 'PENDING'
    });
    setShowEditForm(true);
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
          <Link href="/en/admin" className="inline-block bg-yellow-500 text-black px-4 py-2 rounded-md hover:bg-yellow-400 transition-colors mt-4">
            Go to Admin Dashboard
          </Link>
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
            <div className="flex gap-2">
              <button 
                onClick={fetchTransactions}
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-400 transition-colors"
              >
                Refresh Transactions
              </button>
              <Link href="/en/admin" className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-500 transition-colors">
                Back to Dashboard
              </Link>
            </div>
          </div>

          {reports?.reports && reports.reports.length > 0 ? (
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
                  {reports?.reports?.map((report: {
                    period: string;
                    totalUsers: number;
                    totalTransactions: number;
                    totalVolume: number;
                    totalRevenue: number;
                  }, index: number) => (
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

          {/* Transactions Management Section */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-white mb-4">Transaction Management</h3>
            <p className="text-gray-400 mb-4">Edit deposit and withdrawal dates and details</p>
            
            {transactions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-3 px-4 font-semibold text-white">Type</th>
                      <th className="text-left py-3 px-4 font-semibold text-white">User</th>
                      <th className="text-left py-3 px-4 font-semibold text-white">Amount</th>
                      <th className="text-left py-3 px-4 font-semibold text-white">Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-white">Date</th>
                      <th className="text-left py-3 px-4 font-semibold text-white">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((transaction) => (
                      <tr key={transaction.id} className="border-b border-gray-700 hover:bg-gray-700">
                        <td className="py-4 px-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                            transaction.type === 'DEPOSIT' ? 'text-green-500 bg-green-50' :
                            transaction.type === 'WITHDRAWAL' ? 'text-red-500 bg-red-50' :
                            'text-blue-500 bg-blue-50'
                          }`}>
                            {transaction.type}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <p className="text-white font-medium">{transaction.userEmail || `User ${transaction.userId}`}</p>
                          <p className="text-sm text-gray-400">ID: {transaction.userId?.slice(-8)}</p>
                        </td>
                        <td className="py-4 px-4">
                          <p className={`font-medium ${
                            transaction.type === 'DEPOSIT' ? 'text-green-400' : 'text-red-400'
                          }`}>
                            ${transaction.amount?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                          </p>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                            transaction.status === 'APPROVED' ? 'text-green-500 bg-green-50' :
                            transaction.status === 'REJECTED' ? 'text-red-500 bg-red-50' :
                            'text-yellow-500 bg-yellow-50'
                          }`}>
                            {transaction.status}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <p className="text-sm text-gray-400">
                            {new Date(transaction.createdAt || '').toLocaleDateString()}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(transaction.createdAt || '').toLocaleTimeString()}
                          </p>
                        </td>
                        <td className="py-4 px-4">
                          <button
                            onClick={() => startEdit(transaction)}
                            className="bg-yellow-500 text-black px-3 py-1 rounded text-sm hover:bg-yellow-400 transition-colors"
                          >
                            Edit Date
                          </button>
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <p className="text-xl font-semibold text-gray-300">No transactions found</p>
                <p className="text-sm text-gray-400">No transactions to display</p>
              </div>
            )}
          </div>
        </div>

        {/* Edit Transaction Form */}
        {showEditForm && selectedTransaction && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
              <h3 className="text-xl font-semibold text-white mb-4">
                Edit Transaction: {selectedTransaction.type}
              </h3>
              <form onSubmit={handleEditTransaction}>
                <div className="mb-4">
                  <label className="block text-white text-sm font-medium mb-2">Transaction Date</label>
                  <input
                    type="date"
                    value={editData.date}
                    onChange={(e) => setEditData({...editData, date: e.target.value})}
                    className="w-full bg-gray-700 text-white px-3 py-2 rounded-md border border-gray-600"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-white text-sm font-medium mb-2">Transaction Time</label>
                  <input
                    type="time"
                    value={editData.time}
                    onChange={(e) => setEditData({...editData, time: e.target.value})}
                    className="w-full bg-gray-700 text-white px-3 py-2 rounded-md border border-gray-600"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-white text-sm font-medium mb-2">Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editData.amount}
                    onChange={(e) => setEditData({...editData, amount: parseFloat(e.target.value) || 0})}
                    className="w-full bg-gray-700 text-white px-3 py-2 rounded-md border border-gray-600"
                    required
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-white text-sm font-medium mb-2">Status</label>
                  <select
                    value={editData.status}
                    onChange={(e) => setEditData({...editData, status: e.target.value})}
                    className="w-full bg-gray-700 text-white px-3 py-2 rounded-md border border-gray-600"
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="APPROVED">APPROVED</option>
                    <option value="REJECTED">REJECTED</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="bg-yellow-500 text-black px-4 py-2 rounded-md hover:bg-yellow-400 transition-colors"
                  >
                    Update Transaction
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditForm(false);
                      setSelectedTransaction(null);
                    }}
                    className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-500 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}