"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { useTranslations, useLocale } from 'next-intl';

const COMPANY_ADDRESS =
  process.env.NEXT_PUBLIC_COMPANY_ADDRESS ||
  "TKaAamEouHjG9nZwoTPhgYUerejbBHGMop";

type DepositItem = {
  id: string;
  amount: number;
  network: string;
  status: string;
  proofImageUrl?: string | null;
  rewardAmount?: number;
};

type Policies = {
  depositFeePct: number;
  withdraw: {
    firstWithdrawMinDays: number;
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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const t = useTranslations();
  const locale = useLocale();
  const isRTL = locale === 'ar';

  useEffect(() => {
    if (canvasRef.current) {
      try {
        QRCode.toCanvas(canvasRef.current, COMPANY_ADDRESS, { width: 160 });
      } catch {}
    }
    void refresh();
    void fetchPolicies();
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

  async function refresh() {
    const r = await fetch("/api/deposits");
    const j = (await r.json()) as { ok: boolean; items?: DepositItem[] };
    if (j.ok && Array.isArray(j.items)) setList(j.items);
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    const formEl = e.currentTarget;
    const form = new FormData(formEl);

    try {
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
    const feeAmount = (amountNum * policies.depositFeePct) / 100;
    const netAmount = amountNum - feeAmount;
    return { feeAmount, netAmount };
  };

  const { feeAmount, netAmount } = calculateFee();

  return (
    <main style={{ padding: 24, maxWidth: 920, margin: "0 auto", fontFamily: "system-ui" }}>
      <h1 style={{ marginBottom: 8 }}>{t('deposit.title')}</h1>
      <p style={{ color: "#888", marginBottom: 20 }}>
        {t('deposit.description')}
      </p>

      {/* Fee Information */}
      {policies && policies.depositFeePct > 0 && (
        <div style={{ 
          padding: 16, 
          marginBottom: 20, 
          border: "1px solid #f59e0b", 
          borderRadius: 8, 
          background: "#fef3c7",
          color: "#92400e"
        }}>
          <h3 style={{ margin: "0 0 8px" }}>{t('deposit.feeInfo')}</h3>
          <p style={{ margin: 0 }}>
            {t('policies.depositFee')}: {policies.depositFeePct}%
          </p>
        </div>
      )}

      <section style={{ display: "flex", gap: 24, alignItems: "flex-start", marginBottom: 24 }}>
        <div style={{ padding: 16, border: "1px solid #222", borderRadius: 12, background: "#0b1220", color: "#e5e7eb" }}>
          <div style={{ marginBottom: 8 }}>{t('deposit.walletAddress')}</div>
          <code style={{ fontSize: 14, wordBreak: "break-all" }}>{COMPANY_ADDRESS}</code>
          <div style={{ marginTop: 12 }}>
            <canvas ref={canvasRef} />
          </div>
          <button
            style={{ marginTop: 12 }}
            onClick={() => navigator.clipboard.writeText(COMPANY_ADDRESS)}
            type="button"
          >
{t('deposit.copyAddress')}
          </button>
        </div>

        <form onSubmit={onSubmit} style={{ flex: 1, padding: 16, border: "1px solid #222", borderRadius: 12 }}>
          <div style={{ display: "grid", gap: 12 }}>
            <label>
              {t('deposit.amount')} (USDT)
              <input 
                name="amount" 
                type="number" 
                step="0.01" 
                min="0" 
                required 
                style={{ width: "100%" }}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </label>

            {/* Fee Preview */}
            {policies && policies.depositFeePct > 0 && amount && (
              <div style={{ padding: 12, background: "#f3f4f6", borderRadius: 8, fontSize: 14 }}>
                <div><strong>{t('deposit.feeAmount')}:</strong> {feeAmount.toFixed(2)} USDT</div>
                <div><strong>{t('deposit.netAmount')}:</strong> {netAmount.toFixed(2)} USDT</div>
              </div>
            )}

            <label>
              TXID
              <input name="txId" type="text" required style={{ width: "100%" }} />
            </label>

            <label>
              {t('deposit.network')}
              <select name="network" defaultValue="TRC20" style={{ width: "100%" }}>
                <option value="TRC20">TRC20 (USDT)</option>
              </select>
            </label>

            <label>
              {t('deposit.proofImage')}
              <input name="proof" type="file" accept="image/*" required />
            </label>

            <button type="submit" disabled={submitting}>
              {submitting ? t('deposit.processing') : t('deposit.submit')}
            </button>

            {message && <div>{message}</div>}
            
            {/* Help Text */}
            <div style={{ 
              marginTop: 16, 
              padding: 12, 
              background: "#f0f9ff", 
              border: "1px solid #0ea5e9", 
              borderRadius: 8,
              fontSize: 14,
              color: "#0c4a6e"
            }}>
              {t('deposit.helpText')} <a href={`/${locale}/messages`} style={{ color: "#0ea5e9", textDecoration: "underline" }}>{t('deposit.helpLink')}</a>
            </div>
          </div>
        </form>
      </section>

      <h3 style={{ margin: "24px 0 8px" }}>{t('deposit.depositHistory')}</h3>
      <div style={{ border: "1px solid #222", borderRadius: 12, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead style={{ background: "#111827", color: "#e5e7eb" }}>
            <tr>
              <th style={{ textAlign: isRTL ? "right" : "left", padding: 8 }}>{t('deposit.id')}</th>
              <th style={{ textAlign: isRTL ? "right" : "left", padding: 8 }}>{t('deposit.amount')}</th>
              <th style={{ textAlign: isRTL ? "right" : "left", padding: 8 }}>{t('deposit.network')}</th>
              <th style={{ textAlign: isRTL ? "right" : "left", padding: 8 }}>{t('deposit.status')}</th>
              <th style={{ textAlign: isRTL ? "right" : "left", padding: 8 }}>{t('deposit.reward')}</th>
              <th style={{ textAlign: isRTL ? "right" : "left", padding: 8 }}>{t('deposit.proof')}</th>
            </tr>
          </thead>
          <tbody>
            {list.map((d) => (
              <tr key={d.id} style={{ borderTop: "1px solid #222" }}>
                <td style={{ padding: 8 }}>{d.id}</td>
                <td style={{ padding: 8 }}>{d.amount}</td>
                <td style={{ padding: 8 }}>{d.network}</td>
                <td style={{ padding: 8 }}>{d.status}</td>
                <td style={{ padding: 8 }}>
                  {d.rewardAmount && d.rewardAmount > 0 ? (
                    <span style={{ color: "#10b981", fontWeight: "bold" }}>
                      +{d.rewardAmount} USDT
                    </span>
                  ) : (
                    "-"
                  )}
                </td>
                <td style={{ padding: 8 }}>
                  {d.proofImageUrl ? (
                    <a
                      href={`/api/proofs?key=${encodeURIComponent(d.proofImageUrl)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {t('deposit.view')}
                    </a>
                  ) : (
                    "-"
                  )}
                </td>
              </tr>
            ))}
            {list.length === 0 && (
              <tr><td colSpan={6} style={{ padding: 8, color: "#888" }}>{t('deposit.noData')}</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
