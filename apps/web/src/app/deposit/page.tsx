"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslation } from '@/lib/translations';
import QRCode from "qrcode";

const COMPANY_ADDRESS =
  process.env.NEXT_PUBLIC_COMPANY_ADDRESS ||
  "TKaAamEouHjG9nZwoTPhgYUerejbBHGMop";

type DepositItem = {
  id: string;
  amount: number;
  network: string;
  status: string;
  proofImageUrl?: string | null;
};

export default function DepositPage() {
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [list, setList] = useState<DepositItem[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { t } = useTranslation();

  useEffect(() => {
    if (canvasRef.current) {
      try {
        QRCode.toCanvas(canvasRef.current, COMPANY_ADDRESS, { width: 160 });
      } catch {}
    }
    void refresh();
  }, []);

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
      const j = (await r.json()) as { ok: boolean; error?: string };
      if (!r.ok || !j.ok) throw new Error(j.error || t('common.error'));
      setMessage(t('deposit.success'));
      formEl.reset();
      await refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t('common.error');
      setMessage(`${t('common.error')}: ${msg}`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main style={{ padding: 24, maxWidth: 920, margin: "0 auto", fontFamily: "system-ui" }}>
      <h1 style={{ marginBottom: 8 }}>{t('deposit.title')}</h1>
      <p style={{ color: "#888", marginBottom: 20 }}>
        {t('deposit.instructions')}
      </p>

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
              {t('deposit.amount')}
              <input name="amount" type="number" step="0.01" min="0" required style={{ width: "100%" }} />
            </label>

            <label>
              {t('deposit.txId')}
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
              {submitting ? t('deposit.submitting') : t('deposit.submit')}
            </button>

            {message && <div>{message}</div>}
          </div>
        </form>
      </section>

      <h3 style={{ margin: "24px 0 8px" }}>{t('deposit.history')}</h3>
      <div style={{ border: "1px solid #222", borderRadius: 12, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead style={{ background: "#111827", color: "#e5e7eb" }}>
            <tr>
              <th style={{ textAlign: "left", padding: 8 }}>{t('deposit.id')}</th>
              <th style={{ textAlign: "left", padding: 8 }}>{t('deposit.amount')}</th>
              <th style={{ textAlign: "left", padding: 8 }}>{t('deposit.network')}</th>
              <th style={{ textAlign: "left", padding: 8 }}>{t('deposit.status')}</th>
              <th style={{ textAlign: "left", padding: 8 }}>{t('deposit.proof')}</th>
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
              <tr><td colSpan={5} style={{ padding: 8, color: "#888" }}>{t('deposit.noDeposits')}</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
