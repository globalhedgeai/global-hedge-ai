'use client';
import { useEffect, useState } from 'react';

interface User {
  id: string;
  email: string;
  role: 'USER' | 'ADMIN';
  walletAddress?: string;
}

export default function AccountPage() {
  const [user, setUser] = useState<User | null>(null);
  const [wallet, setWallet] = useState('');
  useEffect(() => { fetch('/api/me').then(r => r.json()).then(d => { if (d?.user) { setUser(d.user); setWallet(d.user.walletAddress || ''); } }); }, []);
  return (
    <main className="p-6 space-y-4">
      <h1 className="text-xl font-bold">الحساب</h1>
      {user && <div>البريد: {user.email}</div>}
      <form className="space-y-2" onSubmit={async e => {
        e.preventDefault();
        await fetch('/api/me', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ walletAddress: wallet })});
        alert('تم الحفظ');
      }}>
        <label className="block">عنوان محفظتي</label>
        <input value={wallet} onChange={e=>setWallet(e.target.value)} className="border p-2 w-full" placeholder="T..." />
        <button className="bg-black text-white px-4 py-2 rounded">حفظ</button>
      </form>
    </main>
  );
}