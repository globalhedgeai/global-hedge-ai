'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation, useLanguage } from '@/lib/translations';
import Link from "next/link";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { t } = useTranslation();
  const { locale } = useLanguage();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMsg(null);
    setIsLoading(true);
    
    // Validate passwords match
    if (password !== confirmPassword) {
      setMsg(t('auth.passwordsDoNotMatch'));
      setIsLoading(false);
      return;
    }
    
    try {
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
      if (j.ok) {
        // Dispatch auth state change event
        window.dispatchEvent(new CustomEvent('authStateChanged'));
        router.push(`/${locale}`);
      } else {
        setMsg(j.error || t('errors.generic'));
      }
    } catch (error) {
      setMsg(t('errors.generic'));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 animate-fade-in">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-yellow-400 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-primary-foreground font-bold text-2xl">G</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold gradient-text mb-2">{t('auth.register')}</h1>
          <p className="text-muted-foreground">{t('auth.registerSubtitle')}</p>
        </div>

        {/* Register Form */}
        <div className="card hover-lift">
          <form onSubmit={onSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                  {t('auth.email')}
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="input w-full"
                  placeholder={t('auth.emailPlaceholder')}
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                  {t('auth.password')}
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="input w-full"
                  placeholder={t('auth.passwordPlaceholder')}
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground mb-2">
                  {t('auth.confirmPassword')}
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="input w-full"
                  placeholder={t('auth.confirmPasswordPlaceholder')}
                />
              </div>

              <div>
                <label htmlFor="referralCode" className="block text-sm font-medium text-foreground mb-2">
                  {t('referrals.enterCode')} ({t('common.optional')})
                </label>
                <input
                  id="referralCode"
                  name="referralCode"
                  type="text"
                  value={referralCode}
                  onChange={e => setReferralCode(e.target.value)}
                  className="input w-full"
                  placeholder={t('referrals.enterCode')}
                />
              </div>
            </div>

            {msg && (
              <div className="p-4 bg-error/10 border border-error/20 rounded-lg">
                <p className="text-error text-sm">{msg}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full py-3 text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
                  {t('auth.registering')}
                </div>
              ) : (
                t('auth.register')
              )}
            </button>

            <div className="text-center space-y-4">
              <div className="flex items-center gap-4 text-sm">
                <Link 
                  href={`/${locale}/login`} 
                  className="text-primary hover:text-yellow-400 transition-colors font-medium"
                >
                  {t('auth.login')}
                </Link>
                <span className="text-muted-foreground">•</span>
                <Link 
                  href={`/${locale}/forgot`} 
                  className="text-primary hover:text-yellow-400 transition-colors font-medium"
                >
                  {t('auth.forgotPassword')}
                </Link>
              </div>
            </div>
          </form>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
          <div className="text-center p-4 rounded-lg bg-accent/30">
            <div className="w-8 h-8 bg-success rounded-lg flex items-center justify-center mx-auto mb-2">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-foreground">{t('auth.features.secure')}</h3>
          </div>
          <div className="text-center p-4 rounded-lg bg-accent/30">
            <div className="w-8 h-8 bg-info rounded-lg flex items-center justify-center mx-auto mb-2">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-foreground">{t('auth.features.fast')}</h3>
          </div>
          <div className="text-center p-4 rounded-lg bg-accent/30">
            <div className="w-8 h-8 bg-warning rounded-lg flex items-center justify-center mx-auto mb-2">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-foreground">{t('auth.features.reliable')}</h3>
          </div>
        </div>
      </div>
    </div>
  );
}
