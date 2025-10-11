"use client";
import React, { useState, useEffect } from 'react';

export default function AdminFullControlPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editData, setEditData] = useState({
    email: '',
    role: 'USER',
    balance: 0,
    walletAddress: '',
    referralCode: '',
    createdAt: '',
    firstDepositAt: '',
    lastWithdrawalAt: ''
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
        fetchUsers();
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error('Error checking session:', error);
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');
      const data = await response.json();
      
      if (data.ok) {
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFullUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/admin/users/full-update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: selectedUser.id,
          ...editData
        }),
      });
      
      const data = await response.json();
      
      if (data.ok) {
        setShowEditForm(false);
        setSelectedUser(null);
        fetchUsers();
        alert('User updated successfully!');
      } else {
        alert('Error updating user: ' + data.error);
      }
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Error updating user');
    }
  };

  const startEdit = (user: any) => {
    setSelectedUser(user);
    setEditData({
      email: user.email,
      role: user.role,
      balance: user.balance || 0,
      walletAddress: user.walletAddress || '',
      referralCode: user.referralCode || '',
      createdAt: user.createdAt ? new Date(user.createdAt).toISOString().split('T')[0] : '',
      firstDepositAt: user.firstDepositAt ? new Date(user.firstDepositAt).toISOString().split('T')[0] : '',
      lastWithdrawalAt: user.lastWithdrawalAt ? new Date(user.lastWithdrawalAt).toISOString().split('T')[0] : ''
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
          <h1 className="text-3xl font-bold text-white mb-2">Full Admin Control</h1>
          <p className="text-gray-300 text-lg">Complete control over users and transactions</p>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-white">Users ({users.length})</h2>
            <a href="/en/admin" className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-500 transition-colors">
              Back to Dashboard
            </a>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 px-4 font-semibold text-white">Email</th>
                  <th className="text-left py-3 px-4 font-semibold text-white">Role</th>
                  <th className="text-left py-3 px-4 font-semibold text-white">Balance</th>
                  <th className="text-left py-3 px-4 font-semibold text-white">Wallet</th>
                  <th className="text-left py-3 px-4 font-semibold text-white">Created</th>
                  <th className="text-left py-3 px-4 font-semibold text-white">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-gray-700 hover:bg-gray-700">
                    <td className="py-4 px-4">
                      <p className="font-medium text-white">{user.email}</p>
                      <p className="text-sm text-gray-400">ID: {user.id.slice(-8)}</p>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                        user.role === 'ADMIN' ? 'text-red-500 bg-red-50' :
                        user.role === 'SUPPORT' ? 'text-blue-500 bg-blue-50' :
                        user.role === 'ACCOUNTING' ? 'text-purple-500 bg-purple-50' :
                        'text-green-500 bg-green-50'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-white font-medium">
                        ${user.balance?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                      </p>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-sm text-gray-400 font-mono">
                        {user.walletAddress ? `${user.walletAddress.slice(0, 8)}...` : 'Not set'}
                      </p>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-sm text-gray-400">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="py-4 px-4">
                      <button 
                        onClick={() => startEdit(user)}
                        className="bg-yellow-500 text-black px-3 py-1 rounded text-sm hover:bg-yellow-400 transition-colors"
                      >
                        Full Control
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Full Control Edit Form */}
        {showEditForm && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-6 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl font-semibold text-white mb-4">
                Full Control: {selectedUser.email}
              </h3>
              <form onSubmit={handleFullUpdate}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="mb-4">
                    <label className="block text-white text-sm font-medium mb-2">Email</label>
                    <input
                      type="email"
                      value={editData.email}
                      onChange={(e) => setEditData({...editData, email: e.target.value})}
                      className="w-full bg-gray-700 text-white px-3 py-2 rounded-md border border-gray-600"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-white text-sm font-medium mb-2">Role</label>
                    <select
                      value={editData.role}
                      onChange={(e) => setEditData({...editData, role: e.target.value})}
                      className="w-full bg-gray-700 text-white px-3 py-2 rounded-md border border-gray-600"
                    >
                      <option value="USER">USER</option>
                      <option value="ADMIN">ADMIN</option>
                      <option value="SUPPORT">SUPPORT</option>
                      <option value="ACCOUNTING">ACCOUNTING</option>
                    </select>
                  </div>
                  <div className="mb-4">
                    <label className="block text-white text-sm font-medium mb-2">Balance</label>
                    <input
                      type="number"
                      step="0.01"
                      value={editData.balance}
                      onChange={(e) => setEditData({...editData, balance: parseFloat(e.target.value) || 0})}
                      className="w-full bg-gray-700 text-white px-3 py-2 rounded-md border border-gray-600"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-white text-sm font-medium mb-2">Wallet Address</label>
                    <input
                      type="text"
                      value={editData.walletAddress}
                      onChange={(e) => setEditData({...editData, walletAddress: e.target.value})}
                      className="w-full bg-gray-700 text-white px-3 py-2 rounded-md border border-gray-600"
                      placeholder="Enter wallet address"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-white text-sm font-medium mb-2">Referral Code</label>
                    <input
                      type="text"
                      value={editData.referralCode}
                      onChange={(e) => setEditData({...editData, referralCode: e.target.value})}
                      className="w-full bg-gray-700 text-white px-3 py-2 rounded-md border border-gray-600"
                      placeholder="Enter referral code"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-white text-sm font-medium mb-2">Account Created Date</label>
                    <input
                      type="date"
                      value={editData.createdAt}
                      onChange={(e) => setEditData({...editData, createdAt: e.target.value})}
                      className="w-full bg-gray-700 text-white px-3 py-2 rounded-md border border-gray-600"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-white text-sm font-medium mb-2">First Deposit Date</label>
                    <input
                      type="date"
                      value={editData.firstDepositAt}
                      onChange={(e) => setEditData({...editData, firstDepositAt: e.target.value})}
                      className="w-full bg-gray-700 text-white px-3 py-2 rounded-md border border-gray-600"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-white text-sm font-medium mb-2">Last Withdrawal Date</label>
                    <input
                      type="date"
                      value={editData.lastWithdrawalAt}
                      onChange={(e) => setEditData({...editData, lastWithdrawalAt: e.target.value})}
                      className="w-full bg-gray-700 text-white px-3 py-2 rounded-md border border-gray-600"
                    />
                  </div>
                </div>
                <div className="flex gap-2 mt-6">
                  <button
                    type="submit"
                    className="bg-yellow-500 text-black px-4 py-2 rounded-md hover:bg-yellow-400 transition-colors"
                  >
                    Update All Data
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditForm(false);
                      setSelectedUser(null);
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