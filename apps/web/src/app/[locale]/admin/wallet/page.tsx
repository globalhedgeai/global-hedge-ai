'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from '@/lib/translations';
import { SUPPORTED_CRYPTOCURRENCIES } from '@/lib/cryptocurrencies';

type WalletAddress = {
  id: string;
  key: string;
  value: string;
  createdAt: string;
};

export default function AdminWalletPage() {
  const [addresses, setAddresses] = useState<WalletAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [saving, setSaving] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    fetchAddresses();
  }, []);

  async function fetchAddresses() {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/wallet');
      const data = await response.json();
      
      if (data?.ok) {
        setAddresses(data.addresses);
      } else {
        setError('Failed to fetch wallet addresses');
      }
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }

  async function updateAddress(key: string, value: string) {
    try {
      setSaving(true);
      const response = await fetch('/api/admin/wallet', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ key, value }),
      });
      
      const data = await response.json();
      if (data?.ok) {
        await fetchAddresses();
        setEditingKey(null);
        setEditValue('');
      } else {
        setError(data.error || 'Failed to update address');
      }
    } catch {
      setError('Network error');
    } finally {
      setSaving(false);
    }
  }

  function startEdit(key: string, value: string) {
    setEditingKey(key);
    setEditValue(value);
  }

  function cancelEdit() {
    setEditingKey(null);
    setEditValue('');
  }

  function getCryptoInfo(key: string) {
    const cryptoKey = key.replace('_ADDRESS', '');
    return SUPPORTED_CRYPTOCURRENCIES.find(crypto => 
      crypto.id === cryptoKey || 
      crypto.id === cryptoKey.replace('_', '_')
    );
  }

  if (loading) {
    return (
      <main className="p-6 max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">{t('wallet.title')}</h1>
        <div className="text-center">{t('common.loading')}</div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="p-6 max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">{t('wallet.title')}</h1>
        <div className="text-red-600">{error}</div>
      </main>
    );
  }

  return (
    <main className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">{t('wallet.title')}</h1>
        <p className="text-gray-600">{t('wallet.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {addresses.map((address) => {
          const cryptoInfo = getCryptoInfo(address.key);
          return (
            <div key={address.key} className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="text-2xl">{cryptoInfo?.icon || '💰'}</div>
                <div>
                  <h3 className="font-semibold text-lg">
                    {cryptoInfo?.name || address.key}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {cryptoInfo?.network || 'Unknown Network'}
                  </p>
                </div>
              </div>

              {editingKey === address.key ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('wallet.currentAddress')}
                    </label>
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="w-full border border-gray-300 rounded-md p-2 text-sm font-mono"
                      placeholder={t('wallet.enterAddress')}
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => updateAddress(address.key, editValue)}
                      disabled={saving || !editValue.trim()}
                      className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm"
                    >
                      {saving ? t('wallet.saving') : t('wallet.save')}
                    </button>
                    <button
                      onClick={cancelEdit}
                      disabled={saving}
                      className="flex-1 bg-gray-500 text-white px-3 py-2 rounded-md hover:bg-gray-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm"
                    >
                      {t('wallet.cancel')}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('wallet.currentAddress')}
                    </label>
                    <div className="p-3 bg-gray-50 border rounded-md">
                      <code className="text-sm font-mono break-all text-gray-800">
                        {address.value || t('common.notSet')}
                      </code>
                    </div>
                  </div>
                  <button
                    onClick={() => startEdit(address.key, address.value)}
                    className="w-full bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-700 text-sm"
                  >
                    {t('wallet.editAddress')}
                  </button>
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="text-xs text-gray-500">
                  <div className="flex justify-between">
                    <span>{t('wallet.minimumDeposit')}:</span>
                    <span>{cryptoInfo?.minDeposit || t('common.notSet')} {cryptoInfo?.symbol || ''}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t('wallet.minimumWithdrawal')}:</span>
                    <span>{cryptoInfo?.minWithdrawal || t('common.notSet')} {cryptoInfo?.symbol || ''}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t('wallet.status')}:</span>
                    <span className={cryptoInfo?.enabled ? 'text-green-600' : 'text-red-600'}>
                      {cryptoInfo?.enabled ? t('wallet.enabled') : t('wallet.disabled')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {addresses.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </div>
          <p className="text-gray-500">{t('wallet.noAddresses')}</p>
        </div>
      )}
    </main>
  );
}
