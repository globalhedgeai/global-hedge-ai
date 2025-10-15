"use client";
import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

interface Transaction {
  id: string;
  type: 'DEPOSIT' | 'WITHDRAWAL';
  amount: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  userId: string;
  createdAt: string;
  cryptocurrency?: string;
  toAddress?: string;
  txId?: string;
}

interface Session {
  user: {
    id: string;
    email: string;
    role: string;
  };
  ok?: boolean;
}

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [filter, setFilter] = useState<'all' | 'deposits' | 'withdrawals'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'PENDING' | 'APPROVED' | 'REJECTED'>('all');

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const checkSession = useCallback(async () => {
    try {
      const response = await fetch('/api/me');
      const data = await response.json();
      setSession(data);
      
      if (data.ok && data.user.role === 'ADMIN') {
        fetchTransactions();
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error('Error checking session:', error);
      setLoading(false);
    }
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await fetch('/api/admin/transactions');
      const data = await response.json();
      
      if (data.ok) {
        setTransactions(data.transactions || []);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string, type: 'deposit' | 'withdrawal') => {
    try {
      const endpoint = type === 'deposit' ? '/api/admin/deposits/approve' : '/api/admin/withdrawals/approve';
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ [type === 'deposit' ? 'depositId' : 'withdrawalId']: id }),
      });

      const data = await response.json();
      
      if (data.ok) {
        alert('Transaction approved successfully!');
        fetchTransactions();
      } else {
        alert('Error: ' + data.error);
      }
    } catch (error) {
      console.error('Error approving transaction:', error);
      alert('Error approving transaction');
    }
  };

  const handleReject = async (id: string, type: 'deposit' | 'withdrawal') => {
    try {
      const endpoint = type === 'deposit' ? '/api/admin/deposits/reject' : '/api/admin/withdrawals/reject';
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ [type === 'deposit' ? 'depositId' : 'withdrawalId']: id }),
      });

      const data = await response.json();
      
      if (data.ok) {
        alert('Transaction rejected successfully!');
        fetchTransactions();
      } else {
        alert('Error: ' + data.error);
      }
    } catch (error) {
      console.error('Error rejecting transaction:', error);
      alert('Error rejecting transaction');
    }
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesType = filter === 'all' || 
      (filter === 'deposits' && transaction.type === 'DEPOSIT') ||
      (filter === 'withdrawals' && transaction.type === 'WITHDRAWAL');
    const matchesStatus = statusFilter === 'all' || transaction.status === statusFilter;
    return matchesType && matchesStatus;
  });

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
          <h1 className="text-3xl font-bold text-white mb-2">Transaction Management</h1>
          <p className="text-gray-300 text-lg">Manage deposits and withdrawals</p>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-white">All Transactions</h2>
            <Link href="/en/admin" className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-500 transition-colors">
              Back to Dashboard
            </Link>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Type</label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as 'all' | 'deposits' | 'withdrawals')}
                className="bg-gray-700 text-white px-3 py-2 rounded-md border border-gray-600"
              >
                <option value="all">All Types</option>
                <option value="deposits">Deposits</option>
                <option value="withdrawals">Withdrawals</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | 'PENDING' | 'APPROVED' | 'REJECTED')}
                className="bg-gray-700 text-white px-3 py-2 rounded-md border border-gray-600"
              >
                <option value="all">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
          </div>

          {/* Transactions Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-600">
                  <th className="pb-3 text-gray-300 font-medium">Type</th>
                  <th className="pb-3 text-gray-300 font-medium">User</th>
                  <th className="pb-3 text-gray-300 font-medium">Amount</th>
                  <th className="pb-3 text-gray-300 font-medium">Cryptocurrency</th>
                  <th className="pb-3 text-gray-300 font-medium">Status</th>
                  <th className="pb-3 text-gray-300 font-medium">Date</th>
                  <th className="pb-3 text-gray-300 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((transaction) => (
                  <tr key={transaction.id} className="border-b border-gray-700">
                    <td className="py-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        transaction.type === 'DEPOSIT' 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-blue-500/20 text-blue-400'
                      }`}>
                        {transaction.type === 'DEPOSIT' ? 'Deposit' : 'Withdrawal'}
                      </span>
                    </td>
                    <td className="py-4 text-gray-300">User {transaction.userId.slice(-8)}</td>
                    <td className="py-4 text-white font-medium">${Number(transaction.amount).toFixed(2)}</td>
                    <td className="py-4 text-gray-300">{transaction.cryptocurrency || 'N/A'}</td>
                    <td className="py-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        transaction.status === 'PENDING' 
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : transaction.status === 'APPROVED'
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {transaction.status}
                      </span>
                    </td>
                    <td className="py-4 text-gray-300">
                      {new Date(transaction.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4">
                      {transaction.status === 'PENDING' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApprove(transaction.id, transaction.type.toLowerCase() as 'deposit' | 'withdrawal')}
                            className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-500 transition-colors"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(transaction.id, transaction.type.toLowerCase() as 'deposit' | 'withdrawal')}
                            className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-500 transition-colors"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredTransactions.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-400">No transactions found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
