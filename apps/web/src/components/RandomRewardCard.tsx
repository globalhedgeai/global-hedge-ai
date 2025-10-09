'use client';
import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from '@/lib/translations';
import notificationService from '@/lib/notifications';

interface RandomRewardStatus {
  ok: boolean;
  eligible: boolean;
  amount: number;
  lastClaimAt: string | null;
  secondsToReset: number;
  resetAt: string;
  meta?: {
    reason?: string;
  };
}

export default function RandomRewardCard() {
  const { t } = useTranslation();
  const [status, setStatus] = useState<RandomRewardStatus | null>(null);
  const [isClaiming, setIsClaiming] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      const response = await fetch('/api/rewards/random/status');
      const data = await response.json();
      
      if (data.ok) {
        setStatus(data);
        setCountdown(data.secondsToReset);
        setError(null);
      } else {
        setError(data.error || t('errors.generic'));
      }
    } catch {
      setError(t('errors.networkError'));
    }
  }, [t]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  useEffect(() => {
    if (status && status.secondsToReset > 0) {
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            fetchStatus(); // Refresh status when countdown reaches 0
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [status, fetchStatus]);

  const handleClaim = async () => {
    if (isClaiming) return;
    
    setIsClaiming(true);
    setError(null);

    try {
      const response = await fetch('/api/rewards/random/claim', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.ok) {
        // Refresh status after successful claim
        await fetchStatus();
        
        // Dispatch auth state change event to update balance
        window.dispatchEvent(new CustomEvent('authStateChanged'));
        
        // Send notification
        notificationService.sendNotification({
          title: t('rewards.random.title'),
          message: t('rewards.random.claimSuccess'),
          type: 'success',
        });
      } else {
        setError(data.error || t('errors.generic'));
      }
    } catch {
      setError(t('errors.networkError'));
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
        <div className="w-10 h-10 bg-gradient-to-br from-warning to-yellow-400 rounded-xl flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <h3 className="text-xl font-bold text-foreground">{t('rewards.random.title')}</h3>
          <p className="text-sm text-muted-foreground">{t('rewards.random.subtitle')}</p>
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
      ) : status.eligible && !status.lastClaimAt ? (
        <div className="text-center space-y-6">
          {/* Reward Amount */}
          <div className="space-y-2">
            <div className="text-4xl font-bold gradient-text">
              +${status.amount.toFixed(2)}
            </div>
            <p className="text-sm text-muted-foreground">{t('rewards.random.nextClaim')}: {formatTime(countdown)}</p>
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {t('rewards.random.claim')}
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
                <span className="text-sm font-medium">{t('rewards.random.claiming')}</span>
              </div>
            </div>
          )}
        </div>
      ) : status.lastClaimAt ? (
        <div className="text-center space-y-6">
          {/* Already Claimed */}
          <div className="space-y-4">
            <div className="w-16 h-16 bg-warning/20 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-lg font-semibold text-foreground mb-2">{t('rewards.random.claimed')}</p>
              {countdown > 0 && (
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-warning">
                    {formatTime(countdown)}
                  </div>
                  <p className="text-sm text-muted-foreground">{t('rewards.random.nextClaim')}: {formatTime(countdown)}</p>
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
              {t('rewards.random.claimed')}
            </div>
          </button>
        </div>
      ) : (
        <div className="text-center space-y-6">
          {/* Unavailable */}
          <div className="space-y-4">
            <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-lg font-semibold text-foreground mb-2">{t('rewards.random.notClaimed')}</p>
              {countdown > 0 && (
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-muted-foreground">
                    {formatTime(countdown)}
                  </div>
                  <p className="text-sm text-muted-foreground">{t('rewards.random.nextClaim')}: {formatTime(countdown)}</p>
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
              {t('rewards.random.notClaimed')}
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
