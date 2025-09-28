'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from 'next-intl';
import Link from "next/link";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const router = useRouter();
  const t = useTranslations();
  const locale = useLocale();
  const isRTL = locale === 'ar';

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMsg(null);
    const r = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        email, 
        password, 
        referralCode: referralCode.trim() || undefined 
      }),
    });
    const j = await r.json();
    if (j.ok) router.push(`/${locale}`); else setMsg(j.error || t('errors.generic'));
  }

  return (
    <main className={`p-6 max-w-md mx-auto ${isRTL ? 'rtl' : 'ltr'}`}>
      <h1 className="text-2xl font-bold mb-4">{t('auth.register')}</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('auth.email')}
          </label>
          <input 
            type="email" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            required 
            className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('auth.password')}
          </label>
          <input 
            type="password" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            required 
            minLength={8}
            className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('referrals.enterCode')}
          </label>
          <input 
            type="text" 
            value={referralCode} 
            onChange={e => setReferralCode(e.target.value)} 
            placeholder={t('referrals.enterCode')}
            className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <button 
          type="submit"
          className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          {t('auth.register')}
        </button>
        {msg && (
          <div className="text-red-600 text-sm" role="alert">
            {msg}
          </div>
        )}
        <div className="text-center">
          <Link 
            href={`/${locale}/login`}
            className="text-blue-600 hover:text-blue-800 underline"
          >
            {t('auth.login')}
          </Link>
        </div>
      </form>
    </main>
  );
}
