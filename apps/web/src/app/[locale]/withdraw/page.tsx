'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslation, useLanguage } from '@/lib/translations';
import AuthGuard from '@/components/AuthGuard';
import { formatCurrency } from '@/lib/numberFormat';

type Policies = {
  deposits: {
    feePct: number;
  };
  withdrawals: {
    firstWithdrawalAfterDays: number;
    weeklyFeePct: number;
    monthlyFeePct: number;
    monthlyThresholdDays: number;
  };
  rewards: {
    enabled: boolean;
    chancePct: number;
    bonusPct: number;
  };
};

type WithdrawalInfo = {
  isLocked: boolean;
  unlockDate?: string;
  daysSinceLastWithdrawal?: number;
  feePct?: number;
  feeAmount?: number;
  netAmount?: number;
  appliedRule?: string;
};

export default function WithdrawPage() {
  const [amount, setAmount] = useState<string>('');
  const [address, setAddress] = useState('');
  const [policies, setPolicies] = useState<Policies | null>(null);
  const [withdrawalInfo, setWithdrawalInfo] = useState<WithdrawalInfo | null>(null);
  const [userBalance, setUserBalance] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const { t } = useTranslation();
  const { locale } = useLanguage();

  useEffect(() => {
    fetchPolicies();
    checkWithdrawalStatus();
    fetchUserBalance();
  }, []);

  async function fetchPolicies() {
    try {
      const response = await fetch("/api/policies");
      const data = await response.json();
      if (data?.ok) {
        setPolicies(data.policies);
      }
    } catch (error) {
      console.error("Failed to fetch policies:", error);
    }
  }

  async function checkWithdrawalStatus() {
    try {
      const response = await fetch("/api/withdrawals/check");
      const data = await response.json();
      if (data?.ok) {
        setWithdrawalInfo(data.info);
      }
    } catch (error) {
      console.error("Failed to check withdrawal status:", error);
    }
  }

  async function fetchUserBalance() {
    try {
      const response = await fetch("/api/me");
      const data = await response.json();
      if (data?.user) {
        // Convert Decimal to number properly
        const balance = typeof data.user.balance === 'object' && data.user.balance !== null
          ? (data.user.balance.toNumber ? data.user.balance.toNumber() : Number(data.user.balance))
          : Number(data.user.balance) || 0;
        setUserBalance(balance);
      }
    } catch (error) {
      console.error("Failed to fetch user balance:", error);
    }
  }

  const calculateFee = () => {
    if (!policies || !amount || !withdrawalInfo) return { feeAmount: 0, netAmount: 0, appliedRule: '' };
    
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) return { feeAmount: 0, netAmount: 0, appliedRule: '' };
    if (withdrawalInfo.isLocked) return { feeAmount: 0, netAmount: amountNum, appliedRule: '' };
    
    // استخدام السياسات الصحيحة لحساب الرسوم
    let feePct = 0;
    let appliedRule = '';
    
    // إذا كان withdrawalInfo.feePct محدد، استخدمه مباشرة من API
    if (withdrawalInfo.feePct !== null && withdrawalInfo.feePct !== undefined) {
      feePct = withdrawalInfo.feePct;
      appliedRule = withdrawalInfo.appliedRule || `${feePct}%`;
    } else {
      // حساب الرسوم بناءً على daysSinceLastWithdrawal
      if (withdrawalInfo.daysSinceLastWithdrawal === null || withdrawalInfo.daysSinceLastWithdrawal === undefined) {
        // أول سحب - استخدم الرسوم الشهرية (3%)
        feePct = policies.withdrawals.monthlyFeePct;
        appliedRule = `${policies.withdrawals.monthlyFeePct}% ${t('withdraw.monthlyFee')}`;
      } else if (withdrawalInfo.daysSinceLastWithdrawal < policies.withdrawals.monthlyThresholdDays) {
        // سحب قبل 30 يوم - استخدم الرسوم الأسبوعية (7%)
        feePct = policies.withdrawals.weeklyFeePct;
        appliedRule = `${policies.withdrawals.weeklyFeePct}% ${t('withdraw.weeklyFee')}`;
      } else {
        // سحب بعد 30 يوم - استخدم الرسوم الشهرية (3%)
        feePct = policies.withdrawals.monthlyFeePct;
        appliedRule = `${policies.withdrawals.monthlyFeePct}% ${t('withdraw.monthlyFee')}`;
      }
    }
    
    const feeAmount = (amountNum * feePct) / 100;
    const netAmount = amountNum - feeAmount;
    
    return { feeAmount, netAmount, appliedRule };
  };

  const { feeAmount, netAmount, appliedRule } = calculateFee();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    // التحقق من الحد الأدنى للسحب
    const amountNum = parseFloat(amount);
    if (amountNum < 10) {
      setMessage(`❌ ${t('withdraw.minimumAmount')}: 10 USDT`);
      setSubmitting(false);
      return;
    }

    // التحقق من الرصيد المتاح
    if (amountNum > userBalance) {
      setMessage(`❌ ${t('withdraw.insufficientBalance')}: ${formatCurrency(userBalance, locale)} USDT`);
      setSubmitting(false);
      return;
    }

    try {
      const response = await fetch('/api/withdrawals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: amountNum, address })
      });
      
      const data = await response.json();
      
      if (!data.ok) {
        // معالجة محسنة للأخطاء
        if (data.error === 'withdrawal_locked_until') {
          if (data.unlockAt) {
            const unlockDate = new Date(data.unlockAt);
            const now = new Date();
            const daysLeft = Math.ceil((unlockDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            setMessage(`⏰ ${t('withdraw.withdrawalLocked')}: ${daysLeft} ${t('withdraw.daysRemaining')}`);
          } else {
            setMessage(`❌ ${t('withdraw.noEffectiveDeposits')}`);
          }
        } else if (data.error === 'no_wallet') {
          setMessage(`❌ ${t('withdraw.noWalletAddress')}`);
        } else {
          setMessage(`❌ ${data.message || t('withdraw.error')}`);
        }
        return;
      }
      
      setMessage(`✅ ${t('withdraw.success')}`);
      setAmount('');
      setAddress('');
      await checkWithdrawalStatus();
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : t('errors.generic');
      setMessage(`❌ ${errorMsg}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-error to-red-400 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4m16 0l-4-4m4 4l-4 4" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold gradient-text">{t('withdraw.title')}</h1>
          </div>
          <p className="text-muted-foreground text-lg">{t('withdraw.subtitle')}</p>
        </div>

        {/* App Download Notice */}
        <div className="mb-6 p-6 bg-gradient-to-r from-primary/10 to-yellow-400/10 border border-primary/20 rounded-xl">
          <div className="flex items-center justify-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-yellow-400 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-primary-foreground font-bold text-2xl">G</span>
            </div>
            <div className="text-center">
              <h3 className="text-xl font-bold text-foreground mb-2">📱 {t('phoneApp.title')}</h3>
              <p className="text-muted-foreground mb-3">{t('phoneApp.description')}</p>
              <Link href={`/${locale}/download`} className="btn-primary px-6 py-2">
                {t('phoneApp.download')}
              </Link>
            </div>
          </div>
        </div>

        {/* Withdrawal Countdown Timer */}
        {withdrawalInfo?.isLocked && (
          <div className="mb-6 p-6 bg-gradient-to-r from-primary/10 to-yellow-400/10 border border-primary/20 rounded-xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-yellow-400 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-primary">⏰ {t('withdraw.countdownTitle')}</h3>
                <p className="text-primary/80">{t('withdraw.countdownSubtitle')}</p>
              </div>
            </div>
            {withdrawalInfo.unlockDate && (
              <div className="bg-primary/5 border border-primary/10 rounded-lg p-4">
                <div className="text-center">
                  <p className="text-primary text-sm font-medium mb-2">
                    🎯 {t('withdraw.nextWithdrawalAvailable')}
                  </p>
                  <CountdownTimer targetDate={withdrawalInfo.unlockDate} />
                  <p className="text-primary/70 text-xs mt-2">
                    {t('withdraw.countdownDescription')}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Fee Information */}
        {!withdrawalInfo?.isLocked && policies && (
          <div className="mb-6 p-6 bg-info/10 border border-info/20 rounded-xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-info/20 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-info" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-info">{t('withdraw.feeInfo')}</h3>
                <p className="text-info/80">{t('withdraw.helpText')}</p>
              </div>
            </div>
            <div className="bg-info/5 border border-info/10 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-info font-medium">{t('withdraw.helpLink')}</span>
                </div>
                <div>
                  <span className="text-info font-medium">{t('withdraw.description')}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Withdrawal Form */}
          <div className="animate-fade-in">
            <div className="card">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-foreground mb-4">{t('withdraw.submitWithdrawal')}</h2>
                
                {/* User Balance Display */}
                <div className="mb-6 p-4 bg-success/10 border border-success/20 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-success/20 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm text-success/80">{t('withdraw.availableBalance')}</p>
                        <p className="text-lg font-semibold text-success">{formatCurrency(userBalance, locale)} USDT</p>
                      </div>
                    </div>
                    <button
                      onClick={fetchUserBalance}
                      className="text-success hover:text-success/80 transition-colors"
                      title={t('withdraw.refreshBalance')}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      {t('withdraw.amount')} (USDT)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="input w-full"
                      placeholder={t('withdraw.amountPlaceholder')}
                      disabled={submitting}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      {t('withdraw.toAddress')}
                    </label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="input w-full"
                      placeholder="TKaAamEouHjG9nZwoTPhgYUerejbBHGMop"
                      disabled={submitting}
                      required
                    />
                  </div>

                  {/* Fee Preview */}
                  {amount && withdrawalInfo && (
                    <div className="p-4 bg-accent/50 rounded-lg">
                      <h4 className="font-semibold text-foreground mb-2">{t('withdraw.feeInfo')}</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">{t('withdraw.feeAmount')}:</span>
                          <span className="text-warning font-medium">{formatCurrency(feeAmount, locale)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">{t('withdraw.netAmount')}:</span>
                          <span className="text-success font-medium">{formatCurrency(netAmount, locale)}</span>
                        </div>
                        {appliedRule && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">{t('withdraw.appliedRule')}:</span>
                            <span className="text-info">{appliedRule}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submitting || !amount || !address}
                    className="btn-primary w-full py-3"
                  >
                    {submitting ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
                        <span>{t('withdraw.submitting')}</span>
                      </div>
                    ) : (
                      t('withdraw.submit')
                    )}
                  </button>

                  {message && (
                    <div className={`p-3 rounded-lg text-sm ${
                      message.includes('✅') 
                        ? 'bg-success/10 text-success border border-success/20' 
                        : 'bg-error/10 text-error border border-error/20'
                    }`}>
                      {message}
                    </div>
                  )}
                </form>
              </div>
            </div>
          </div>

          {/* Help Section */}
          <div className="animate-fade-in">
            <div className="card">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-foreground mb-4">{t('withdraw.helpText')}</h2>
                <div className="space-y-4">
                  <div className="p-4 bg-accent/30 rounded-lg">
                    <h3 className="font-semibold text-foreground mb-2">📞 {t('withdraw.helpLink')}</h3>
                    <p className="text-sm text-muted-foreground">
                      {t('withdraw.description')}
                    </p>
                  </div>
                  
                  <div className="p-4 bg-warning/10 border border-warning/20 rounded-lg">
                    <h3 className="font-semibold text-warning mb-2">⚠️ {t('withdraw.minimumWithdrawal')}</h3>
                    <p className="text-sm text-muted-foreground">
                      الحد الأدنى للسحب: 10 USDT
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </AuthGuard>
  );
}

// Countdown Timer Component
function CountdownTimer({ targetDate }: { targetDate: string }) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const target = new Date(targetDate).getTime();
      const difference = target - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <div className="flex justify-center gap-4 my-4">
      <div className="text-center">
        <div className="bg-primary/20 rounded-lg p-3 min-w-[60px]">
          <div className="text-2xl font-bold text-primary">{timeLeft.days}</div>
          <div className="text-xs text-primary/70">أيام</div>
        </div>
      </div>
      <div className="text-center">
        <div className="bg-primary/20 rounded-lg p-3 min-w-[60px]">
          <div className="text-2xl font-bold text-primary">{timeLeft.hours}</div>
          <div className="text-xs text-primary/70">ساعات</div>
        </div>
      </div>
      <div className="text-center">
        <div className="bg-primary/20 rounded-lg p-3 min-w-[60px]">
          <div className="text-2xl font-bold text-primary">{timeLeft.minutes}</div>
          <div className="text-xs text-primary/70">دقائق</div>
        </div>
      </div>
      <div className="text-center">
        <div className="bg-primary/20 rounded-lg p-3 min-w-[60px]">
          <div className="text-2xl font-bold text-primary">{timeLeft.seconds}</div>
          <div className="text-xs text-primary/70">ثواني</div>
        </div>
      </div>
    </div>
  );
}
