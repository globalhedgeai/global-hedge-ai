'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { SessionUser } from '@/lib/session';
import { useTranslations } from 'next-intl';
import LanguageSwitcher from './LanguageSwitcher';

export default function AuthHeader() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const t = useTranslations();
  
  useEffect(() => {
    fetch('/api/me').then(r => r.json()).then(d => {
      if (d?.user) setUser(d.user);
    });
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
    <header className="p-4 bg-gray-100">
      {user ? (
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user.email}</span>
            <nav className="flex gap-2">
              <Link href="/" className="text-blue-600 hover:text-blue-800 px-2 py-1 rounded">{t('navigation.home')}</Link>
              <Link href="/market" className="text-blue-600 hover:text-blue-800 px-2 py-1 rounded">{t('navigation.market')}</Link>
              <Link href="/deposit" className="text-blue-600 hover:text-blue-800 px-2 py-1 rounded">{t('navigation.deposit')}</Link>
              <Link href="/withdraw" className="text-blue-600 hover:text-blue-800 px-2 py-1 rounded">{t('navigation.withdraw')}</Link>
              <Link href="/account" className="text-blue-600 hover:text-blue-800 px-2 py-1 rounded">{t('navigation.account')}</Link>
              {user.role === 'USER' && (
                <Link href="/messages" className="text-blue-600 hover:text-blue-800 px-2 py-1 rounded flex items-center gap-1">
                  {t('messages.title')}
                  {unreadCount > 0 && (
                    <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </Link>
              )}
              {user.role === 'ADMIN' && (
                <>
                  <Link href="/admin" className="text-blue-600 hover:text-blue-800 px-2 py-1 rounded">{t('navigation.admin')}</Link>
                  <Link href="/admin/users" className="text-blue-600 hover:text-blue-800 px-2 py-1 rounded">{t('navigation.users')}</Link>
                  <Link href="/admin/messages" className="text-blue-600 hover:text-blue-800 px-2 py-1 rounded">{t('messages.title')}</Link>
                </>
              )}
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <button
              onClick={() => {
                fetch('/api/auth/logout', { method: 'POST' }).then(() => {
                  setUser(null);
                  window.location.href = '/login';
                });
              }}
              className="bg-black text-white px-4 py-2 rounded"
            >
              {t('auth.logout')}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex justify-between items-center">
          <nav className="flex gap-2">
            <Link href="/" className="text-blue-600 hover:text-blue-800 px-2 py-1 rounded">{t('navigation.home')}</Link>
            <Link href="/market" className="text-blue-600 hover:text-blue-800 px-2 py-1 rounded">{t('navigation.market')}</Link>
          </nav>
          <div className="flex gap-4">
            <LanguageSwitcher />
            <Link href="/login" className="bg-black text-white px-4 py-2 rounded">{t('auth.login')}</Link>
            <Link href="/register" className="bg-white text-black border border-black px-4 py-2 rounded">{t('auth.register')}</Link>
          </div>
        </div>
      )}
    </header>
  );
}