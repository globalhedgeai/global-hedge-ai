"use client";
import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/lib/translations';
import { formatCurrency } from '@/lib/numberFormat';

interface User {
  id: string;
  email: string;
  role: 'USER' | 'ADMIN' | 'SUPPORT' | 'ACCOUNTING';
  balance: number;
  referralCode: string;
  walletAddress: string | null;
  createdAt: string;
  updatedAt: string;
  firstDepositAt: string | null;
  lastWithdrawalAt: string | null;
}

interface Deposit {
  id: string;
  userId: string;
  userEmail: string;
  amount: number;
  cryptocurrency: string;
  walletAddress: string;
  txHash: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  proofImageUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Withdrawal {
  id: string;
  userId: string;
  userEmail: string;
  amount: number;
  cryptocurrency: string;
  walletAddress: string;
  txHash: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  updatedAt: string;
}

interface EditUserData {
  id: string;
  email: string;
  role: 'USER' | 'ADMIN' | 'SUPPORT' | 'ACCOUNTING';
  balance: number;
  referralCode: string;
  walletAddress: string;
  createdAt: string;
  updatedAt: string;
  firstDepositAt: string;
  lastWithdrawalAt: string;
}

interface EditTransactionData {
  id: string;
  amount: number;
  cryptocurrency: string;
  walletAddress: string;
  txHash: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  updatedAt: string;
}

export default function FullControlPage() {
  const { t, locale } = useTranslation();
  const [users, setUsers] = useState<User[]>([]);
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'users' | 'deposits' | 'withdrawals'>('users');
  const [editingUser, setEditingUser] = useState<EditUserData | null>(null);
  const [editingTransaction, setEditingTransaction] = useState<EditTransactionData | null>(null);
  const [transactionType, setTransactionType] = useState<'deposit' | 'withdrawal'>('deposit');
  const [searchTerm, setSearchTerm] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [usersRes, depositsRes, withdrawalsRes] = await Promise.all([
        fetch('/api/admin/users'),
        fetch('/api/admin/deposits'),
        fetch('/api/admin/withdrawals')
      ]);

      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData.users || []);
      }

      if (depositsRes.ok) {
        const depositsData = await depositsRes.json();
        setDeposits(depositsData.deposits || []);
      }

      if (withdrawalsRes.ok) {
        const withdrawalsData = await withdrawalsRes.json();
        setWithdrawals(withdrawalsData.withdrawals || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveUserChanges = async () => {
    if (!editingUser) return;

    setSaving(true);
    try {
      const response = await fetch('/api/admin/users/full-update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingUser),
      });

      const data = await response.json();
      
      if (data.ok) {
        setUsers(users.map(user => 
          user.id === editingUser.id ? { ...user, ...editingUser } : user
        ));
        setEditingUser(null);
        alert('User updated successfully!');
      } else {
        alert('Error updating user: ' + data.error);
      }
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Error updating user');
    } finally {
      setSaving(false);
    }
  };

  const saveTransactionChanges = async () => {
    if (!editingTransaction) return;

    setSaving(true);
    try {
      const endpoint = transactionType === 'deposit' 
        ? '/api/admin/deposits/full-update'
        : '/api/admin/withdrawals/full-update';
      
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingTransaction),
      });

      const data = await response.json();
      
      if (data.ok) {
        if (transactionType === 'deposit') {
          setDeposits(deposits.map(deposit => 
            deposit.id === editingTransaction.id ? { ...deposit, ...editingTransaction } : deposit
          ));
        } else {
          setWithdrawals(withdrawals.map(withdrawal => 
            withdrawal.id === editingTransaction.id ? { ...withdrawal, ...editingTransaction } : withdrawal
          ));
        }
        setEditingTransaction(null);
        alert('Transaction updated successfully!');
      } else {
        alert('Error updating transaction: ' + data.error);
      }
    } catch (error) {
      console.error('Error updating transaction:', error);
      alert('Error updating transaction');
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16); // Format: YYYY-MM-DDTHH:MM
  };

  const parseDate = (dateString: string) => {
    return new Date(dateString).toISOString().slice(0, 16);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'text-red-500 bg-red-50';
      case 'SUPPORT': return 'text-blue-500 bg-blue-50';
      case 'ACCOUNTING': return 'text-purple-500 bg-purple-50';
      case 'USER': return 'text-green-500 bg-green-50';
      default: return 'text-gray-500 bg-gray-50';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'text-green-500 bg-green-50';
      case 'REJECTED': return 'text-red-500 bg-red-50';
      case 'PENDING': return 'text-yellow-500 bg-yellow-50';
      default: return 'text-gray-500 bg-gray-50';
    }
  };

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.referralCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredDeposits = deposits.filter(deposit =>
    deposit.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
    deposit.txHash?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    deposit.userId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredWithdrawals = withdrawals.filter(withdrawal =>
    withdrawal.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
    withdrawal.txHash?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    withdrawal.userId.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold gradient-text">Full Admin Control</h1>
          </div>
          <p className="text-muted-foreground text-lg">Complete control over users and transactions</p>
        </div>

        {/* Tabs */}
        <div className="card p-0 mb-6">
          <div className="flex border-b border-border">
            <button
              className={`py-3 px-6 text-sm font-medium ${activeTab === 'users' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`}
              onClick={() => setActiveTab('users')}
            >
              Users ({users.length})
            </button>
            <button
              className={`py-3 px-6 text-sm font-medium ${activeTab === 'deposits' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`}
              onClick={() => setActiveTab('deposits')}
            >
              Deposits ({deposits.length})
            </button>
            <button
              className={`py-3 px-6 text-sm font-medium ${activeTab === 'withdrawals' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`}
              onClick={() => setActiveTab('withdrawals')}
            >
              Withdrawals ({withdrawals.length})
            </button>
          </div>

          <div className="p-6">
            {/* Search */}
            <input
              type="text"
              placeholder="Search..."
              className="w-full p-3 border border-border rounded-lg bg-background text-foreground mb-6"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            {/* Users Tab */}
            {activeTab === 'users' && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-semibold text-foreground">User</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Role</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Balance</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Wallet</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Created</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="border-b border-border hover:bg-muted/50">
                        <td className="py-4 px-4">
                          <div>
                            <p className="font-medium text-foreground">{user.email}</p>
                            <p className="text-sm text-muted-foreground">ID: {user.id.slice(-8)}</p>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <p className="text-foreground font-medium">
                            {formatCurrency(user.balance, locale)}
                          </p>
                        </td>
                        <td className="py-4 px-4">
                          <p className="text-sm text-muted-foreground font-mono">
                            {user.walletAddress ? `${user.walletAddress.slice(0, 8)}...` : 'Not set'}
                          </p>
                        </td>
                        <td className="py-4 px-4">
                          <p className="text-sm text-muted-foreground">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </p>
                        </td>
                        <td className="py-4 px-4">
                          <button
                            onClick={() => setEditingUser({
                              id: user.id,
                              email: user.email,
                              role: user.role,
                              balance: user.balance,
                              referralCode: user.referralCode,
                              walletAddress: user.walletAddress || '',
                              createdAt: user.createdAt,
                              updatedAt: user.updatedAt,
                              firstDepositAt: user.firstDepositAt || '',
                              lastWithdrawalAt: user.lastWithdrawalAt || '',
                            })}
                            className="text-primary hover:text-primary/80 text-sm font-medium"
                          >
                            Edit All
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Deposits Tab */}
            {activeTab === 'deposits' && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-semibold text-foreground">User</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Amount</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Crypto</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Wallet</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">TX Hash</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Created</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDeposits.map((deposit) => (
                      <tr key={deposit.id} className="border-b border-border hover:bg-muted/50">
                        <td className="py-4 px-4">
                          <p className="font-medium text-foreground">{deposit.userEmail}</p>
                          <p className="text-sm text-muted-foreground">ID: {deposit.userId.slice(-8)}</p>
                        </td>
                        <td className="py-4 px-4">
                          <p className="text-foreground font-medium">
                            {formatCurrency(deposit.amount, locale)}
                          </p>
                        </td>
                        <td className="py-4 px-4">
                          <p className="text-foreground font-medium">{deposit.cryptocurrency}</p>
                        </td>
                        <td className="py-4 px-4">
                          <p className="text-sm text-muted-foreground font-mono">
                            {deposit.walletAddress.slice(0, 8)}...
                          </p>
                        </td>
                        <td className="py-4 px-4">
                          <p className="text-sm text-muted-foreground font-mono">
                            {deposit.txHash ? `${deposit.txHash.slice(0, 8)}...` : 'N/A'}
                          </p>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(deposit.status)}`}>
                            {deposit.status}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <p className="text-sm text-muted-foreground">
                            {new Date(deposit.createdAt).toLocaleDateString()}
                          </p>
                        </td>
                        <td className="py-4 px-4">
                          <button
                            onClick={() => {
                              setTransactionType('deposit');
                              setEditingTransaction({
                                id: deposit.id,
                                amount: deposit.amount,
                                cryptocurrency: deposit.cryptocurrency,
                                walletAddress: deposit.walletAddress,
                                txHash: deposit.txHash || '',
                                status: deposit.status,
                                createdAt: deposit.createdAt,
                                updatedAt: deposit.updatedAt,
                              });
                            }}
                            className="text-primary hover:text-primary/80 text-sm font-medium"
                          >
                            Edit All
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Withdrawals Tab */}
            {activeTab === 'withdrawals' && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-semibold text-foreground">User</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Amount</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Crypto</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Wallet</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">TX Hash</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Created</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredWithdrawals.map((withdrawal) => (
                      <tr key={withdrawal.id} className="border-b border-border hover:bg-muted/50">
                        <td className="py-4 px-4">
                          <p className="font-medium text-foreground">{withdrawal.userEmail}</p>
                          <p className="text-sm text-muted-foreground">ID: {withdrawal.userId.slice(-8)}</p>
                        </td>
                        <td className="py-4 px-4">
                          <p className="text-foreground font-medium">
                            {formatCurrency(withdrawal.amount, locale)}
                          </p>
                        </td>
                        <td className="py-4 px-4">
                          <p className="text-foreground font-medium">{withdrawal.cryptocurrency}</p>
                        </td>
                        <td className="py-4 px-4">
                          <p className="text-sm text-muted-foreground font-mono">
                            {withdrawal.walletAddress.slice(0, 8)}...
                          </p>
                        </td>
                        <td className="py-4 px-4">
                          <p className="text-sm text-muted-foreground font-mono">
                            {withdrawal.txHash ? `${withdrawal.txHash.slice(0, 8)}...` : 'N/A'}
                          </p>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(withdrawal.status)}`}>
                            {withdrawal.status}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <p className="text-sm text-muted-foreground">
                            {new Date(withdrawal.createdAt).toLocaleDateString()}
                          </p>
                        </td>
                        <td className="py-4 px-4">
                          <button
                            onClick={() => {
                              setTransactionType('withdrawal');
                              setEditingTransaction({
                                id: withdrawal.id,
                                amount: withdrawal.amount,
                                cryptocurrency: withdrawal.cryptocurrency,
                                walletAddress: withdrawal.walletAddress,
                                txHash: withdrawal.txHash || '',
                                status: withdrawal.status,
                                createdAt: withdrawal.createdAt,
                                updatedAt: withdrawal.updatedAt,
                              });
                            }}
                            className="text-primary hover:text-primary/80 text-sm font-medium"
                          >
                            Edit All
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Edit User Modal */}
        {editingUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-card p-6 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl font-bold text-foreground mb-4">Edit User: {editingUser.email}</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Email</label>
                  <input
                    type="email"
                    value={editingUser.email}
                    onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                    className="w-full p-3 border border-border rounded-lg bg-background text-foreground"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Role</label>
                  <select
                    value={editingUser.role}
                    onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as any })}
                    className="w-full p-3 border border-border rounded-lg bg-background text-foreground"
                  >
                    <option value="USER">USER</option>
                    <option value="ADMIN">ADMIN</option>
                    <option value="SUPPORT">SUPPORT</option>
                    <option value="ACCOUNTING">ACCOUNTING</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Balance</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingUser.balance}
                    onChange={(e) => setEditingUser({ ...editingUser, balance: parseFloat(e.target.value) })}
                    className="w-full p-3 border border-border rounded-lg bg-background text-foreground"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Referral Code</label>
                  <input
                    type="text"
                    value={editingUser.referralCode}
                    onChange={(e) => setEditingUser({ ...editingUser, referralCode: e.target.value })}
                    className="w-full p-3 border border-border rounded-lg bg-background text-foreground"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Wallet Address</label>
                  <input
                    type="text"
                    value={editingUser.walletAddress}
                    onChange={(e) => setEditingUser({ ...editingUser, walletAddress: e.target.value })}
                    className="w-full p-3 border border-border rounded-lg bg-background text-foreground"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Created At</label>
                  <input
                    type="datetime-local"
                    value={parseDate(editingUser.createdAt)}
                    onChange={(e) => setEditingUser({ ...editingUser, createdAt: e.target.value })}
                    className="w-full p-3 border border-border rounded-lg bg-background text-foreground"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Updated At</label>
                  <input
                    type="datetime-local"
                    value={parseDate(editingUser.updatedAt)}
                    onChange={(e) => setEditingUser({ ...editingUser, updatedAt: e.target.value })}
                    className="w-full p-3 border border-border rounded-lg bg-background text-foreground"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">First Deposit At</label>
                  <input
                    type="datetime-local"
                    value={editingUser.firstDepositAt ? parseDate(editingUser.firstDepositAt) : ''}
                    onChange={(e) => setEditingUser({ ...editingUser, firstDepositAt: e.target.value })}
                    className="w-full p-3 border border-border rounded-lg bg-background text-foreground"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Last Withdrawal At</label>
                  <input
                    type="datetime-local"
                    value={editingUser.lastWithdrawalAt ? parseDate(editingUser.lastWithdrawalAt) : ''}
                    onChange={(e) => setEditingUser({ ...editingUser, lastWithdrawalAt: e.target.value })}
                    className="w-full p-3 border border-border rounded-lg bg-background text-foreground"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => setEditingUser(null)}
                  className="btn-secondary"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  onClick={saveUserChanges}
                  className="btn-primary"
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Transaction Modal */}
        {editingTransaction && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-card p-6 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl font-bold text-foreground mb-4">
                Edit {transactionType === 'deposit' ? 'Deposit' : 'Withdrawal'}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingTransaction.amount}
                    onChange={(e) => setEditingTransaction({ ...editingTransaction, amount: parseFloat(e.target.value) })}
                    className="w-full p-3 border border-border rounded-lg bg-background text-foreground"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Cryptocurrency</label>
                  <input
                    type="text"
                    value={editingTransaction.cryptocurrency}
                    onChange={(e) => setEditingTransaction({ ...editingTransaction, cryptocurrency: e.target.value })}
                    className="w-full p-3 border border-border rounded-lg bg-background text-foreground"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Wallet Address</label>
                  <input
                    type="text"
                    value={editingTransaction.walletAddress}
                    onChange={(e) => setEditingTransaction({ ...editingTransaction, walletAddress: e.target.value })}
                    className="w-full p-3 border border-border rounded-lg bg-background text-foreground"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Transaction Hash</label>
                  <input
                    type="text"
                    value={editingTransaction.txHash}
                    onChange={(e) => setEditingTransaction({ ...editingTransaction, txHash: e.target.value })}
                    className="w-full p-3 border border-border rounded-lg bg-background text-foreground"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Status</label>
                  <select
                    value={editingTransaction.status}
                    onChange={(e) => setEditingTransaction({ ...editingTransaction, status: e.target.value as any })}
                    className="w-full p-3 border border-border rounded-lg bg-background text-foreground"
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="APPROVED">APPROVED</option>
                    <option value="REJECTED">REJECTED</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Created At</label>
                  <input
                    type="datetime-local"
                    value={parseDate(editingTransaction.createdAt)}
                    onChange={(e) => setEditingTransaction({ ...editingTransaction, createdAt: e.target.value })}
                    className="w-full p-3 border border-border rounded-lg bg-background text-foreground"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Updated At</label>
                  <input
                    type="datetime-local"
                    value={parseDate(editingTransaction.updatedAt)}
                    onChange={(e) => setEditingTransaction({ ...editingTransaction, updatedAt: e.target.value })}
                    className="w-full p-3 border border-border rounded-lg bg-background text-foreground"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => setEditingTransaction(null)}
                  className="btn-secondary"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  onClick={saveTransactionChanges}
                  className="btn-primary"
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
