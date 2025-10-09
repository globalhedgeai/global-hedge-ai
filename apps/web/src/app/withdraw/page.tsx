'use client';
import { useState } from 'react';
import { useTranslation } from '@/lib/translations';

export default function WithdrawPage() {
  const [amount, setAmount] = useState<number>(0);
  const [address, setAddress] = useState('');
  const { t } = useTranslation();
  
  return (
    <main className="p-6 space-y-4">
      <h1 className="text-xl font-bold">{t('withdraw.title')}</h1>
      <form className="space-y-2" onSubmit={async e => {
        e.preventDefault();
        const r = await fetch('/api/withdrawals', { method:'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify({ amount, address }) });
        const d = await r.json(); if (!d.ok) return alert(d.error || t('common.error')); alert(t('withdraw.success'));
      }}>
        <input type="number" value={amount} onChange={e=>setAmount(Number(e.target.value))} className="border p-2 w-full" placeholder={t('withdraw.amount')} />
        <input value={address} onChange={e=>setAddress(e.target.value)} className="border p-2 w-full" placeholder={t('withdraw.address')} />
        <button className="bg-black text-white px-4 py-2 rounded">{t('withdraw.submit')}</button>
      </form>
    </main>
  );
}
