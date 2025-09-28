'use client';
import { useEffect, useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';

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
  const t = useTranslations('rewards.random');
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
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-3">{t('title')}</h3>
        <div className="text-center text-gray-500">
          <p>{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-3">{t('title')}</h3>
      
      {error && (
        <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {status.meta?.reason === 'disabled' ? (
        <div className="text-center text-gray-500">
          <p>{t('disabled')}</p>
        </div>
      ) : status.eligible && !status.lastClaimAt ? (
        <div className="text-center">
          <div className="mb-3">
            <div className="text-2xl font-bold text-green-600 mb-1">
              +${status.amount.toFixed(2)}
            </div>
            <p className="text-sm text-gray-600">{t('resetsIn', { time: formatTime(countdown) })}</p>
          </div>
          <button
            onClick={handleClaim}
            disabled={isClaiming}
            className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            aria-busy={isClaiming}
          >
            {isClaiming ? t('common.loading') : t('cta', { amount: status.amount.toFixed(2) })}
          </button>
        </div>
      ) : status.lastClaimAt ? (
        <div className="text-center">
          <div className="mb-3">
            <p className="text-gray-600 mb-2">{t('alreadyClaimed')}</p>
            {countdown > 0 && (
              <div className="text-sm text-gray-500">
                <p>{t('resetsIn', { time: formatTime(countdown) })}</p>
              </div>
            )}
          </div>
          <button
            disabled
            className="w-full bg-gray-400 text-white px-4 py-2 rounded-md cursor-not-allowed"
          >
            {t('alreadyClaimed')}
          </button>
        </div>
      ) : (
        <div className="text-center">
          <div className="mb-3">
            <p className="text-gray-600 mb-2">{t('unavailableToday')}</p>
            {countdown > 0 && (
              <div className="text-sm text-gray-500">
                <p>{t('resetsIn', { time: formatTime(countdown) })}</p>
              </div>
            )}
          </div>
          <button
            disabled
            className="w-full bg-gray-400 text-white px-4 py-2 rounded-md cursor-not-allowed"
          >
            {t('unavailableToday')}
          </button>
        </div>
      )}
    </div>
  );
}
