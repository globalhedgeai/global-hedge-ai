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
}

interface Deposit {
  id: string;
  userId: string;
  amount: number;
  txId: string;
  cryptocurrency: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  updatedAt: string;
}

interface Withdrawal {
  id: string;
  userId: string;
  amount: number;
  cryptocurrency: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  updatedAt: string;
}

export default function AdminUsersPage() {
  const { t, locale } = useTranslation();
  const [users, setUsers] = useState<User[]>([]);
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'users' | 'deposits' | 'withdrawals'>('users');
  const [editingBalance, setEditingBalance] = useState<{ userId: string; balance: number } | null>(null);

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

  const updateUserBalance = async (userId: string, newBalance: number) => {
    try {
      const response = await fetch('/api/admin/users/balance', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, balance: newBalance }),
      });

      const data = await response.json();
      
      if (data.ok) {
        setUsers(users.map(user => 
          user.id === userId ? { ...user, balance: newBalance } : user
        ));
        setEditingBalance(null);
        alert('Balance updated successfully!');
      } else {
        alert('Error updating balance: ' + data.error);
      }
    } catch (error) {
      console.error('Error updating balance:', error);
      alert('Error updating balance');
    }
  };

  const approveDeposit = async (depositId: string) => {
    try {
      const response = await fetch('/api/admin/deposits/approve', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ depositId }),
      });

      const data = await response.json();
      
      if (data.ok) {
        setDeposits(deposits.map(deposit => 
          deposit.id === depositId ? { ...deposit, status: 'APPROVED' } : deposit
        ));
        alert('Deposit approved successfully!');
        fetchData(); // Refresh data
      } else {
        alert('Error approving deposit: ' + data.error);
      }
    } catch (error) {
      console.error('Error approving deposit:', error);
      alert('Error approving deposit');
    }
  };

  const rejectDeposit = async (depositId: string) => {
    try {
      const response = await fetch('/api/admin/deposits/reject', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ depositId }),
      });

      const data = await response.json();
      
      if (data.ok) {
        setDeposits(deposits.map(deposit => 
          deposit.id === depositId ? { ...deposit, status: 'REJECTED' } : deposit
        ));
        alert('Deposit rejected successfully!');
      } else {
        alert('Error rejecting deposit: ' + data.error);
      }
    } catch (error) {
      console.error('Error rejecting deposit:', error);
      alert('Error rejecting deposit');
    }
  };

  const approveWithdrawal = async (withdrawalId: string) => {
    try {
      const response = await fetch('/api/admin/withdrawals/approve', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ withdrawalId }),
      });

      const data = await response.json();
      
      if (data.ok) {
        setWithdrawals(withdrawals.map(withdrawal => 
          withdrawal.id === withdrawalId ? { ...withdrawal, status: 'APPROVED' } : withdrawal
        ));
        alert('Withdrawal approved successfully!');
        fetchData(); // Refresh data
      } else {
        alert('Error approving withdrawal: ' + data.error);
      }
    } catch (error) {
      console.error('Error approving withdrawal:', error);
      alert('Error approving withdrawal');
    }
  };

  const rejectWithdrawal = async (withdrawalId: string) => {
    try {
      const response = await fetch('/api/admin/withdrawals/reject', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ withdrawalId }),
      });

      const data = await response.json();
      
      if (data.ok) {
        setWithdrawals(withdrawals.map(withdrawal => 
          withdrawal.id === withdrawalId ? { ...withdrawal, status: 'REJECTED' } : withdrawal
        ));
        alert('Withdrawal rejected successfully!');
      } else {
        alert('Error rejecting withdrawal: ' + data.error);
      }
    } catch (error) {
      console.error('Error rejecting withdrawal:', error);
      alert('Error rejecting withdrawal');
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

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'text-red-500 bg-red-50';
      case 'SUPPORT': return 'text-blue-500 bg-blue-50';
      case 'ACCOUNTING': return 'text-purple-500 bg-purple-50';
      case 'USER': return 'text-green-500 bg-green-50';
      default: return 'text-gray-500 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading data...</p>
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
            <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold gradient-text">إدارة المستخدمين الكاملة</h1>
          </div>
          <p className="text-muted-foreground text-lg">التحكم الكامل في المستخدمين والمعاملات المالية</p>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex space-x-1 bg-muted p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('users')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'users' 
                  ? 'bg-background text-foreground shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              المستخدمين ({users.length})
            </button>
            <button
              onClick={() => setActiveTab('deposits')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'deposits' 
                  ? 'bg-background text-foreground shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              طلبات الإيداع ({deposits.filter(d => d.status === 'PENDING').length})
            </button>
            <button
              onClick={() => setActiveTab('withdrawals')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'withdrawals' 
                  ? 'bg-background text-foreground shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              طلبات السحب ({withdrawals.filter(w => w.status === 'PENDING').length})
            </button>
          </div>
        </div>

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="card">
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-semibold text-foreground">المستخدم</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">الدور</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">الرصيد</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">كود الإحالة</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">تاريخ الإنشاء</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
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
                          {editingBalance?.userId === user.id ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                value={editingBalance.balance}
                                onChange={(e) => setEditingBalance({ userId: user.id, balance: parseFloat(e.target.value) })}
                                className="w-24 p-1 border border-border rounded text-sm"
                              />
                              <button
                                onClick={() => updateUserBalance(user.id, editingBalance.balance)}
                                className="text-green-500 hover:text-green-600 text-sm"
                              >
                                حفظ
                              </button>
                              <button
                                onClick={() => setEditingBalance(null)}
                                className="text-red-500 hover:text-red-600 text-sm"
                              >
                                إلغاء
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <p className="text-foreground font-medium">
                                {formatCurrency(user.balance, locale)}
                              </p>
                              <button
                                onClick={() => setEditingBalance({ userId: user.id, balance: user.balance })}
                                className="text-primary hover:text-primary/80 text-sm"
                              >
                                تعديل
                              </button>
                            </div>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <p className="text-foreground font-mono text-sm">
                            {user.referralCode}
                          </p>
                        </td>
                        <td className="py-4 px-4">
                          <p className="text-sm text-muted-foreground">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </p>
                        </td>
                        <td className="py-4 px-4">
                          <button
                            onClick={() => setSelectedUser(user)}
                            className="text-primary hover:text-primary/80 text-sm font-medium"
                          >
                            عرض التفاصيل
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Deposits Tab */}
        {activeTab === 'deposits' && (
          <div className="card">
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-semibold text-foreground">المستخدم</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">المبلغ</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">العملة</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">معرف المعاملة</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">الحالة</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">التاريخ</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {deposits.map((deposit) => (
                      <tr key={deposit.id} className="border-b border-border hover:bg-muted/50">
                        <td className="py-4 px-4">
                          <p className="text-foreground font-medium">{deposit.userId.slice(-8)}</p>
                        </td>
                        <td className="py-4 px-4">
                          <p className="text-foreground font-medium">
                            {formatCurrency(deposit.amount, locale)}
                          </p>
                        </td>
                        <td className="py-4 px-4">
                          <p className="text-foreground">{deposit.cryptocurrency}</p>
                        </td>
                        <td className="py-4 px-4">
                          <p className="text-muted-foreground font-mono text-sm">
                            {deposit.txId.slice(0, 16)}...
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
                          {deposit.status === 'PENDING' && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => approveDeposit(deposit.id)}
                                className="text-green-500 hover:text-green-600 text-sm font-medium"
                              >
                                موافقة
                              </button>
                              <button
                                onClick={() => rejectDeposit(deposit.id)}
                                className="text-red-500 hover:text-red-600 text-sm font-medium"
                              >
                                رفض
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Withdrawals Tab */}
        {activeTab === 'withdrawals' && (
          <div className="card">
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-semibold text-foreground">المستخدم</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">المبلغ</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">العملة</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">الحالة</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">التاريخ</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {withdrawals.map((withdrawal) => (
                      <tr key={withdrawal.id} className="border-b border-border hover:bg-muted/50">
                        <td className="py-4 px-4">
                          <p className="text-foreground font-medium">{withdrawal.userId.slice(-8)}</p>
                        </td>
                        <td className="py-4 px-4">
                          <p className="text-foreground font-medium">
                            {formatCurrency(withdrawal.amount, locale)}
                          </p>
                        </td>
                        <td className="py-4 px-4">
                          <p className="text-foreground">{withdrawal.cryptocurrency}</p>
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
                          {withdrawal.status === 'PENDING' && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => approveWithdrawal(withdrawal.id)}
                                className="text-green-500 hover:text-green-600 text-sm font-medium"
                              >
                                موافقة
                              </button>
                              <button
                                onClick={() => rejectWithdrawal(withdrawal.id)}
                                className="text-red-500 hover:text-red-600 text-sm font-medium"
                              >
                                رفض
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}