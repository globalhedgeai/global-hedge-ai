"use client";
import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

interface WalletAddress {
  id: string;
  cryptocurrency: string;
  address: string;
  network: string;
  createdAt: string;
}

interface Session {
  user: {
    id: string;
    email: string;
    role: string;
  };
  ok?: boolean;
}

export default function AdminWalletPage() {
  const [walletAddresses, setWalletAddresses] = useState<WalletAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<WalletAddress | null>(null);
  const [formData, setFormData] = useState({
    cryptocurrency: 'USDT_TRC20',
    address: '',
    network: 'TRC20'
  });

  const checkSession = useCallback(async () => {
    try {
      const response = await fetch('/api/me');
      const data = await response.json();
      setSession(data);
      
      if (data.ok && data.user.role === 'ADMIN') {
        fetchWalletAddresses();
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error('Error checking session:', error);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const fetchWalletAddresses = async () => {
    try {
      const response = await fetch('/api/admin/wallet');
      const data = await response.json();
      
      if (data.ok) {
        setWalletAddresses(data.addresses || []);
      }
    } catch (error) {
      console.error('Error fetching wallet addresses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddWallet = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/admin/wallet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      if (data.ok) {
        setShowAddForm(false);
        setFormData({ cryptocurrency: 'USDT_TRC20', address: '', network: 'TRC20' });
        fetchWalletAddresses();
        alert('Wallet address added successfully!');
      } else {
        alert('Error adding wallet address: ' + data.error);
      }
    } catch (error) {
      console.error('Error adding wallet address:', error);
      alert('Error adding wallet address');
    }
  };

  const handleEditWallet = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/admin/wallet', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: editingAddress?.id || '',
          ...formData
        }),
      });
      
      const data = await response.json();
      
      if (data.ok) {
        setEditingAddress(null);
        setFormData({ cryptocurrency: 'USDT_TRC20', address: '', network: 'TRC20' });
        fetchWalletAddresses();
        alert('Wallet address updated successfully!');
      } else {
        alert('Error updating wallet address: ' + data.error);
      }
    } catch (error) {
      console.error('Error updating wallet address:', error);
      alert('Error updating wallet address');
    }
  };

  const handleDeleteWallet = async (id: string) => {
    if (!confirm('Are you sure you want to delete this wallet address?')) return;
    
    try {
      const response = await fetch('/api/admin/wallet', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });
      
      const data = await response.json();
      
      if (data.ok) {
        fetchWalletAddresses();
        alert('Wallet address deleted successfully!');
      } else {
        alert('Error deleting wallet address: ' + data.error);
      }
    } catch (error) {
      console.error('Error deleting wallet address:', error);
      alert('Error deleting wallet address');
    }
  };

  const startEdit = (address: WalletAddress) => {
    setEditingAddress(address);
    setFormData({
      cryptocurrency: address.cryptocurrency,
      address: address.address,
      network: address.network || 'TRC20'
    });
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
          <h1 className="text-3xl font-bold text-white mb-2">Wallet Management</h1>
          <p className="text-gray-300 text-lg">Manage cryptocurrency wallets</p>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-white">Wallet Addresses ({walletAddresses.length})</h2>
            <div className="flex gap-2">
              <button 
                onClick={() => setShowAddForm(true)}
                className="bg-yellow-500 text-black px-4 py-2 rounded-md hover:bg-yellow-400 transition-colors"
              >
                Add Wallet Address
              </button>
            <Link href="/en/admin" className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-500 transition-colors">
              Back to Dashboard
            </Link>
            </div>
          </div>

          {walletAddresses.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-700 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-xl font-semibold text-gray-300">No wallet addresses found</p>
              <p className="text-sm text-gray-400">Create your first wallet address to get started</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-3 px-4 font-semibold text-white">Cryptocurrency</th>
                    <th className="text-left py-3 px-4 font-semibold text-white">Address</th>
                    <th className="text-left py-3 px-4 font-semibold text-white">Network</th>
                    <th className="text-left py-3 px-4 font-semibold text-white">Created</th>
                    <th className="text-left py-3 px-4 font-semibold text-white">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {walletAddresses.map((address) => (
                    <tr key={address.id} className="border-b border-gray-700 hover:bg-gray-700">
                      <td className="py-4 px-4">
                        <p className="font-medium text-white">{address.cryptocurrency}</p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-sm text-gray-400 font-mono break-all">{address.address}</p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-sm text-gray-400">{address.network || 'N/A'}</p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-sm text-gray-400">
                          {new Date(address.createdAt).toLocaleDateString()}
                        </p>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => startEdit(address)}
                            className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-400 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteWallet(address.id)}
                            className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-400 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Add Wallet Form */}
          {showAddForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
                <h3 className="text-xl font-semibold text-white mb-4">Add Wallet Address</h3>
                <form onSubmit={handleAddWallet}>
                  <div className="mb-4">
                    <label className="block text-white text-sm font-medium mb-2">Cryptocurrency</label>
                    <select
                      value={formData.cryptocurrency}
                      onChange={(e) => setFormData({...formData, cryptocurrency: e.target.value})}
                      className="w-full bg-gray-700 text-white px-3 py-2 rounded-md border border-gray-600"
                    >
                      <option value="USDT_TRC20">USDT (TRC20)</option>
                      <option value="USDT_ERC20">USDT (ERC20)</option>
                      <option value="BTC">Bitcoin</option>
                      <option value="ETH">Ethereum</option>
                    </select>
                  </div>
                  <div className="mb-4">
                    <label className="block text-white text-sm font-medium mb-2">Wallet Address</label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      className="w-full bg-gray-700 text-white px-3 py-2 rounded-md border border-gray-600"
                      placeholder="Enter wallet address"
                      required
                    />
                  </div>
                  <div className="mb-6">
                    <label className="block text-white text-sm font-medium mb-2">Network</label>
                    <input
                      type="text"
                      value={formData.network}
                      onChange={(e) => setFormData({...formData, network: e.target.value})}
                      className="w-full bg-gray-700 text-white px-3 py-2 rounded-md border border-gray-600"
                      placeholder="Enter network"
                      required
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="bg-yellow-500 text-black px-4 py-2 rounded-md hover:bg-yellow-400 transition-colors"
                    >
                      Add Address
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-500 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Edit Wallet Form */}
          {editingAddress && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
                <h3 className="text-xl font-semibold text-white mb-4">Edit Wallet Address</h3>
                <form onSubmit={handleEditWallet}>
                  <div className="mb-4">
                    <label className="block text-white text-sm font-medium mb-2">Cryptocurrency</label>
                    <select
                      value={formData.cryptocurrency}
                      onChange={(e) => setFormData({...formData, cryptocurrency: e.target.value})}
                      className="w-full bg-gray-700 text-white px-3 py-2 rounded-md border border-gray-600"
                    >
                      <option value="USDT_TRC20">USDT (TRC20)</option>
                      <option value="USDT_ERC20">USDT (ERC20)</option>
                      <option value="BTC">Bitcoin</option>
                      <option value="ETH">Ethereum</option>
                    </select>
                  </div>
                  <div className="mb-4">
                    <label className="block text-white text-sm font-medium mb-2">Wallet Address</label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      className="w-full bg-gray-700 text-white px-3 py-2 rounded-md border border-gray-600"
                      placeholder="Enter wallet address"
                      required
                    />
                  </div>
                  <div className="mb-6">
                    <label className="block text-white text-sm font-medium mb-2">Network</label>
                    <input
                      type="text"
                      value={formData.network}
                      onChange={(e) => setFormData({...formData, network: e.target.value})}
                      className="w-full bg-gray-700 text-white px-3 py-2 rounded-md border border-gray-600"
                      placeholder="Enter network"
                      required
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="bg-yellow-500 text-black px-4 py-2 rounded-md hover:bg-yellow-400 transition-colors"
                    >
                      Update Address
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingAddress(null)}
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
    </div>
  );
}