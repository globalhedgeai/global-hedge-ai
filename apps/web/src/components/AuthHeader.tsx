'use client';
import { useEffect, useState } from 'react';
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
          <div>{user.email}</div>
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
        <div className="flex gap-4">
          <a href="/login" className="bg-black text-white px-4 py-2 rounded">تسجيل دخول</a>
          <a href="/register" className="bg-white text-black border border-black px-4 py-2 rounded">تسجيل جديد</a>
        </div>
      )}
    </header>
  );
}