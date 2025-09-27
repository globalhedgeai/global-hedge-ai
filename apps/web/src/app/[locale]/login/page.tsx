'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from 'next-intl';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const router = useRouter();
  const t = useTranslations();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMsg(null);
    const r = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const j = await r.json();
    if (j.ok) router.push("/"); else setMsg(j.error || t('auth.invalidCredentials'));
  }

  return (
    <main style={{ padding: 24, maxWidth: 420, margin: "0 auto", fontFamily: "system-ui" }}>
      <h1 style={{ marginBottom: 12 }}>{t('auth.login')}</h1>
      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
        <label>{t('auth.email')}
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        </label>
        <label>{t('auth.password')}
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        </label>
        <button type="submit">{t('auth.login')}</button>
        {msg && <div style={{ color: "red" }}>{msg}</div>}
        <div style={{ display: "flex", gap: 12 }}>
          <Link href="/register">{t('auth.register')}</Link>
          <Link href="/forgot">{t('auth.forgotPassword')}</Link>
        </div>
      </form>
    </main>
  );
}
