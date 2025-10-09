"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import Link from 'next/link';
import { useTranslation, useLanguage } from '@/lib/translations';
import { CryptocurrencyConfig } from '@/lib/cryptocurrencies';
import AuthGuard from '@/components/AuthGuard';
import { formatCurrency } from '@/lib/numberFormat';

type DepositItem = {
  id: string;
  amount: number;
  cryptocurrency: string;
  status: string;
  proofImageUrl?: string | null;
  rewardAmount?: number;
  createdAt?: string;
};

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

export default function DepositPage() {
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [list, setList] = useState<DepositItem[]>([]);
  const [policies, setPolicies] = useState<Policies | null>(null);
  const [amount, setAmount] = useState<string>("");
  const [selectedCrypto, setSelectedCrypto] = useState<string>("USDT_TRC20");
  const [cryptocurrencies, setCryptocurrencies] = useState<CryptocurrencyConfig[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { t } = useTranslation();
  const { locale } = useLanguage();
  const isRTL = locale === 'ar';

  const currentCrypto = cryptocurrencies.find(crypto => crypto.id === selectedCrypto);

  useEffect(() => {
    if (canvasRef.current && currentCrypto && currentCrypto.address && currentCrypto.address.trim()) {
      try {
        QRCode.toCanvas(canvasRef.current, currentCrypto.address, { 
          width: 200,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });
      } catch (err) {
        console.error('QR Code generation failed:', err);
        // إضافة رسالة خطأ واضحة
        if (canvasRef.current) {
          const ctx = canvasRef.current.getContext('2d');
          if (ctx) {
            ctx.clearRect(0, 0, 200, 200);
            ctx.fillStyle = '#f0f0f0';
            ctx.fillRect(0, 0, 200, 200);
            ctx.fillStyle = '#666';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('QR Code Error', 100, 100);
          }
        }
      }
    } else if (canvasRef.current && currentCrypto && (!currentCrypto.address || !currentCrypto.address.trim())) {
      // إذا لم يكن هناك عنوان، اعرض رسالة
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, 200, 200);
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(0, 0, 200, 200);
        ctx.fillStyle = '#666';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('No Address Available', 100, 100);
      }
    }
  }, [selectedCrypto, currentCrypto]);

  useEffect(() => {
    refresh();
    fetchPolicies();
    fetchCryptocurrencies();
  }, []);

  async function fetchPolicies() {
    try {
      const response = await fetch('/api/policies');
      const data = await response.json();
      if (data.ok) {
        setPolicies(data.policies);
      }
    } catch (error) {
      console.error('Failed to fetch policies:', error);
    }
  }

  async function fetchCryptocurrencies() {
    try {
      const response = await fetch('/api/cryptocurrencies');
      const data = await response.json();
      if (data.ok) {
        setCryptocurrencies(data.cryptocurrencies);
      }
    } catch (error) {
      console.error('Failed to fetch cryptocurrencies:', error);
    }
  }

  async function refresh() {
    try {
      const response = await fetch('/api/deposits');
      const data = await response.json();
      if (data.ok) {
        setList(data.items);
      }
    } catch (error) {
      console.error('Failed to fetch deposits:', error);
    }
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    const formEl = e.currentTarget;
    const form = new FormData(formEl);

    try {
      // First upload the proof image if provided
      const proofFile = form.get('proofImage') as File;
      let proofImageUrl = null;
      
      if (proofFile && proofFile.size > 0) {
        const uploadFormData = new FormData();
        uploadFormData.append('file', proofFile);
        uploadFormData.append('folder', 'deposit-proofs');
        
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: uploadFormData,
        });
        
        const uploadResult = await uploadResponse.json();
        if (uploadResult.success) {
          proofImageUrl = uploadResult.url;
        } else {
          throw new Error(uploadResult.error || 'Failed to upload proof image');
        }
      }

      // Remove the file from form data and add the URL
      form.delete('proofImage');
      if (proofImageUrl) {
        form.append('proofImageUrl', proofImageUrl);
      }

      // Add cryptocurrency selection
      form.append('cryptocurrency', selectedCrypto);

      const r = await fetch("/api/deposits", { method: "POST", body: form });
      const j = (await r.json()) as { ok: boolean; error?: string; rewardAmount?: number };
      if (!r.ok || !j.ok) throw new Error(j.error || "Failed");
      
      let successMsg = t('deposit.success');
      if (j.rewardAmount && j.rewardAmount > 0) {
        successMsg += ` ${t('deposit.rewardMessage')} ${j.rewardAmount} USDT`;
      }
      
      setMessage(`✅ ${successMsg}`);
      formEl.reset();
      setAmount("");
      await refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t('errors.generic');
      setMessage(`❌ ${t('deposit.error')}: ${msg}`);
    } finally {
      setSubmitting(false);
    }
  }

  const calculateFee = () => {
    if (!policies || !amount) return { feeAmount: 0, netAmount: 0 };
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) return { feeAmount: 0, netAmount: 0 };
    const feeAmount = (amountNum * policies.deposits.feePct) / 100;
    const netAmount = amountNum + feeAmount; // الإيداع: المبلغ + الرسوم
    return { feeAmount, netAmount };
  };

  const { feeAmount, netAmount } = calculateFee();

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-success to-green-400 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold gradient-text">{t('deposit.title')}</h1>
          </div>
          <p className="text-muted-foreground text-lg">{t('deposit.subtitle')}</p>
        </div>

        {/* App Download Notice */}
        <div className="mb-6 p-4 bg-gradient-to-r from-primary/10 to-yellow-400/10 border border-primary/20 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-yellow-400 rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold">G</span>
              </div>
              <div>
                <h3 className="font-bold text-foreground">📱 تطبيق الهاتف متاح الآن!</h3>
                <p className="text-sm text-muted-foreground">استخدم التطبيق للوصول السريع والآمن</p>
              </div>
            </div>
            <Link href={`/${locale}/download`} className="btn-primary px-4 py-2 text-sm">
              تحميل التطبيق
            </Link>
          </div>
        </div>

        {/* Fee Information */}
        {policies && (
          <div className="mb-6 animate-fade-in">
            <div className="card border-warning/20 bg-warning/5">
              <div className="p-4">
                <div className="flex items-center gap-3 mb-2">
                  <svg className="w-5 h-5 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <h3 className="text-lg font-semibold text-warning">{t('deposit.feeInfo')}</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  {t('deposit.feeDescription').replace('{fee}', policies.deposits.feePct.toString())}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Wallet Address Section */}
          <div className="animate-fade-in">
            <div className="card">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-foreground mb-4">{t('deposit.walletAddress')}</h2>
                
                {/* Cryptocurrency Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-foreground mb-2">
                    {t('deposit.selectCryptocurrency')}
                  </label>
                  <select
                    value={selectedCrypto}
                    onChange={(e) => setSelectedCrypto(e.target.value)}
                    className="input w-full"
                  >
                    {cryptocurrencies.map((crypto) => (
                      <option key={crypto.id} value={crypto.id}>
                        {crypto.icon} {crypto.name} ({crypto.symbol}) - {crypto.network}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Wallet Address */}
                {currentCrypto && (
                  <div className="space-y-4">
                    {/* Special highlighting for USDT TRC20 */}
                    {currentCrypto.id === 'USDT_TRC20' && (
                      <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-2xl">🟡</span>
                          <h3 className="font-bold text-lg text-yellow-800">USDT على شبكة TRC20</h3>
                        </div>
                        <p className="text-sm text-yellow-700 mb-3">
                          هذا هو العنوان الرسمي لشركة Global Hedge AI لاستقبال إيداعات USDT على شبكة TRC20
                        </p>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        {t('deposit.address')} ({currentCrypto.symbol}) - {currentCrypto.network}
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={currentCrypto.address}
                          readOnly
                          className="input flex-1 font-mono text-sm"
                        />
                        <button
                          onClick={() => navigator.clipboard.writeText(currentCrypto.address)}
                          className="btn-secondary px-3 py-2"
                          title="نسخ العنوان"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </button>
                      </div>
                      {!currentCrypto.address && (
                        <p className="text-red-500 text-sm mt-1">
                          ⚠️ عنوان المحفظة غير محدد. يرجى التواصل مع الإدارة.
                        </p>
                      )}
                    </div>

                    {/* QR Code */}
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-2">{t('deposit.qrCode')}</p>
                      <div className="inline-block p-4 bg-white rounded-lg">
                        <canvas ref={canvasRef} className="block" />
                      </div>
                    </div>

                    {/* Minimum Deposit */}
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">
                        {t('deposit.minimumDeposit')}: {currentCrypto.minDeposit} {currentCrypto.symbol}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Deposit Form */}
          <div className="animate-fade-in">
            <div className="card">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-foreground mb-4">{t('deposit.submitDeposit')}</h2>
                
                <form onSubmit={onSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      {t('deposit.amount')} ({currentCrypto?.symbol})
                    </label>
                    <input
                      type="number"
                      name="amount"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      min={currentCrypto?.minDeposit || 0}
                      step="0.000001"
                      className="input w-full"
                      placeholder={t('deposit.amountPlaceholder')}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      {t('deposit.transactionId')}
                    </label>
                    <input
                      type="text"
                      name="txId"
                      className="input w-full"
                      placeholder={t('deposit.transactionIdPlaceholder')}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      {t('deposit.proofImage')}
                    </label>
                    <input
                      type="file"
                      name="proofImage"
                      accept="image/*,.pdf"
                      className="input w-full"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {t('deposit.proofImageHelp')}
                    </p>
                  </div>

                  {/* Fee Calculation */}
                  {amount && (
                    <div className="p-4 bg-accent/50 rounded-lg">
                      <h3 className="text-sm font-semibold text-foreground mb-2">{t('deposit.feeCalculation')}</h3>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">{t('deposit.depositAmount')}:</span>
                          <span className="text-foreground">{amount} {currentCrypto?.symbol}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">{t('deposit.fee')}:</span>
                          <span className="text-warning">{feeAmount.toFixed(6)} {currentCrypto?.symbol}</span>
                        </div>
                        <div className="flex justify-between font-semibold">
                          <span className="text-foreground">{t('deposit.netAmount')}:</span>
                          <span className="text-success">{netAmount.toFixed(6)} {currentCrypto?.symbol}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submitting || !amount || !currentCrypto}
                    className="btn-primary w-full py-3"
                  >
                    {submitting ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
                        <span>{t('deposit.submitting')}</span>
                      </div>
                    ) : (
                      t('deposit.submit')
                    )}
                  </button>
                </form>

                {message && (
                  <div className={`mt-4 p-3 rounded-lg text-sm ${
                    message.startsWith('✅') 
                      ? 'bg-success/10 text-success border border-success/20' 
                      : 'bg-error/10 text-error border border-error/20'
                  }`}>
                    {message}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Deposit History */}
        <div className="mt-8 animate-fade-in">
          <div className="card">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">{t('deposit.history')}</h2>
              
              {list.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <p className="text-muted-foreground">{t('deposit.noDeposits')}</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <div className="min-w-full">
                    <div className="bg-card border border-border rounded-lg overflow-hidden">
                      <div className="bg-accent/50 px-6 py-4 border-b border-border">
                        <div className="grid grid-cols-5 gap-4 text-sm font-semibold text-foreground">
                          <div>{t('deposit.amount')}</div>
                          <div>{t('deposit.cryptocurrency')}</div>
                          <div>{t('deposit.status')}</div>
                          <div>{t('deposit.date')}</div>
                          <div>{t('deposit.reward')}</div>
                        </div>
                      </div>
                      <div className="divide-y divide-border">
                        {list.map((item) => {
                          const crypto = cryptocurrencies.find(c => c.id === item.cryptocurrency);
                          return (
                            <div key={item.id} className="px-6 py-4 hover:bg-accent/20 transition-colors">
                              <div className="grid grid-cols-5 gap-4 items-center">
                                <div className="text-foreground font-medium">
                                  {item.amount} {crypto?.symbol || item.cryptocurrency}
                                </div>
                                <div className="text-muted-foreground flex items-center gap-2">
                                  <span className="text-lg">{crypto?.icon}</span>
                                  <div>
                                    <div className="font-medium">{crypto?.name || item.cryptocurrency}</div>
                                    <div className="text-xs text-muted-foreground">{crypto?.network || 'Unknown'}</div>
                                  </div>
                                </div>
                                <div>
                                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                    item.status === 'APPROVED' ? 'bg-success/10 text-success border border-success/20' :
                                    item.status === 'PENDING' ? 'bg-warning/10 text-warning border border-warning/20' :
                                    'bg-error/10 text-error border border-error/20'
                                  }`}>
                                    <div className={`w-2 h-2 rounded-full mr-2 ${
                                      item.status === 'APPROVED' ? 'bg-success' :
                                      item.status === 'PENDING' ? 'bg-warning' :
                                      'bg-error'
                                    }`}></div>
                                    {t(`deposit.status.${item.status.toLowerCase()}`)}
                                  </span>
                                </div>
                                <div className="text-muted-foreground text-sm">
                                  {new Date(item.createdAt || '').toLocaleDateString(locale)}
                                </div>
                                <div className="text-success font-medium">
                                  {item.rewardAmount ? (
                                    <span className="inline-flex items-center px-2 py-1 bg-success/10 text-success rounded-lg text-sm">
                                      +{item.rewardAmount} USDT
                                    </span>
                                  ) : (
                                    <span className="text-muted-foreground">-</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
    </AuthGuard>
  );
}