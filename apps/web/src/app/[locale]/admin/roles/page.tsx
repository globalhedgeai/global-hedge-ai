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

export default function AdminRolesPage() {
  const { t, locale } = useTranslation();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newRole, setNewRole] = useState<'USER' | 'ADMIN' | 'SUPPORT' | 'ACCOUNTING'>('USER');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');
      const data = await response.json();
      
      if (data.ok) {
        setUsers(data.users);
      } else {
        console.error('Error fetching users:', data.error);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, role: 'USER' | 'ADMIN' | 'SUPPORT' | 'ACCOUNTING') => {
    setUpdating(true);
    try {
      const response = await fetch('/api/admin/users/role', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, role }),
      });
      
      const data = await response.json();
      
      if (data.ok) {
        // Update local state
        setUsers(users.map(user => 
          user.id === userId ? { ...user, role } : user
        ));
        setSelectedUser(null);
        alert('Role updated successfully!');
      } else {
        alert('Error updating role: ' + data.error);
      }
    } catch (error) {
      console.error('Error updating role:', error);
      alert('Error updating role');
    } finally {
      setUpdating(false);
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

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'ADMIN': return '👑';
      case 'SUPPORT': return '🛠️';
      case 'ACCOUNTING': return '💰';
      case 'USER': return '👤';
      default: return '❓';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading users...</p>
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
            <h1 className="text-3xl font-bold gradient-text">User Roles Management</h1>
          </div>
          <p className="text-muted-foreground text-lg">Manage user roles and permissions</p>
        </div>

        {/* Users Table */}
        <div className="card">
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-semibold text-foreground">User</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Role</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Balance</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Referral Code</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Wallet</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Created</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Actions</th>
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
                          {getRoleIcon(user.role)} {user.role}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-foreground font-medium">
                          {formatCurrency(user.balance, locale)}
                        </p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-foreground font-mono text-sm">
                          {user.referralCode}
                        </p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-sm text-muted-foreground">
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
                          onClick={() => setSelectedUser(user)}
                          className="text-primary hover:text-primary/80 text-sm font-medium"
                        >
                          Change Role
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Role Change Modal */}
        {selectedUser && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-background rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Change Role for {selectedUser.email}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Current Role: <span className={getRoleColor(selectedUser.role)}>{getRoleIcon(selectedUser.role)} {selectedUser.role}</span>
                  </label>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    New Role
                  </label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as 'USER' | 'ADMIN' | 'SUPPORT' | 'ACCOUNTING')}
                    className="w-full p-3 border border-border rounded-lg bg-background text-foreground"
                  >
                    <option value="USER">👤 USER - Regular user</option>
                    <option value="SUPPORT">🛠️ SUPPORT - Customer support</option>
                    <option value="ACCOUNTING">💰 ACCOUNTING - Financial management</option>
                    <option value="ADMIN">👑 ADMIN - Full administrator</option>
                  </select>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setSelectedUser(null)}
                    className="flex-1 px-4 py-2 border border-border rounded-lg text-foreground hover:bg-muted"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => updateUserRole(selectedUser.id, newRole)}
                    disabled={updating || newRole === selectedUser.role}
                    className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
                  >
                    {updating ? 'Updating...' : 'Update Role'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
