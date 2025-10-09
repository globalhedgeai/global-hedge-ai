'use client';
import { useEffect, useState, useCallback } from 'react';
import { useTranslation, useLanguage } from '@/lib/translations';
import { formatCurrency } from '@/lib/numberFormat';

interface User {
  id: string;
  email: string;
  balance: number;
  role: string;
  createdAt: string;
  firstDepositAt?: string;
  lastWithdrawalAt?: string;
}

interface Deposit {
  id: string;
  amount: number;
  status: string;
  createdAt: string;
  effectiveAt?: string;
}

interface Withdrawal {
  id: string;
  amount: number;
  status: string;
  createdAt: string;
  effectiveAt?: string;
}

export default function AdminUsersPage() {
  const { t } = useTranslation();
  const { locale } = useLanguage();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newBalance, setNewBalance] = useState('');
  const [isUpdatingBalance, setIsUpdatingBalance] = useState(false);
  const [isUpdatingDate, setIsUpdatingDate] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUserTransactions = useCallback(async () => {
    if (!selectedUser) return;
    
    try {
      const [depositsRes, withdrawalsRes] = await Promise.all([
        fetch(`/api/admin/users/${selectedUser.id}/deposits`),
        fetch(`/api/admin/users/${selectedUser.id}/withdrawals`)
      ]);
      
      const depositsData = await depositsRes.json();
      const withdrawalsData = await withdrawalsRes.json();
      
      if (depositsData?.ok) {
        setDeposits(depositsData.deposits);
      }
      if (withdrawalsData?.ok) {
        setWithdrawals(withdrawalsData.withdrawals);
      }
    } catch {
      console.error('Error fetching transactions');
    }
  }, [selectedUser]);

  useEffect(() => {
    if (selectedUser) {
      fetchUserTransactions();
    }
  }, [selectedUser, fetchUserTransactions]);

  async function fetchUsers() {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/users');
      const data = await response.json();
      
      if (data?.ok) {
        setUsers(data.users);
      } else {
        setError('Failed to fetch users');
      }
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }

  async function updateUserBalance() {
    if (!selectedUser || !newBalance) return;
    
    setIsUpdatingBalance(true);
    try {
      const response = await fetch(`/api/admin/users/${selectedUser.id}/balance`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ balance: parseFloat(newBalance) })
      });
      
      const data = await response.json();
      if (data?.ok) {
        // Update local state
        setUsers(prev => prev.map(user => 
          user.id === selectedUser.id 
            ? { ...user, balance: parseFloat(newBalance) }
            : user
        ));
        setSelectedUser(prev => prev ? { ...prev, balance: parseFloat(newBalance) } : null);
        setNewBalance('');
        alert('Balance updated successfully');
      } else {
        alert('Failed to update balance');
      }
    } catch {
      alert('Network error');
    } finally {
      setIsUpdatingBalance(false);
    }
  }

  async function updateTransactionDate(transactionId: string, type: 'deposit' | 'withdrawal', newDate: string) {
    setIsUpdatingDate(true);
    try {
      const response = await fetch(`/api/admin/transactions/${transactionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          type,
          effectiveAt: newDate 
        })
      });
      
      const data = await response.json();
      if (data?.ok) {
        // Refresh transactions
        await fetchUserTransactions();
        alert('Transaction date updated successfully');
      } else {
        alert('Failed to update transaction date');
      }
    } catch {
      alert('Network error');
    } finally {
      setIsUpdatingDate(false);
    }
  }

  if (loading) {
    return (
      <main className="p-6 max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">User Management</h1>
        <div className="text-center">{t('common.loading')}</div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="p-6 max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">User Management</h1>
        <div className="text-red-600">{error}</div>
      </main>
    );
  }

  return (
    <main className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">User Management</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Users List */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Users</h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {users.map((user) => (
              <div 
                key={user.id}
                className={`p-3 border rounded cursor-pointer transition-colors ${
                  selectedUser?.id === user.id 
                    ? 'bg-blue-50 border-blue-300' 
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => setSelectedUser(user)}
              >
                <div className="font-medium">{user.email}</div>
                <div className="text-sm text-gray-600">
                  {t('admin.balance')}: {formatCurrency(user.balance, locale)} USDT
                </div>
                <div className="text-sm text-gray-500">
                  Role: {user.role} | Joined: {new Date(user.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* User Details */}
        {selectedUser && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">{t('admin.userDetails')}</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <div className="p-2 bg-gray-50 border rounded">
                  {selectedUser.email}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('admin.currentBalance')}
                </label>
                <div className="p-2 bg-gray-50 border rounded">
                  {formatCurrency(selectedUser.balance, locale)} USDT
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('admin.updateBalance')}
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="0.01"
                    value={newBalance}
                    onChange={(e) => setNewBalance(e.target.value)}
                    className="flex-1 border border-gray-300 rounded-md p-2"
                    placeholder="New balance"
                  />
                  <button
                    onClick={updateUserBalance}
                    disabled={isUpdatingBalance || !newBalance}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                  >
                    {isUpdatingBalance ? t('admin.updating') : t('admin.update')}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <div className="p-2 bg-gray-50 border rounded">
                  {selectedUser.role}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Deposit
                </label>
                <div className="p-2 bg-gray-50 border rounded">
                  {selectedUser.firstDepositAt 
                    ? new Date(selectedUser.firstDepositAt).toLocaleDateString()
                    : 'None'
                  }
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Withdrawal
                </label>
                <div className="p-2 bg-gray-50 border rounded">
                  {selectedUser.lastWithdrawalAt 
                    ? new Date(selectedUser.lastWithdrawalAt).toLocaleDateString()
                    : 'None'
                  }
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Transactions */}
      {selectedUser && (
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Deposits */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Deposits</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {deposits.map((deposit) => (
                <div key={deposit.id} className="p-3 border rounded">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">{deposit.amount} USDT</div>
                      <div className="text-sm text-gray-600">
                        Status: {deposit.status}
                      </div>
                      <div className="text-sm text-gray-500">
                        Created: {new Date(deposit.createdAt).toLocaleDateString()}
                      </div>
                      {deposit.effectiveAt && (
                        <div className="text-sm text-gray-500">
                          Effective: {new Date(deposit.effectiveAt).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-1">
                      <input
                        type="date"
                        defaultValue={deposit.effectiveAt ? deposit.effectiveAt.split('T')[0] : deposit.createdAt.split('T')[0]}
                        onChange={(e) => updateTransactionDate(deposit.id, 'deposit', e.target.value)}
                        className="text-xs border border-gray-300 rounded p-1"
                        disabled={isUpdatingDate}
                      />
                    </div>
                  </div>
                </div>
              ))}
              {deposits.length === 0 && (
                <div className="text-center text-gray-500 py-4">No deposits found</div>
              )}
            </div>
          </div>

          {/* Withdrawals */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Withdrawals</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {withdrawals.map((withdrawal) => (
                <div key={withdrawal.id} className="p-3 border rounded">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">{withdrawal.amount} USDT</div>
                      <div className="text-sm text-gray-600">
                        Status: {withdrawal.status}
                      </div>
                      <div className="text-sm text-gray-500">
                        Created: {new Date(withdrawal.createdAt).toLocaleDateString()}
                      </div>
                      {withdrawal.effectiveAt && (
                        <div className="text-sm text-gray-500">
                          Effective: {new Date(withdrawal.effectiveAt).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-1">
                      <input
                        type="date"
                        defaultValue={withdrawal.effectiveAt ? withdrawal.effectiveAt.split('T')[0] : withdrawal.createdAt.split('T')[0]}
                        onChange={(e) => updateTransactionDate(withdrawal.id, 'withdrawal', e.target.value)}
                        className="text-xs border border-gray-300 rounded p-1"
                        disabled={isUpdatingDate}
                      />
                    </div>
                  </div>
                </div>
              ))}
              {withdrawals.length === 0 && (
                <div className="text-center text-gray-500 py-4">No withdrawals found</div>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
