'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { SessionUser } from '@/lib/session';
import { useTranslation, useLanguage } from '@/lib/translations';
import AdvancedLanguageSwitcher from './AdvancedLanguageSwitcher';
import { NotificationCenter } from '@/lib/notifications';
import { clearAuthCache } from './AuthGuard';

export default function AuthHeader() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t } = useTranslation();
  const { locale } = useLanguage();
  
  useEffect(() => {
    const checkAuth = () => {
      fetch('/api/me').then(r => r.json()).then(d => {
        if (d?.user) setUser(d.user);
        else setUser(null);
      });
    };
    
    checkAuth();
    
    // Listen for auth state changes
    const handleAuthChange = () => checkAuth();
    window.addEventListener('authStateChanged', handleAuthChange);
    
    return () => window.removeEventListener('authStateChanged', handleAuthChange);
  }, []);

  // Fetch unread message count for regular users
  useEffect(() => {
    if (user && user.role === 'USER') {
      fetch('/api/messages').then(r => r.json()).then(d => {
        if (d?.unreadCount) setUnreadCount(d.unreadCount);
      });
    }
  }, [user]);

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href={`/${locale}`} className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-yellow-400 rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">G</span>
            </div>
            <span className="text-xl font-bold gradient-text">Global Hedge AI</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href={`/${locale}`} className="text-foreground hover:text-primary transition-colors">
              {t('navigation.home')}
            </Link>
            <Link href={`/${locale}/market`} className="text-foreground hover:text-primary transition-colors">
              {t('navigation.market')}
            </Link>
            <Link href={`/${locale}/info`} className="text-foreground hover:text-primary transition-colors">
              {t('navigation.about')}
            </Link>
            {user && (
              <>
                <Link href={`/${locale}/deposit`} className="text-foreground hover:text-primary transition-colors">
                  {t('navigation.deposit')}
                </Link>
                <Link href={`/${locale}/withdraw`} className="text-foreground hover:text-primary transition-colors">
                  {t('navigation.withdraw')}
                </Link>
              </>
            )}
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-4">
            {/* Language Switcher */}
            <AdvancedLanguageSwitcher />

            {user ? (
              /* Authenticated User Menu */
              <div className="flex items-center gap-4">
                {/* Messages */}
                {user.role === 'USER' && (
                  <Link href={`/${locale}/messages`} className="relative p-2 text-foreground hover:text-primary transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-error text-error-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </Link>
                )}

                {/* Admin Panel */}
                {user.role === 'ADMIN' && (
                  <Link href={`/${locale}/admin`} className="btn-secondary text-sm px-3 py-2">
                    {t('navigation.admin')}
                  </Link>
                )}

                {/* User Menu */}
                <div className="relative">
                  <button className="flex items-center gap-2 text-foreground hover:text-primary transition-colors">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-primary-foreground font-semibold text-sm">
                        {user.email.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="hidden sm:block text-sm">{user.email}</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>

                {/* Logout */}
                <button
                  onClick={async () => {
                    await fetch('/api/auth/logout', { method: 'POST' });
                    clearAuthCache();
                    window.dispatchEvent(new CustomEvent('authStateChanged'));
                    window.location.href = `/${locale}`;
                  }}
                  className="btn-secondary text-sm px-3 py-2"
                >
                  {t('auth.logout')}
                </button>
              </div>
            ) : (
              /* Non-Authenticated User Menu */
              <div className="flex items-center gap-3">
                <Link href={`/${locale}/login`} className="btn-secondary text-sm px-4 py-2">
                  {t('auth.login')}
                </Link>
                <Link href={`/${locale}/register`} className="btn-primary text-sm px-4 py-2">
                  {t('auth.register')}
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-foreground hover:text-primary transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border py-4">
            <nav className="flex flex-col gap-4">
              <Link href={`/${locale}`} className="text-foreground hover:text-primary transition-colors">
                {t('navigation.home')}
              </Link>
              <Link href={`/${locale}/market`} className="text-foreground hover:text-primary transition-colors">
                {t('navigation.market')}
              </Link>
              <Link href={`/${locale}/info`} className="text-foreground hover:text-primary transition-colors">
                {t('navigation.about')}
              </Link>
              {user && (
                <>
                  <Link href={`/${locale}/deposit`} className="text-foreground hover:text-primary transition-colors">
                    {t('navigation.deposit')}
                  </Link>
                  <Link href={`/${locale}/withdraw`} className="text-foreground hover:text-primary transition-colors">
                    {t('navigation.withdraw')}
                  </Link>
                  {user.role === 'USER' && (
                    <Link href={`/${locale}/messages`} className="text-foreground hover:text-primary transition-colors">
                      {t('navigation.messages')}
                    </Link>
                  )}
                  {user.role === 'ADMIN' && (
                    <Link href={`/${locale}/admin`} className="text-foreground hover:text-primary transition-colors">
                      {t('navigation.admin')}
                    </Link>
                  )}
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}