"use client";
import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/lib/translations';

interface WalletAddress {
  id: string;
  cryptocurrency: string;
  address: string;
  isActive: boolean;
  createdAt: string;
}

export default function AdminWalletPage() {
  const { t, locale } = useTranslation();
  const [walletAddresses, setWalletAddresses] = useState<WalletAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [newAddress, setNewAddress] = useState({
    cryptocurrency: 'USDT_TRC20',
    address: '',
  });
  const [editingAddress, setEditingAddress] = useState<WalletAddress | null>(null);

  useEffect(() => {
    fetchWalletAddresses();
  }, []);

  const fetchWalletAddresses = async () => {
    try {
      const response = await fetch('/api/admin/wallet');
      const data = await response.json();
      
      if (data.ok) {
        setWalletAddresses(data.addresses || []);
      } else {
        console.error('Error fetching wallet addresses:', data.error);
      }
    } catch (error) {
      console.error('Error fetching wallet addresses:', error);
    } finally {
      setLoading(false);
    }
  };

  const addWalletAddress = async () => {
    if (!newAddress.address.trim()) {
      alert('Please enter a wallet address');
      return;
    }

    try {
      const response = await fetch('/api/admin/wallet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newAddress),
      });

      const data = await response.json();
      
      if (data.ok) {
        setWalletAddresses([...walletAddresses, data.address]);
        setNewAddress({ cryptocurrency: 'USDT_TRC20', address: '' });
        alert('Wallet address added successfully!');
      } else {
        alert('Error adding wallet address: ' + data.error);
      }
    } catch (error) {
      console.error('Error adding wallet address:', error);
      alert('Error adding wallet address');
    }
  };

  const updateWalletAddress = async (id: string, updates: Partial<WalletAddress>) => {
    try {
      const response = await fetch('/api/admin/wallet', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, ...updates }),
      });

      const data = await response.json();
      
      if (data.ok) {
        setWalletAddresses(walletAddresses.map(addr => 
          addr.id === id ? { ...addr, ...updates } : addr
        ));
        setEditingAddress(null);
        alert('Wallet address updated successfully!');
      } else {
        alert('Error updating wallet address: ' + data.error);
      }
    } catch (error) {
      console.error('Error updating wallet address:', error);
      alert('Error updating wallet address');
    }
  };

  const deleteWalletAddress = async (id: string) => {
    if (!confirm('Are you sure you want to delete this wallet address?')) {
      return;
    }

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
        setWalletAddresses(walletAddresses.filter(addr => addr.id !== id));
        alert('Wallet address deleted successfully!');
      } else {
        alert('Error deleting wallet address: ' + data.error);
      }
    } catch (error) {
      console.error('Error deleting wallet address:', error);
      alert('Error deleting wallet address');
    }
  };

  const getCryptocurrencyIcon = (crypto: string) => {
    switch (crypto) {
      case 'USDT_TRC20': return '💎';
      case 'USDT_ERC20': return '🔷';
      case 'BTC': return '₿';
      case 'ETH': return 'Ξ';
      case 'BNB': return 'B';
      default: return '💰';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading wallet addresses...</p>
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold gradient-text">إدارة المحافظ</h1>
          </div>
          <p className="text-muted-foreground text-lg">إدارة عناوين محافظ العملات المشفرة</p>
        </div>

        {/* Add New Wallet Address */}
        <div className="card mb-6">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">إضافة عنوان محفظة جديد</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  نوع العملة
                </label>
                <select
                  value={newAddress.cryptocurrency}
                  onChange={(e) => setNewAddress({ ...newAddress, cryptocurrency: e.target.value })}
                  className="w-full p-3 border border-border rounded-lg bg-background text-foreground"
                >
                  <option value="USDT_TRC20">USDT (TRC20)</option>
                  <option value="USDT_ERC20">USDT (ERC20)</option>
                  <option value="BTC">Bitcoin</option>
                  <option value="ETH">Ethereum</option>
                  <option value="BNB">BNB</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  عنوان المحفظة
                </label>
                <input
                  type="text"
                  value={newAddress.address}
                  onChange={(e) => setNewAddress({ ...newAddress, address: e.target.value })}
                  placeholder="أدخل عنوان المحفظة"
                  className="w-full p-3 border border-border rounded-lg bg-background text-foreground"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={addWalletAddress}
                  className="w-full px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-medium"
                >
                  إضافة العنوان
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Wallet Addresses List */}
        <div className="card">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">عناوين المحافظ ({walletAddresses.length})</h3>
            
            {walletAddresses.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <h4 className="text-lg font-semibold text-foreground mb-2">لا توجد عناوين محافظ</h4>
                <p className="text-muted-foreground">أضف عنوان محفظة جديد للبدء</p>
              </div>
            ) : (
              <div className="space-y-4">
                {walletAddresses.map((address) => (
                  <div key={address.id} className="border border-border rounded-lg p-4 hover:bg-muted/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                          <span className="text-lg">{getCryptocurrencyIcon(address.cryptocurrency)}</span>
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{address.cryptocurrency}</p>
                          <p className="text-sm text-muted-foreground font-mono">
                            {address.address.slice(0, 20)}...{address.address.slice(-10)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          address.isActive 
                            ? 'text-green-500 bg-green-50' 
                            : 'text-gray-500 bg-gray-50'
                        }`}>
                          {address.isActive ? 'نشط' : 'غير نشط'}
                        </span>
                        <button
                          onClick={() => setEditingAddress(address)}
                          className="text-primary hover:text-primary/80 text-sm font-medium"
                        >
                          تعديل
                        </button>
                        <button
                          onClick={() => deleteWalletAddress(address.id)}
                          className="text-red-500 hover:text-red-600 text-sm font-medium"
                        >
                          حذف
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Edit Modal */}
        {editingAddress && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-background rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                تعديل عنوان المحفظة
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    نوع العملة
                  </label>
                  <select
                    value={editingAddress.cryptocurrency}
                    onChange={(e) => setEditingAddress({ ...editingAddress, cryptocurrency: e.target.value })}
                    className="w-full p-3 border border-border rounded-lg bg-background text-foreground"
                  >
                    <option value="USDT_TRC20">USDT (TRC20)</option>
                    <option value="USDT_ERC20">USDT (ERC20)</option>
                    <option value="BTC">Bitcoin</option>
                    <option value="ETH">Ethereum</option>
                    <option value="BNB">BNB</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    عنوان المحفظة
                  </label>
                  <input
                    type="text"
                    value={editingAddress.address}
                    onChange={(e) => setEditingAddress({ ...editingAddress, address: e.target.value })}
                    className="w-full p-3 border border-border rounded-lg bg-background text-foreground"
                  />
                </div>
                
                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editingAddress.isActive}
                      onChange={(e) => setEditingAddress({ ...editingAddress, isActive: e.target.checked })}
                      className="rounded"
                    />
                    <span className="text-sm text-foreground">نشط</span>
                  </label>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setEditingAddress(null)}
                    className="flex-1 px-4 py-2 border border-border rounded-lg text-foreground hover:bg-muted"
                  >
                    إلغاء
                  </button>
                  <button
                    onClick={() => updateWalletAddress(editingAddress.id, editingAddress)}
                    className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
                  >
                    حفظ التغييرات
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