'use client';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import DailyRewardCard from '@/components/DailyRewardCard';

interface User {
  id: string;
  email: string;
  role: 'USER' | 'ADMIN';
  walletAddress?: string;
}

export default function AccountPage() {
  const t = useTranslations();
  const [user, setUser] = useState<User | null>(null);
  const [wallet, setWallet] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => { 
    fetch('/api/me')
      .then(r => r.json())
      .then(d => { 
        if (d?.user) { 
          setUser(d.user); 
          setWallet(d.user.walletAddress || ''); 
        } 
      }); 
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      const response = await fetch('/api/me', { 
        method: 'PUT', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ walletAddress: wallet })
      });
      
      if (response.ok) {
        alert(t('common.success'));
      } else {
        alert(t('common.error'));
      }
    } catch {
      alert(t('common.error'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">{t('account.title')}</h1>
      
      {/* Daily Reward Card */}
      <DailyRewardCard />
      
      {/* User Info */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-3">{t('account.profile')}</h2>
        {user && (
          <div className="space-y-2">
            <div>
              <span className="font-medium">{t('auth.email')}: </span>
              <span>{user.email}</span>
            </div>
            <div>
              <span className="font-medium">{t('account.balance')}: </span>
              <span className="font-mono">0.00</span>
            </div>
          </div>
        )}
      </div>

      {/* Wallet Address Form */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-3">{t('account.settings')}</h2>
        <form className="space-y-3" onSubmit={handleSave}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('account.walletAddress') || 'Wallet Address'}
            </label>
            <input 
              value={wallet} 
              onChange={e => setWallet(e.target.value)} 
              className="border border-gray-300 rounded-md p-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
              placeholder="T..." 
            />
          </div>
          <button 
            type="submit"
            disabled={isSaving}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isSaving ? t('common.loading') : t('common.save')}
          </button>
        </form>
      </div>
    </main>
  );
}
