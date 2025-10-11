'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslation, useLanguage } from '@/lib/translations';
import DailyRewardCard from '@/components/DailyRewardCard';
import RandomRewardCard from '@/components/RandomRewardCard';
import InteractiveHelpGuide from '@/components/InteractiveHelpGuide';
import { formatNumber, formatCurrency } from '@/lib/numberFormat';

interface DashboardWidget {
  id: string;
  title: string;
  component: React.ReactNode;
  size: 'small' | 'medium' | 'large';
  position: number;
}

export default function HomePage() {
  const { t } = useTranslation();
  const { locale } = useLanguage();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalVolume: 0,
    activeTrades: 0
  });
  const [userBalance, setUserBalance] = useState(0);
  const [widgets, setWidgets] = useState<DashboardWidget[]>([]);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // تحسين الأداء بإضافة debounce
    const timeoutId = setTimeout(() => {
    // Check authentication status
    checkAuthentication();
    
    // Load platform stats
    fetchPlatformStats();

    // Load user balance only if authenticated
    if (isAuthenticated) {
      fetchUserBalance();
    }

    // Initialize widgets based on authentication status
    initializeWidgets();
    }, 100);

    // Listen for auth state changes
    const handleAuthChange = () => {
      checkAuthentication();
      // Also refresh balance when auth state changes
      if (isAuthenticated) {
        fetchUserBalance();
      }
    };
    window.addEventListener('authStateChanged', handleAuthChange);
    
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('authStateChanged', handleAuthChange);
    };
  }, [isAuthenticated]);

  // تحديث العناوين عند تغيير اللغة
  useEffect(() => {
    initializeWidgets();
  }, [locale, isAuthenticated]);

  async function checkAuthentication() {
    try {
      const response = await fetch('/api/me');
      if (response.ok) {
        const data = await response.json();
        setIsAuthenticated(!!data.user);
      }
    } catch (error) {
      setIsAuthenticated(false);
    }
  }

  async function fetchPlatformStats() {
    try {
      const response = await fetch('/api/admin/platform-stats');
      if (response.ok) {
        const data = await response.json();
        setStats({
          totalUsers: data.totalUsers,
          totalVolume: data.totalVolume,
          activeTrades: data.activeTrades
        });
      }
    } catch (error) {
      console.error('Error fetching platform stats:', error);
      // Fallback to default stats
      setStats({
        totalUsers: 15420,
        totalVolume: 2840000,
        activeTrades: 1247
      });
    }
  }

  async function fetchUserBalance() {
    try {
      const response = await fetch('/api/me');
      const data = await response.json();
      if (data?.user?.balance !== undefined) {
        // Convert Decimal to number if needed
        const balance = typeof data.user.balance === 'object' && data.user.balance.toNumber 
          ? data.user.balance.toNumber() 
          : Number(data.user.balance) || 0;
        setUserBalance(balance);
      }
    } catch (error) {
      console.error('Failed to fetch user balance:', error);
    }
  }

  function initializeWidgets() {
    if (isAuthenticated) {
      // Widgets for authenticated users
      const authenticatedWidgets: DashboardWidget[] = [
        {
          id: 'balance',
          title: t('dashboard.balance'),
          component: <BalanceWidget balance={userBalance} />,
          size: 'small',
          position: 1
        },
        {
          id: 'daily-reward',
          title: t('dailyReward.title'),
          component: <DailyRewardCard />,
          size: 'medium',
          position: 2
        },
        {
          id: 'random-reward',
          title: t('rewards.random.title'),
          component: <RandomRewardCard />,
          size: 'medium',
          position: 3
        },
        {
          id: 'stats',
          title: t('dashboard.platformStats'),
          component: <StatsWidget stats={stats} />,
          size: 'large',
          position: 4
        },
        {
          id: 'quick-actions',
          title: t('dashboard.quickActions'),
          component: <QuickActionsWidget />,
          size: 'medium',
          position: 5
        },
        {
          id: 'referrals',
          title: t('referrals.title'),
          component: <ReferralsWidget />,
          size: 'medium',
          position: 6
        },
        {
          id: 'referral-code',
          title: t('referrals.myCode'),
          component: <ReferralCodeWidget />,
          size: 'small',
          position: 7
        }
      ];
      setWidgets(authenticatedWidgets);
    } else {
      // Widgets for non-authenticated users (landing page)
      const landingWidgets: DashboardWidget[] = [
        {
          id: 'hero-section',
          title: '',
          component: <HeroSection />,
          size: 'large',
          position: 1
        },
        {
          id: 'features',
          title: t('landing.features'),
          component: <FeaturesSection />,
          size: 'large',
          position: 2
        },
        {
          id: 'stats',
          title: t('dashboard.platformStats'),
          component: <StatsWidget stats={stats} />,
          size: 'large',
          position: 3
        },
        {
          id: 'cta-section',
          title: '',
          component: <CallToActionSection />,
          size: 'large',
          position: 4
        }
      ];
      setWidgets(landingWidgets);
    }
  }

  const moveWidget = (fromIndex: number, toIndex: number) => {
    const newWidgets = [...widgets];
    const [movedWidget] = newWidgets.splice(fromIndex, 1);
    newWidgets.splice(toIndex, 0, movedWidget);
    setWidgets(newWidgets);
  };

  const toggleWidget = (widgetId: string) => {
    setWidgets(prev => prev.filter(widget => widget.id !== widgetId));
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6">
        {/* Welcome Header */}
        <div className="mb-6 md:mb-8 animate-fade-in">
          <div className="text-center mb-6 md:mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-primary to-yellow-400 rounded-2xl mb-4 shadow-lg">
              <span className="text-primary-foreground font-bold text-2xl md:text-3xl">G</span>
            </div>
            <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold gradient-text mb-4">
              {isAuthenticated ? t('dashboard.title') : t('landing.title')}
            </h1>
            <p className="text-base md:text-xl text-muted-foreground max-w-2xl mx-auto">
              {isAuthenticated ? t('dashboard.subtitle') : t('landing.subtitle')}
            </p>
          </div>
          
          {/* Quick Stats Bar */}
          {isAuthenticated && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mb-6 md:mb-8">
              <div className="card text-center hover-lift p-3 md:p-4">
                <div className="p-4">
                  <div className="text-2xl font-bold text-primary mb-1">
                    {formatCurrency(userBalance, locale)}
                  </div>
                  <div className="text-sm text-muted-foreground">{t('common.balance')}</div>
                </div>
              </div>
              <div className="card text-center hover-lift">
                <div className="p-4">
                  <div className="text-2xl font-bold text-success mb-1">
                    {formatNumber(stats.totalUsers, locale)}
                  </div>
                  <div className="text-sm text-muted-foreground">{t('dashboard.totalUsers')}</div>
                </div>
              </div>
              <div className="card text-center hover-lift">
                <div className="p-4">
                  <div className="text-2xl font-bold text-info mb-1">
                    {formatCurrency(stats.totalVolume, locale)}
                  </div>
                  <div className="text-sm text-muted-foreground">{t('dashboard.totalVolume')}</div>
                </div>
              </div>
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {isAuthenticated ? (
              <>
                <Link href={`/${locale}/deposit`} className="btn-primary flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  💰 {t('navigation.deposit')}
                </Link>
                <Link href={`/${locale}/market`} className="btn-secondary flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  📈 {t('navigation.market')}
                </Link>
                <Link href={`/${locale}/withdraw`} className="btn-secondary flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                  💸 {t('navigation.withdraw')}
                </Link>
                <button
                  onClick={() => setIsCustomizing(!isCustomizing)}
                  className="btn-secondary flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                  </svg>
                  {isCustomizing ? t('dashboard.done') : t('dashboard.customize')}
                </button>
              </>
            ) : (
              <>
                <Link href={`/${locale}/info`} className="btn-secondary flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {t('navigation.about')}
                </Link>
                <Link href={`/${locale}/register`} className="btn-primary flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  {t('auth.register')}
                </Link>
                <Link href={`/${locale}/login`} className="btn-secondary flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  {t('auth.login')}
                </Link>
              </>
            )}
          </div>
          
          {/* App Download Banner - only show for authenticated users */}
          {isAuthenticated && (
            <div className="bg-gradient-to-r from-primary/10 to-yellow-400/10 border border-primary/20 rounded-xl p-6 mb-8">
              <div className="flex items-center justify-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-yellow-400 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-primary-foreground font-bold text-2xl">G</span>
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-bold text-foreground mb-2">📱 {t('phoneApp.title')}</h3>
                  <p className="text-muted-foreground mb-3">{t('phoneApp.description')}</p>
                  <Link href={`/${locale}/download`} className="btn-primary text-sm px-6 py-2">
                    {t('phoneApp.download')}
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Customization Mode - only for authenticated users */}
        {isAuthenticated && isCustomizing && (
          <div className="mb-6 animate-fade-in">
            <div className="card border-primary/20 bg-primary/5">
              <div className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                  </svg>
                  <h3 className="text-lg font-semibold text-primary">{t('dashboard.customizationMode')}</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">{t('dashboard.customizationDesc')}</p>
                <div className="flex flex-wrap gap-2">
                  {widgets.map((widget) => (
                    <button
                      key={widget.id}
                      onClick={() => toggleWidget(widget.id)}
                      className="px-3 py-1 bg-primary/10 text-primary rounded-lg text-sm hover:bg-primary/20 transition-colors"
                    >
                      {widget.title} ×
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6 animate-fade-in">
          {widgets.map((widget, index) => (
            <div
              key={widget.id}
              className={`${
                widget.size === 'small' ? 'sm:col-span-1' :
                widget.size === 'medium' ? 'sm:col-span-1' :
                'sm:col-span-2 xl:col-span-3'
              } ${isCustomizing ? 'cursor-move' : ''} card hover-lift group p-4 md:p-6`}
            >
              <div className="card hover-lift h-full">
                <div className="p-6">
                  {widget.title && (
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-semibold text-foreground">{widget.title}</h3>
                      {isCustomizing && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => moveWidget(index, Math.max(0, index - 1))}
                            className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
                            disabled={index === 0}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                            </svg>
                          </button>
                          <button
                            onClick={() => moveWidget(index, Math.min(widgets.length - 1, index + 1))}
                            className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
                            disabled={index === widgets.length - 1}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                          <button
                            onClick={() => toggleWidget(widget.id)}
                            className="p-2 text-error hover:text-error-foreground hover:bg-error/10 rounded-lg transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                  <div className="widget-content">
                    {widget.component}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add Widget Button - only for authenticated users */}
        {isAuthenticated && isCustomizing && (
          <div className="mt-6 animate-fade-in">
            <div className="card border-dashed border-border">
              <div className="p-6 text-center">
                <svg className="w-12 h-12 text-muted-foreground mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <h3 className="text-lg font-semibold text-foreground mb-2">{t('dashboard.addWidget')}</h3>
                <p className="text-muted-foreground mb-4">{t('dashboard.addWidgetDesc')}</p>
                <button className="btn-primary">
                  {t('dashboard.addWidget')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Widget Components for Authenticated Users
function BalanceWidget({ balance }: { balance: number }) {
  const { t } = useTranslation();
  const { locale } = useLanguage();
  
  return (
    <div className="text-center">
      <div className="text-3xl font-bold text-primary mb-2">
        USDT {formatCurrency(balance, locale)}
      </div>
      <p className="text-sm text-muted-foreground">{t('dashboard.currentBalance')}</p>
    </div>
  );
}

function StatsWidget({ stats }: { stats: { totalUsers: number; totalVolume: number; activeTrades: number } }) {
  const { t } = useTranslation();
  const { locale } = useLanguage();
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="text-center">
        <div className="text-2xl font-bold text-success mb-1">
          {formatNumber(stats.totalUsers, locale)}
        </div>
        <p className="text-sm text-muted-foreground">{t('home.totalUsers')}</p>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-warning mb-1">
          {formatCurrency(stats.totalVolume / 1000000, locale)}M
        </div>
        <p className="text-sm text-muted-foreground">{t('home.totalVolume')}</p>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-info mb-1">
          {formatNumber(stats.activeTrades, locale)}
        </div>
        <p className="text-sm text-muted-foreground">{t('home.activeTrades')}</p>
      </div>
    </div>
  );
}

function QuickActionsWidget() {
  const { t } = useTranslation();
  const { locale } = useLanguage();
  
  return (
    <div className="grid grid-cols-2 gap-3">
      <Link
        href={`/${locale}/deposit`}
        className="btn-primary text-center py-3"
      >
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        {t('deposit.title')}
      </Link>
      <Link
        href={`/${locale}/withdraw`}
        className="btn-secondary text-center py-3"
      >
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4m16 0l-4-4m4 4l-4 4" />
        </svg>
        {t('withdraw.title')}
      </Link>
      <Link
        href={`/${locale}/transactions`}
        className="btn-secondary text-center py-3"
      >
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        {t('transactions.title')}
      </Link>
      <Link
        href={`/${locale}/reports`}
        className="btn-secondary text-center py-3"
      >
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        {t('reports.title')}
      </Link>
    </div>
  );
}

function ReferralCodeWidget() {
  const { t } = useTranslation();
  const [referralCode, setReferralCode] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    // Fetch user's referral code
    fetch('/api/me')
      .then(r => r.json())
      .then(data => {
        if (data?.user?.referralCode) {
          setReferralCode(data.user.referralCode);
        }
      });

    // Listen for auth state changes to refresh referral code
    const handleAuthChange = () => {
      fetch('/api/me')
        .then(r => r.json())
        .then(data => {
          if (data?.user?.referralCode) {
            setReferralCode(data.user.referralCode);
          }
        });
    };
    window.addEventListener('authStateChanged', handleAuthChange);
    
    return () => {
      window.removeEventListener('authStateChanged', handleAuthChange);
    };
  }, []);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const generateReferralCode = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/referrals/generate-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      if (data.ok) {
        setReferralCode(data.referralCode);
        // Dispatch auth state change event to update UI
        window.dispatchEvent(new CustomEvent('authStateChanged'));
      }
    } catch (error) {
      console.error('Error generating referral code:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!referralCode) {
    return (
      <div className="text-center">
        <h3 className="text-lg font-semibold text-foreground mb-3">{t('referrals.myCode')}</h3>
        <div className="bg-muted rounded-lg p-3 mb-3">
          <code className="text-lg font-mono text-muted-foreground">N/A</code>
        </div>
        <button
          onClick={generateReferralCode}
          disabled={isGenerating}
          className="btn-primary w-full"
        >
          {isGenerating ? t('common.loading') : t('referrals.generateCode')}
        </button>
        <p className="text-sm text-muted-foreground mt-2">
          {t('referrals.generateCodeDescription')}
        </p>
      </div>
    );
  }

  return (
    <div className="text-center">
      <h3 className="text-lg font-semibold text-foreground mb-3">{t('referrals.myCode')}</h3>
      <div className="bg-muted rounded-lg p-3 mb-3">
        <code className="text-lg font-mono text-primary">{referralCode}</code>
      </div>
      <button
        onClick={copyToClipboard}
        className="btn-primary w-full"
      >
        {copied ? t('referrals.copied') : t('referrals.copyCode')}
      </button>
      <p className="text-sm text-muted-foreground mt-2">
        {t('referrals.shareCode')}
      </p>
    </div>
  );
}

function ReferralsWidget() {
  const { t } = useTranslation();
  const { locale } = useLanguage();
  const [referralStats, setReferralStats] = useState({
    referralCode: 'LOADING...',
    totalInvited: 0,
    totalEarnings: 0
  });

  useEffect(() => {
    fetchReferralStats();
  }, []);

  const fetchReferralStats = async () => {
    try {
      const response = await fetch('/api/referrals/stats');
      const data = await response.json();
      if (data.ok) {
        setReferralStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching referral stats:', error);
    }
  };

  const copyReferralCode = async () => {
    try {
      await navigator.clipboard.writeText(referralStats.referralCode);
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy referral code:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Referral Code */}
      <div className="text-center">
        <h4 className="text-sm font-medium text-muted-foreground mb-3">{t('referrals.yourCode')}</h4>
        <div className="bg-accent/30 border border-border rounded-xl p-4">
          <div className="flex items-center justify-center gap-3 mb-3">
            <span className="text-xl font-bold text-primary font-mono">{referralStats.referralCode}</span>
            <button
              onClick={copyReferralCode}
              className="btn-secondary text-xs px-3 py-1 flex items-center gap-1"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              {t('referrals.copyCode')}
            </button>
          </div>
          <p className="text-xs text-muted-foreground">{t('referrals.shareCode')}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center">
          <div className="text-lg font-bold text-success mb-1">
            {referralStats.totalInvited}
          </div>
          <p className="text-xs text-muted-foreground">{t('referrals.invitedUsers')}</p>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-warning mb-1">
            {formatCurrency(referralStats.totalEarnings, locale)}
          </div>
          <p className="text-xs text-muted-foreground">{t('referrals.totalEarnings')}</p>
        </div>
      </div>

      {/* Action Button */}
      <div className="text-center">
        <Link
          href={`/${locale}/referrals`}
          className="btn-primary w-full py-2 text-sm flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          {t('referrals.viewDetails')}
        </Link>
      </div>
    </div>
  );
}

// Landing Page Components for Non-Authenticated Users
function HeroSection() {
  const { t } = useTranslation();
  const { locale } = useLanguage();
  
  return (
    <div className="text-center py-12">
      <div className="mb-8">
        <div className="w-24 h-24 bg-gradient-to-br from-primary to-yellow-400 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
          <span className="text-primary-foreground font-bold text-4xl">G</span>
        </div>
        <h2 className="text-4xl md:text-5xl font-bold gradient-text mb-4">
          {t('landing.heroTitle')}
        </h2>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          {t('landing.heroSubtitle')}
        </p>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link
          href={`/${locale}/register`}
          className="btn-primary text-lg px-8 py-4"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
          {t('landing.getStarted')}
        </Link>
        <Link
          href={`/${locale}/login`}
          className="btn-secondary text-lg px-8 py-4"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
          </svg>
          {t('landing.login')}
        </Link>
      </div>
    </div>
  );
}

function FeaturesSection() {
  const { t } = useTranslation();
  
  const features = [
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
      title: t('landing.feature1Title'),
      description: t('landing.feature1Desc')
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
      title: t('landing.feature2Title'),
      description: t('landing.feature2Desc')
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      ),
      title: t('landing.feature3Title'),
      description: t('landing.feature3Desc')
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      title: t('landing.feature4Title'),
      description: t('landing.feature4Desc')
    }
  ];
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {features.map((feature, index) => (
        <div key={index} className="text-center p-6">
          <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-yellow-400/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <div className="text-primary">
              {feature.icon}
            </div>
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
          <p className="text-sm text-muted-foreground">{feature.description}</p>
        </div>
      ))}
    </div>
  );
}

function CallToActionSection() {
  const { t } = useTranslation();
  const { locale } = useLanguage();
  
  return (
    <div className="text-center py-12 bg-gradient-to-r from-primary/10 to-yellow-400/10 rounded-2xl">
      <h3 className="text-2xl font-bold text-foreground mb-4">{t('landing.ctaTitle')}</h3>
      <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">{t('landing.ctaSubtitle')}</p>
      
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link
          href={`/${locale}/register`}
          className="btn-primary text-lg px-8 py-4"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
          {t('landing.startTrading')}
        </Link>
        <Link
          href={`/${locale}/info`}
          className="btn-secondary text-lg px-8 py-4"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {t('landing.learnMore')}
        </Link>
      </div>
    </div>
  );
}