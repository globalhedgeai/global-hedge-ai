'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation, useLanguage } from '@/lib/translations';
import Link from "next/link";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const router = useRouter();
  const { t } = useTranslation();
  const { locale } = useLanguage();

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
    if (j.ok) router.push(`/${locale}`); else setMsg(j.error || t('auth.registerError'));
  }

  return (
    <main style={{ padding: 24, maxWidth: 420, margin: "0 auto", fontFamily: "system-ui" }}>
      <h1 style={{ marginBottom: 12 }}>{t('auth.register')}</h1>
      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
        <label>{t('auth.email')}
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        </label>
        <label>{t('auth.password')}
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={8} />
        </label>
        <label>{t('referrals.enterCode')}
          <input 
            type="text" 
            value={referralCode} 
            onChange={e => setReferralCode(e.target.value)} 
            placeholder={t('referrals.codePlaceholder')}
          />
        </label>
        <button type="submit">{t('auth.register')}</button>
        {msg && <div style={{ color: "red" }}>{msg}</div>}
        <Link href={`/${locale}/login`}>{t('auth.login')}</Link>
      </form>
    </main>
  );
}