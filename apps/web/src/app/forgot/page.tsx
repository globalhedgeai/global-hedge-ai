'use client';

import { useState } from "react";
import { useTranslation, useLanguage } from '@/lib/translations';
import Link from "next/link";

export default function ForgotPage() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation();
  const { locale } = useLanguage();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMsg(null);
    setIsLoading(true);
    
    try {
      const r = await fetch("/api/auth/request-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const j = await r.json();
      
      if (j.ok) {
        setMsg(t('auth.resetPasswordSent'));
        if (j.devToken) {
          setMsg(`${t('auth.emailSent')}: http://localhost:3001/reset?token=${j.devToken}&email=${encodeURIComponent(email)}`);
        }
      } else {
        setMsg(t('auth.resetError'));
      }
    } catch {
      setMsg(t('auth.resetError'));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main style={{ padding: 24, maxWidth: 420, margin: "0 auto", fontFamily: "system-ui" }}>
      <h1 style={{ marginBottom: 12 }}>{t('auth.forgotPassword')}</h1>
      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
        <label>{t('auth.email')}
          <input 
            type="email" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            required 
            disabled={isLoading}
          />
        </label>
        <button type="submit" disabled={isLoading}>
          {isLoading ? t('auth.sending') : t('auth.sendReset')}
        </button>
        {msg && (
          <div style={{ 
            color: msg.includes("http") ? "blue" : "green", 
            padding: 12, 
            backgroundColor: "#f0f0f0",
            borderRadius: 4 
          }}>
            {msg}
          </div>
        )}
        <div style={{ display: "flex", gap: 12 }}>
          <Link href={`/${locale}/login`}>{t('auth.backToLogin')}</Link>
          <Link href={`/${locale}/register`}>{t('auth.register')}</Link>
        </div>
      </form>
    </main>
  );
}
