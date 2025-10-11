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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session?.ok || session?.user?.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">Access Denied</h2>
          <p className="text-muted-foreground">You need admin privileges to access this page.</p>
          <a href="/en/admin" className="btn-primary mt-4">
            Go to Admin Dashboard
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold gradient-text mb-2">Wallet Management</h1>
          <p className="text-muted-foreground text-lg">Manage cryptocurrency wallets</p>
        </div>

        <div className="card p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-foreground">Wallet Addresses ({walletAddresses.length})</h2>
            <a href="/en/admin" className="btn-secondary">
              Back to Dashboard
            </a>
          </div>

          {walletAddresses.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-xl font-semibold text-muted-foreground">No wallet addresses found</p>
              <p className="text-sm text-muted-foreground">Create your first wallet address to get started</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Cryptocurrency</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Address</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Network</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {walletAddresses.map((address) => (
                    <tr key={address.id} className="border-b border-border hover:bg-muted/50">
                      <td className="py-4 px-4">
                        <p className="font-medium text-foreground">{address.cryptocurrency}</p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-sm text-muted-foreground font-mono break-all">{address.address}</p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-sm text-muted-foreground">{address.network || 'N/A'}</p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-sm text-muted-foreground">
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