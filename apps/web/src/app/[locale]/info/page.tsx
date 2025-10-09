"use client";

import React, { useState, useEffect } from 'react';
import { useTranslation, useLanguage } from '@/lib/translations';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ChartBarIcon, 
  UsersIcon, 
  ShieldCheckIcon, 
  CurrencyDollarIcon,
  StarIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  GiftIcon,
  UserGroupIcon,
  BanknotesIcon,
  LockClosedIcon
} from '@heroicons/react/24/outline';

export default function InfoPage() {
  const { t, locale } = useTranslation();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
    
    // استمع لتغييرات المصادقة
    const handleAuthChange = () => {
      checkAuth();
    };
    window.addEventListener('authStateChanged', handleAuthChange);
    
    return () => {
      window.removeEventListener('authStateChanged', handleAuthChange);
    };
  }, []);

  async function checkAuth() {
    try {
      // تحقق من التخزين المؤقت أولاً
      const authCache = localStorage.getItem('auth_cache');
      if (authCache) {
        const cache = JSON.parse(authCache);
        if (cache.isAuthenticated && Date.now() - cache.timestamp < 1800000) {
          console.log('✅ Info Page: Using cached auth');
          setIsAuthenticated(true);
          return;
        }
      }
      
      const response = await fetch('/api/me', { cache: 'no-store' });
      const data = await response.json();
      const authResult = !!data?.user;
      console.log('🔍 Info Page: Auth check result:', authResult);
      setIsAuthenticated(authResult);
    } catch (error) {
      console.error('❌ Info Page: Auth check failed:', error);
      setIsAuthenticated(false);
    }
  }

  const handleRegister = () => {
    router.push(`/${locale}/register`);
  };

  const handleLogin = () => {
    router.push(`/${locale}/login`);
  };

  const handleGoToDashboard = () => {
    router.push(`/${locale}`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-yellow-400/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold gradient-text mb-6">
              {t('info.title')}
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              {t('info.subtitle')}
            </p>
            <p className="text-lg text-muted-foreground mb-12 max-w-4xl mx-auto">
              {t('info.description')}
            </p>
            
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <div className="card hover-lift">
                <div className="p-6 text-center">
                  <UsersIcon className="h-12 w-12 text-primary mx-auto mb-4" />
                  <div className="text-3xl font-bold text-foreground mb-2">10,000+</div>
                  <div className="text-muted-foreground">{t('info.stats.users')}</div>
                </div>
              </div>
              <div className="card hover-lift">
                <div className="p-6 text-center">
                  <CurrencyDollarIcon className="h-12 w-12 text-success mx-auto mb-4" />
                  <div className="text-3xl font-bold text-foreground mb-2">$50M+</div>
                  <div className="text-muted-foreground">{t('info.stats.volume')}</div>
                </div>
              </div>
              <div className="card hover-lift">
                <div className="p-6 text-center">
                  <ChartBarIcon className="h-12 w-12 text-warning mx-auto mb-4" />
                  <div className="text-3xl font-bold text-foreground mb-2">1,000+</div>
                  <div className="text-muted-foreground">{t('info.stats.trades')}</div>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isAuthenticated ? (
                <button
                  onClick={handleGoToDashboard}
                  className="btn-primary py-4 px-8 text-lg font-semibold"
                >
                  🏠 {t('navigation.home')}
                </button>
              ) : (
                <>
                  <button
                    onClick={handleRegister}
                    className="btn-primary py-4 px-8 text-lg font-semibold"
                  >
                    {t('auth.register')}
                  </button>
                  <button
                    onClick={handleLogin}
                    className="btn-secondary py-4 px-8 text-lg font-semibold"
                  >
                    {t('auth.login')}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold gradient-text mb-4">
            {t('info.features.title')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('info.features.subtitle')}
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* AI Feature */}
          <div className="card hover-lift">
            <div className="p-8">
              <div className="flex items-center mb-6">
                <ChartBarIcon className="h-8 w-8 text-primary mr-3" />
                <h3 className="text-2xl font-bold text-foreground">{t('info.features.ai.title')}</h3>
              </div>
              <p className="text-muted-foreground mb-6">{t('info.features.ai.description')}</p>
              <ul className="space-y-2">
                <li className="flex items-center text-sm text-muted-foreground">
                  <CheckCircleIcon className="h-4 w-4 text-success mr-2" />
                  {t('info.features.ai.benefit1')}
                </li>
                <li className="flex items-center text-sm text-muted-foreground">
                  <CheckCircleIcon className="h-4 w-4 text-success mr-2" />
                  {t('info.features.ai.benefit2')}
                </li>
                <li className="flex items-center text-sm text-muted-foreground">
                  <CheckCircleIcon className="h-4 w-4 text-success mr-2" />
                  {t('info.features.ai.benefit3')}
                </li>
              </ul>
            </div>
          </div>

          {/* Security Feature */}
          <div className="card hover-lift">
            <div className="p-8">
              <div className="flex items-center mb-6">
                <ShieldCheckIcon className="h-8 w-8 text-success mr-3" />
                <h3 className="text-2xl font-bold text-foreground">{t('info.features.security.title')}</h3>
              </div>
              <p className="text-muted-foreground mb-6">{t('info.features.security.description')}</p>
              <ul className="space-y-2">
                <li className="flex items-center text-sm text-muted-foreground">
                  <CheckCircleIcon className="h-4 w-4 text-success mr-2" />
                  {t('info.features.security.benefit1')}
                </li>
                <li className="flex items-center text-sm text-muted-foreground">
                  <CheckCircleIcon className="h-4 w-4 text-success mr-2" />
                  {t('info.features.security.benefit2')}
                </li>
                <li className="flex items-center text-sm text-muted-foreground">
                  <CheckCircleIcon className="h-4 w-4 text-success mr-2" />
                  {t('info.features.security.benefit3')}
                </li>
              </ul>
            </div>
          </div>

          {/* Rewards Feature */}
          <div className="card hover-lift">
            <div className="p-8">
              <div className="flex items-center mb-6">
                <GiftIcon className="h-8 w-8 text-warning mr-3" />
                <h3 className="text-2xl font-bold text-foreground">{t('info.features.rewards.title')}</h3>
              </div>
              <p className="text-muted-foreground mb-6">{t('info.features.rewards.description')}</p>
              <ul className="space-y-2">
                <li className="flex items-center text-sm text-muted-foreground">
                  <CheckCircleIcon className="h-4 w-4 text-success mr-2" />
                  {t('info.features.rewards.benefit1')}
                </li>
                <li className="flex items-center text-sm text-muted-foreground">
                  <CheckCircleIcon className="h-4 w-4 text-success mr-2" />
                  {t('info.features.rewards.benefit2')}
                </li>
                <li className="flex items-center text-sm text-muted-foreground">
                  <CheckCircleIcon className="h-4 w-4 text-success mr-2" />
                  {t('info.features.rewards.benefit3')}
                </li>
              </ul>
            </div>
          </div>

          {/* Referral Feature */}
          <div className="card hover-lift">
            <div className="p-8">
              <div className="flex items-center mb-6">
                <UserGroupIcon className="h-8 w-8 text-info mr-3" />
                <h3 className="text-2xl font-bold text-foreground">{t('info.features.referral.title')}</h3>
              </div>
              <p className="text-muted-foreground mb-6">{t('info.features.referral.description')}</p>
              <ul className="space-y-2">
                <li className="flex items-center text-sm text-muted-foreground">
                  <CheckCircleIcon className="h-4 w-4 text-success mr-2" />
                  {t('info.features.referral.benefit1')}
                </li>
                <li className="flex items-center text-sm text-muted-foreground">
                  <CheckCircleIcon className="h-4 w-4 text-success mr-2" />
                  {t('info.features.referral.benefit2')}
                </li>
                <li className="flex items-center text-sm text-muted-foreground">
                  <CheckCircleIcon className="h-4 w-4 text-success mr-2" />
                  {t('info.features.referral.benefit3')}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="bg-accent/30 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold gradient-text mb-4">
              {t('info.howItWorks.title')}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('info.howItWorks.subtitle')}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-primary">1</span>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-4">{t('info.howItWorks.step1.title')}</h3>
              <p className="text-muted-foreground">{t('info.howItWorks.step1.description')}</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-primary">2</span>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-4">{t('info.howItWorks.step2.title')}</h3>
              <p className="text-muted-foreground">{t('info.howItWorks.step2.description')}</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-primary">3</span>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-4">{t('info.howItWorks.step3.title')}</h3>
              <p className="text-muted-foreground">{t('info.howItWorks.step3.description')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-primary/10 to-yellow-400/10 py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold gradient-text mb-4">
            {t('info.cta.title')}
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            {t('info.cta.description')}
          </p>
          {!isAuthenticated ? (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleRegister}
                className="btn-primary py-4 px-8 text-lg font-semibold"
              >
                {t('auth.register')}
              </button>
              <button
                onClick={handleLogin}
                className="btn-secondary py-4 px-8 text-lg font-semibold"
              >
                {t('auth.login')}
              </button>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleGoToDashboard}
                className="btn-primary py-4 px-8 text-lg font-semibold flex items-center justify-center gap-2"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                {t('navigation.home')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}