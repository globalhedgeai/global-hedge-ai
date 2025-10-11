"use client";
import React, { useState, useEffect } from 'react';

export default function AdminWalletPage() {
  const [walletAddresses, setWalletAddresses] = useState<any[]>([]);
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
        fetchWalletAddresses();
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error('Error checking session:', error);
      setLoading(false);
    }
  };

  const fetchWalletAddresses = async () => {
    try {
      const response = await fetch('/api/admin/wallet');
      const data = await response.json();
      
      if (data.ok) {
        setWalletAddresses(data.walletAddresses || []);
      }
    } catch (error) {
      console.error('Error fetching wallet addresses:', error);
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
          <h1 className="text-3xl font-bold text-white mb-2">Wallet Management</h1>
          <p className="text-gray-300 text-lg">Manage cryptocurrency wallets</p>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-white">Wallet Addresses ({walletAddresses.length})</h2>
            <a href="/en/admin" className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-500 transition-colors">
              Back to Dashboard
            </a>
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}