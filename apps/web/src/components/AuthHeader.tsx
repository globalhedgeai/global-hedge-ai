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
        {user ? (
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              {/* Logo */}
              <Link href={`/${locale}`} className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-yellow-400 rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-lg">G</span>
                </div>
                <span className="text-xl font-bold gradient-text">{t('app.name')}</span>
              </Link>
              
              {/* Navigation */}
              <nav className="hidden lg:flex items-center gap-1">
                <Link 
                  href={`/${locale}`} 
                  className="px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-200 font-medium text-sm"
                >
                  🏠 {t('navigation.home')}
                </Link>
                <Link 
                  href={`/${locale}/market`} 
                  className="px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-200 font-medium text-sm"
                >
                  📈 {t('navigation.market')}
                </Link>
                <Link 
                  href={`/${locale}/deposit`} 
                  className="px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-200 font-medium text-sm"
                >
                  💰 {t('navigation.deposit')}
                </Link>
                <Link 
                  href={`/${locale}/withdraw`} 
                  className="px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-200 font-medium text-sm"
                >
                  💸 {t('navigation.withdraw')}
                </Link>
                <Link 
                  href={`/${locale}/account`} 
                  className="px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-200 font-medium text-sm"
                >
                  👤 {t('navigation.account')}
                </Link>
                <Link 
                  href={`/${locale}/messages`} 
                  className="px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-200 font-medium text-sm relative"
                >
                  💬 {t('navigation.messages')}
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </Link>
                
                {/* Dropdown Menu for Additional Links */}
                <div className="relative group">
                  <button className="px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-200 font-medium text-sm flex items-center gap-1">
                    ⋯ {t('common.more')}
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div className="absolute top-full left-0 mt-1 w-48 bg-card border border-border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="py-2">
                      <Link 
                        href={`/${locale}/transactions`} 
                        className="block px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                      >
                        📊 {t('transactions.title')}
                      </Link>
                      <Link 
                        href={`/${locale}/reports`} 
                        className="block px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                      >
                        📋 {t('reports.title')}
                      </Link>
                      <Link 
                        href={`/${locale}/messages`} 
                        className="block px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                      >
                        💬 {t('messages.title')}
                      </Link>
                      <Link 
                        href={`/${locale}/referrals`} 
                        className="block px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                      >
                        👥 {t('referrals.title')}
                      </Link>
                      <Link 
                        href={`/${locale}/info`} 
                        className="block px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                      >
                        ℹ️ {t('navigation.info')}
                      </Link>
                      <Link 
                        href={`/${locale}/download`} 
                        className="block px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                      >
                        📱 {t('navigation.download')}
                      </Link>
                    </div>
                  </div>
                </div>
                {user.role === 'USER' && (
                  <Link 
                    href={`/${locale}/messages`} 
                    className="px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-200 font-medium flex items-center gap-2"
                  >
                    {t('messages.title')}
                    {unreadCount > 0 && (
                      <span className="bg-error text-error-foreground text-xs px-2 py-1 rounded-full font-semibold animate-pulse">
                        {unreadCount}
                      </span>
                    )}
                  </Link>
                )}
                {user.role === 'ADMIN' && (
                  <>
                    <Link 
                      href={`/${locale}/admin`} 
                      className="px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-200 font-medium"
                    >
                      {t('navigation.admin')}
                    </Link>
                    <Link 
                      href={`/${locale}/admin/users`} 
                      className="px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-200 font-medium"
                    >
                      {t('navigation.users')}
                    </Link>
                    <Link 
                      href={`/${locale}/admin/wallet`} 
                      className="px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-200 font-medium"
                    >
                      {t('navigation.wallet')}
                    </Link>
                    <Link 
                      href={`/${locale}/admin/messages`} 
                      className="px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-200 font-medium"
                    >
                      {t('messages.title')}
                    </Link>
                    <Link 
                      href={`/${locale}/admin/performance`} 
                      className="px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-200 font-medium"
                    >
                      {t('navigation.performance')}
                    </Link>
                    <Link 
                      href={`/${locale}/admin/backups`} 
                      className="px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-200 font-medium"
                    >
                      {t('navigation.backups')}
                    </Link>
                  </>
                )}
              </nav>
              
              {/* Mobile Navigation Button */}
              <div className="lg:hidden">
                <button 
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* User Info */}
              <div className="hidden sm:flex items-center gap-3 px-3 py-2 rounded-lg bg-accent/50">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-yellow-400 rounded-full flex items-center justify-center">
                  <span className="text-primary-foreground font-semibold text-sm">
                    {user.email.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-sm font-medium text-foreground">{user.email}</span>
              </div>
              
              {/* Notifications */}
              <NotificationCenter />
              
              <AdvancedLanguageSwitcher />
              
              <button
                onClick={() => {
                  fetch('/api/auth/logout', { method: 'POST' }).then(() => {
                    // مسح التخزين المؤقت للمصادقة
                    clearAuthCache();
                    setUser(null);
                    
                    // Dispatch auth state change event
                    window.dispatchEvent(new CustomEvent('authStateChanged'));
                    
                    // تأخير قصير قبل التوجيه لضمان مسح التخزين المؤقت
                    setTimeout(() => {
                      window.location.href = `/${locale}/login`;
                    }, 100);
                  });
                }}
                className="btn-secondary text-sm px-4 py-2"
              >
                {t('auth.logout')}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              {/* Logo */}
              <Link href={`/${locale}`} className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-yellow-400 rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-lg">G</span>
                </div>
                <span className="text-xl font-bold gradient-text">{t('app.name')}</span>
              </Link>
              
              {/* Navigation */}
              <nav className="hidden md:flex items-center gap-1">
                <Link 
                  href={`/${locale}`} 
                  className="px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-200 font-medium"
                >
                  {t('navigation.home')}
                </Link>
                <Link 
                  href={`/${locale}/info`} 
                  className="px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-200 font-medium"
                >
                  {t('navigation.about')}
                </Link>
                <Link 
                  href={`/${locale}/market`} 
                  className="px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-200 font-medium"
                >
                  {t('navigation.market')}
                </Link>
              </nav>
            </div>
            
            <div className="flex items-center gap-4">
              <AdvancedLanguageSwitcher />
              <Link 
                href={`/${locale}/login`}
                className="btn-secondary text-sm px-4 py-2"
              >
                {t('auth.login')}
              </Link>
              <Link 
                href={`/${locale}/register`}
                className="btn-primary text-sm px-4 py-2"
              >
                {t('auth.register')}
              </Link>
            </div>
          </div>
        )}
        
        {/* Mobile Menu */}
        {user && mobileMenuOpen && (
          <div className="lg:hidden bg-card border-t border-border">
            <div className="px-4 py-4 space-y-2">
              <Link 
                href={`/${locale}`} 
                className="block px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                🏠 {t('navigation.home')}
              </Link>
              <Link 
                href={`/${locale}/market`} 
                className="block px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                📈 {t('navigation.market')}
              </Link>
              <Link 
                href={`/${locale}/deposit`} 
                className="block px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                💰 {t('navigation.deposit')}
              </Link>
              <Link 
                href={`/${locale}/withdraw`} 
                className="block px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                💸 {t('navigation.withdraw')}
              </Link>
              <Link 
                href={`/${locale}/account`} 
                className="block px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                👤 {t('navigation.account')}
              </Link>
              <Link 
                href={`/${locale}/transactions`} 
                className="block px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                📊 {t('transactions.title')}
              </Link>
              <Link 
                href={`/${locale}/messages`} 
                className="block px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                💬 {t('messages.title')}
                {unreadCount > 0 && (
                  <span className="ml-2 bg-error text-error-foreground text-xs px-2 py-1 rounded-full font-semibold">
                    {unreadCount}
                  </span>
                )}
              </Link>
              <Link 
                href={`/${locale}/referrals`} 
                className="block px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                👥 {t('referrals.title')}
              </Link>
              <Link 
                href={`/${locale}/download`} 
                className="block px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                📱 {t('navigation.download')}
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
