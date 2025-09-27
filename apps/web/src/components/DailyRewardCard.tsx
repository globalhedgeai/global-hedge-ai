'use client';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

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
  const t = useTranslations('dailyReward');
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
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="text-center text-gray-500">
          {t('common.loading')}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-3">{t('title')}</h3>
      
      {error && (
        <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm" role="alert">
          {error}
        </div>
      )}

      {status.meta?.reason === 'disabled' ? (
        <div className="text-center text-gray-500">
          <p>{t('disabled')}</p>
        </div>
      ) : status.canClaim ? (
        <div className="text-center">
          <div className="mb-3">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {t('amount', { amount: status.amount })}
            </div>
            <p className="text-sm text-gray-600">{t('resetAtMidnight')}</p>
          </div>
          <button
            onClick={handleClaim}
            disabled={isClaiming}
            className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            aria-busy={isClaiming}
          >
            {isClaiming ? t('common.loading') : t('claimButton')}
          </button>
        </div>
      ) : (
        <div className="text-center">
          <div className="mb-3">
            <p className="text-gray-600 mb-2">{t('alreadyClaimed')}</p>
            {countdown > 0 && (
              <div className="text-sm text-gray-500">
                <p>{t('countdown', { time: formatTime(countdown) })}</p>
                <p>{t('resetAtMidnight')}</p>
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
      )}
    </div>
  );
}
