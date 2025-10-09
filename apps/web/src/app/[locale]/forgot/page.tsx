'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation, useLanguage } from '@/lib/translations';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const router = useRouter();
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
        setIsEmailSent(true);
        setMsg(t('auth.resetPasswordSent'));
      } else {
        setMsg(j.error || t('errors.generic'));
      }
    } catch (error) {
      setMsg(t('errors.generic'));
    } finally {
      setIsLoading(false);
    }
  }

  if (isEmailSent) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 animate-fade-in">
          {/* Header */}
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-success to-green-400 rounded-2xl flex items-center justify-center shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <h1 className="text-3xl font-bold gradient-text mb-2">{t('auth.resetPassword')}</h1>
            <p className="text-muted-foreground">{t('auth.resetPasswordSent')}</p>
          </div>

          {/* Success Message */}
          <div className="card hover-lift">
            <div className="p-6 text-center">
              <div className="w-12 h-12 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{t('auth.emailSent')}</h3>
              <p className="text-muted-foreground mb-4">
                {t('auth.checkEmail')}
              </p>
              <p className="text-sm text-muted-foreground mb-6">
                {t('auth.spamFolder')}
              </p>
              
              <div className="space-y-3">
                <button
                  onClick={() => {
                    setIsEmailSent(false);
                    setEmail('');
                  }}
                  className="btn-secondary w-full py-3"
                >
                  {t('auth.tryAgain')}
                </button>
                
                <Link
                  href={`/${locale}/login`}
                  className="btn-primary w-full py-3 text-center block"
                >
                  {t('auth.backToLogin')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 animate-fade-in">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-yellow-400 rounded-2xl flex items-center justify-center shadow-lg">
              <svg className="w-8 h-8 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
          </div>
          <h1 className="text-3xl font-bold gradient-text mb-2">{t('auth.forgotPassword')}</h1>
          <p className="text-muted-foreground">{t('auth.forgotPasswordSubtitle')}</p>
        </div>

        {/* Reset Form */}
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
                  {t('auth.sending')}
                </div>
              ) : (
                t('auth.sendResetLink')
              )}
            </button>

            <div className="text-center space-y-4">
              <div className="flex items-center gap-4 text-sm">
                <Link 
                  href={`/${locale}/login`} 
                  className="text-primary hover:text-yellow-400 transition-colors font-medium"
                >
                  {t('auth.backToLogin')}
                </Link>
                <span className="text-muted-foreground">•</span>
                <Link 
                  href={`/${locale}/register`} 
                  className="text-primary hover:text-yellow-400 transition-colors font-medium"
                >
                  {t('auth.register')}
                </Link>
              </div>
            </div>
          </form>
        </div>

        {/* Help Section */}
        <div className="card">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">{t('auth.needHelp')}</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-info/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-info" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium text-foreground">{t('auth.contactSupport')}</h4>
                  <p className="text-sm text-muted-foreground">{t('auth.supportDescription')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
