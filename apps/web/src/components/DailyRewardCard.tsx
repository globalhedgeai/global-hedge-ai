'use client';
import { useEffect, useState } from 'react';
import { useTranslation } from '@/lib/translations';
import notificationService from '@/lib/notifications';

interface DailyRewardStatus {
  ok: boolean;
  canClaim: boolean;
  amount: number;
  lastClaimAt?: string;
  secondsToReset: number;
  resetAt: string;
  meta?: { reason: string };
}

interface DailyRewardClaim {
  ok: boolean;
  amount?: number;
  claimedAt?: string;
  resetAt?: string;
  error?: string;
}

export default function DailyRewardCard() {
  const { t } = useTranslation();
  const [status, setStatus] = useState<DailyRewardStatus | null>(null);
  const [isClaiming, setIsClaiming] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Fetch status on mount
  useEffect(() => {
    fetchStatus();
  }, []);

  // Update countdown every second
  useEffect(() => {
    if (!status || status.secondsToReset <= 0) return;

    const interval = setInterval(() => {
      setCountdown(prev => {
        const newCountdown = Math.max(0, prev - 1);
        if (newCountdown === 0) {
          // Refresh status when countdown reaches 0
          fetchStatus();
        }
        return newCountdown;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [status]);

  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/rewards/daily/status');
      const data = await response.json();
      if (data.ok) {
        setStatus(data);
        setCountdown(data.secondsToReset);
        setError(null);
      } else {
        setError(data.error || 'Failed to fetch status');
      }
    } catch {
      setError('Network error');
    }
  };

  const handleClaim = async () => {
    if (!status?.canClaim || isClaiming) return;

    setIsClaiming(true);
    setError(null);

    try {
      const response = await fetch('/api/rewards/daily/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const data: DailyRewardClaim = await response.json();
      
      if (data.ok) {
        // Refresh status after successful claim
        await fetchStatus();
        
        // Dispatch auth state change event to update balance
        window.dispatchEvent(new CustomEvent('authStateChanged'));
        
        // Send notification
        notificationService.sendNotification({
          title: t('dailyReward.title'),
          message: t('dailyReward.claimSuccess'),
          type: 'success',
        });
      } else {
        setError(data.error || 'Claim failed');
      }
    } catch {
      setError('Network error');
    } finally {
      setIsClaiming(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!status) {
    return (
      <div className="card animate-pulse">
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center gap-3 text-muted-foreground">
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm">{t('common.loading')}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card hover-lift animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-success to-green-400 rounded-xl flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
          </svg>
        </div>
        <div>
          <h3 className="text-xl font-bold text-foreground">{t('dailyReward.title')}</h3>
          <p className="text-sm text-muted-foreground">{t('dailyReward.subtitle')}</p>
        </div>
      </div>
      
      {error && (
        <div className="mb-4 p-4 bg-error/10 border border-error/20 rounded-lg animate-fade-in">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-error text-sm font-medium">{error}</p>
          </div>
        </div>
      )}

      {status.meta?.reason === 'disabled' ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
            </svg>
          </div>
          <p className="text-muted-foreground">{t('disabled')}</p>
        </div>
      ) : status.canClaim ? (
        <div className="text-center space-y-6">
          {/* Reward Amount */}
          <div className="space-y-2">
            <div className="text-4xl font-bold gradient-text">
              ${status.amount.toFixed(2)} USDT
            </div>
            <p className="text-sm text-success font-semibold">{t('dailyReward.available')}</p>
          </div>

          {/* Claim Button */}
          <button
            onClick={handleClaim}
            disabled={isClaiming}
            className="btn-primary w-full py-4 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            aria-busy={isClaiming}
          >
            {isClaiming ? (
              <div className="flex items-center justify-center gap-3">
                <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
                {t('common.loading')}
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
                {t('dailyReward.claim')}
              </div>
            )}
          </button>

          {/* Success Animation */}
          {isClaiming && (
            <div className="animate-fade-in">
              <div className="flex items-center justify-center gap-2 text-success">
                <svg className="w-5 h-5 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-medium">{t('dailyReward.claiming')}</span>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center space-y-6">
          {/* Already Claimed */}
          <div className="space-y-4">
            <div className="w-16 h-16 bg-warning/20 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-lg font-semibold text-foreground mb-2">{t('dailyReward.claimed')}</p>
              {countdown > 0 && (
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-warning">
                    {formatTime(countdown)}
                  </div>
                  <p className="text-sm text-muted-foreground">{t('dailyReward.nextClaim')}: {formatTime(countdown)}</p>
                  <p className="text-xs text-muted-foreground">{t('dailyReward.nextClaim')}</p>
                </div>
              )}
            </div>
          </div>

          {/* Disabled Button */}
          <button
            disabled
            className="w-full bg-muted text-muted-foreground px-4 py-4 rounded-lg cursor-not-allowed font-semibold"
          >
            <div className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {t('dailyReward.claimed')}
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
