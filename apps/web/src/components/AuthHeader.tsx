'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { SessionUser } from '@/lib/session';
import { useTranslation, useLanguage } from '@/lib/translations';
import AdvancedLanguageSwitcher from './AdvancedLanguageSwitcher';
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
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
              {/* Logo */}
          <Link href={`/${locale}`} className="flex items-center gap-3 group">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-yellow-400 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-primary/25 transition-all duration-300">
              <span className="text-primary-foreground font-bold text-xl">G</span>
            </div>
                <div className="hidden sm:block">
                  <span className="text-xl font-bold gradient-text">Global Hedge AI</span>
                  <div className="text-xs text-muted-foreground -mt-1">Leading Trading Platform</div>
                </div>
              </Link>
              
          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-2">
            <Link href={`/${locale}`} className="px-4 py-2 rounded-xl text-foreground hover:text-primary hover:bg-accent/50 transition-all duration-200 font-medium">
                  🏠 {t('navigation.home')}
                </Link>
            <Link href={`/${locale}/market`} className="px-4 py-2 rounded-xl text-foreground hover:text-primary hover:bg-accent/50 transition-all duration-200 font-medium">
                  📈 {t('navigation.market')}
                </Link>
            <Link href={`/${locale}/info`} className="px-4 py-2 rounded-xl text-foreground hover:text-primary hover:bg-accent/50 transition-all duration-200 font-medium">
              ℹ️ {t('navigation.about')}
            </Link>
            {user && (
              <>
                <Link href={`/${locale}/deposit`} className="px-4 py-2 rounded-xl text-foreground hover:text-primary hover:bg-accent/50 transition-all duration-200 font-medium">
                  💰 {t('navigation.deposit')}
                </Link>
                <Link href={`/${locale}/withdraw`} className="px-4 py-2 rounded-xl text-foreground hover:text-primary hover:bg-accent/50 transition-all duration-200 font-medium">
                  💸 {t('navigation.withdraw')}
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
                  <Link href={`/${locale}/messages`} className="relative p-3 rounded-xl text-foreground hover:text-primary hover:bg-accent/50 transition-all duration-200">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-error text-error-foreground text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold animate-pulse">
                        {unreadCount}
                      </span>
                    )}
                  </Link>
                )}

                {/* Admin Panel */}
                {user.role === 'ADMIN' && (
                  <Link href={`/${locale}/admin`} className="btn-secondary px-4 py-2 text-sm font-semibold">
                    ⚙️ {t('navigation.admin')}
                    </Link>
                )}

                {/* User Profile */}
                <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-accent/30 hover:bg-accent/50 transition-all duration-200">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary to-yellow-400 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-primary-foreground font-bold text-lg">
                    {user.email.charAt(0).toUpperCase()}
                  </span>
                  </div>
                  <div className="hidden sm:block">
                    <div className="text-sm font-semibold text-foreground">{user.email}</div>
                    <div className="text-xs text-muted-foreground capitalize">{user.role}</div>
                  </div>
              </div>
              
                {/* Logout */}
              <button
                  onClick={async () => {
                    await fetch('/api/auth/logout', { method: 'POST' });
                    clearAuthCache();
                    window.dispatchEvent(new CustomEvent('authStateChanged'));
                    window.location.href = `/${locale}`;
                  }}
                  className="btn-secondary px-4 py-2 text-sm font-semibold hover:bg-error/10 hover:text-error hover:border-error/20 transition-all duration-200"
                >
                  🚪 {t('auth.logout')}
              </button>
          </div>
        ) : (
              /* Non-Authenticated User Menu */
              <div className="flex items-center gap-3">
                <Link href={`/${locale}/login`} className="btn-secondary px-6 py-3 text-sm font-semibold">
                  🔐 {t('auth.login')}
                </Link>
                <Link href={`/${locale}/register`} className="btn-primary px-6 py-3 text-sm font-semibold shadow-lg hover:shadow-primary/25 transition-all duration-300">
                  🚀 {t('auth.register')}
                </Link>
            </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-3 rounded-xl text-foreground hover:text-primary hover:bg-accent/50 transition-all duration-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-border py-6">
            <nav className="flex flex-col gap-3">
              <Link 
                href={`/${locale}`} 
                className="px-4 py-3 rounded-xl text-foreground hover:text-primary hover:bg-accent/50 transition-all duration-200 font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                🏠 {t('navigation.home')}
              </Link>
              <Link 
                href={`/${locale}/market`} 
                className="px-4 py-3 rounded-xl text-foreground hover:text-primary hover:bg-accent/50 transition-all duration-200 font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                📈 {t('navigation.market')}
              </Link>
              <Link 
                href={`/${locale}/info`} 
                className="px-4 py-3 rounded-xl text-foreground hover:text-primary hover:bg-accent/50 transition-all duration-200 font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                ℹ️ {t('navigation.about')}
              </Link>
              {user && (
                <>
                  <Link 
                    href={`/${locale}/deposit`} 
                    className="px-4 py-3 rounded-xl text-foreground hover:text-primary hover:bg-accent/50 transition-all duration-200 font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    💰 {t('navigation.deposit')}
              </Link>
              <Link 
                href={`/${locale}/withdraw`} 
                    className="px-4 py-3 rounded-xl text-foreground hover:text-primary hover:bg-accent/50 transition-all duration-200 font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                💸 {t('navigation.withdraw')}
              </Link>
                  {user.role === 'USER' && (
              <Link 
                href={`/${locale}/messages`} 
                      className="px-4 py-3 rounded-xl text-foreground hover:text-primary hover:bg-accent/50 transition-all duration-200 font-medium flex items-center gap-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                      💬 {t('navigation.messages')}
                {unreadCount > 0 && (
                        <span className="bg-error text-error-foreground text-xs px-2 py-1 rounded-full font-bold">
                    {unreadCount}
                  </span>
                )}
              </Link>
                  )}
                  {user.role === 'ADMIN' && (
              <Link 
                      href={`/${locale}/admin`} 
                      className="px-4 py-3 rounded-xl text-foreground hover:text-primary hover:bg-accent/50 transition-all duration-200 font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                      ⚙️ {t('navigation.admin')}
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