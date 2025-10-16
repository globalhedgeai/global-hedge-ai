'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation, useLanguage } from '@/lib/translations';

interface AuthGuardProps {
  children: React.ReactNode;
  redirectTo?: string;
}

// تخزين مؤقت للمصادقة لتجنب التحقق المتكرر
const AUTH_CACHE_KEY = 'auth_cache';
const AUTH_CACHE_TTL = 1800000; // 30 دقيقة

// دالة للحصول على التخزين المؤقت من localStorage
const getAuthCache = () => {
  if (typeof window === 'undefined') return null;
  try {
    const cached = localStorage.getItem(AUTH_CACHE_KEY);
    if (!cached) return null;
    return JSON.parse(cached);
  } catch {
    return null;
  }
};

// دالة لمسح التخزين المؤقت
export const clearAuthCache = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(AUTH_CACHE_KEY);
    console.log('🔄 Auth cache cleared');
  }
};

// دالة لتحديث التخزين المؤقت
export const updateAuthCache = (isAuthenticated: boolean, userId?: string) => {
  if (typeof window !== 'undefined') {
    const cache = {
      isAuthenticated,
      timestamp: Date.now(),
      userId
    };
    localStorage.setItem(AUTH_CACHE_KEY, JSON.stringify(cache));
    console.log('✅ Auth cache updated:', { isAuthenticated, userId });
  }
};

export default function AuthGuard({ children, redirectTo = '/login' }: AuthGuardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { t } = useTranslation();
  const { locale } = useLanguage();

  const checkAuth = useCallback(async () => {
    try {
      const response = await fetch('/api/me', {
        cache: 'no-store'
      });
      
      const data = await response.json();
      const authResult = !!data?.user;
      const userId = data?.user?.id;
      
      // تحديث التخزين المؤقت - مهم جداً!
      updateAuthCache(authResult, userId);
      
      setIsAuthenticated(authResult);
      setIsLoading(false);
      
      if (!authResult) {
        router.push(`/${locale}${redirectTo}`);
      }
        } catch {
          // معالجة أفضل للأخطاء
          setIsAuthenticated(false);
          setIsLoading(false);
          
          // فقط إعادة التوجيه إذا لم يكن هناك تخزين مؤقت صالح
          const authCache = getAuthCache();
          if (!authCache || Date.now() - authCache.timestamp > AUTH_CACHE_TTL) {
            router.push(`/${locale}${redirectTo}`);
          }
        }
  }, [locale, redirectTo, router]);

  useEffect(() => {
    // التحقق من التخزين المؤقت أولاً - بدون أي تأخير
    const authCache = getAuthCache();
    
    if (authCache && Date.now() - authCache.timestamp < AUTH_CACHE_TTL && authCache.isAuthenticated) {
      // إذا كان المستخدم مصادق عليه في التخزين المؤقت - لا نفعل أي شيء
      setIsAuthenticated(true);
      setIsLoading(false);
      return;
    }

    // فقط إذا لم يكن هناك تخزين مؤقت صالح
    checkAuth();
  }, [checkAuth]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // لا نعرض أي شيء أثناء التوجيه لتجنب الوميض
  }

  return <>{children}</>;
}
