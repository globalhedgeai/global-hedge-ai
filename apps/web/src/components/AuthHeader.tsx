'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { SessionUser } from '@/lib/session';

export default function AuthHeader() {
  const [user, setUser] = useState<SessionUser | null>(null);
  useEffect(() => {
    fetch('/api/me').then(r => r.json()).then(d => {
      if (d?.user) setUser(d.user);
    });
  }, []);

  return (
    <header className="p-4 bg-gray-100">
      {user ? (
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user.email}</span>
            <nav className="flex gap-2">
              <Link href="/" className="text-blue-600 hover:text-blue-800 px-2 py-1 rounded">الرئيسية</Link>
              <Link href="/market" className="text-blue-600 hover:text-blue-800 px-2 py-1 rounded">السوق</Link>
              <Link href="/deposit" className="text-blue-600 hover:text-blue-800 px-2 py-1 rounded">إيداع</Link>
              <Link href="/withdraw" className="text-blue-600 hover:text-blue-800 px-2 py-1 rounded">سحب</Link>
              <Link href="/account" className="text-blue-600 hover:text-blue-800 px-2 py-1 rounded">الحساب</Link>
            </nav>
          </div>
          <button
            onClick={() => {
              fetch('/api/auth/logout', { method: 'POST' }).then(() => {
                setUser(null);
                window.location.href = '/login';
              });
            }}
            className="bg-black text-white px-4 py-2 rounded"
          >
            تسجيل خروج
          </button>
        </div>
      ) : (
        <div className="flex justify-between items-center">
          <nav className="flex gap-2">
            <Link href="/" className="text-blue-600 hover:text-blue-800 px-2 py-1 rounded">الرئيسية</Link>
            <Link href="/market" className="text-blue-600 hover:text-blue-800 px-2 py-1 rounded">السوق</Link>
          </nav>
          <div className="flex gap-4">
            <Link href="/login" className="bg-black text-white px-4 py-2 rounded">تسجيل دخول</Link>
            <Link href="/register" className="bg-white text-black border border-black px-4 py-2 rounded">تسجيل جديد</Link>
          </div>
        </div>
      )}
    </header>
  );
}