"use client";

import { useEffect, useMemo, useState } from "react";
import ToolPageLayout from "@/app/components/tools/ToolPageLayout";
import CopyButton from "@/app/components/tools/CopyButton";

interface Sku {
  id: string;
  name: string;
  count: number;
  price: number;
}

const DEFAULT_SKUS: Sku[] = [
  { id: "business-basic", name: "Microsoft 365 Business Basic", count: 0, price: 6 },
  { id: "business-standard", name: "Microsoft 365 Business Standard", count: 0, price: 12.5 },
  { id: "business-premium", name: "Microsoft 365 Business Premium", count: 0, price: 22 },
  { id: "e3", name: "Microsoft 365 E3", count: 0, price: 36 },
  { id: "e5", name: "Microsoft 365 E5", count: 0, price: 57 },
  { id: "exchange-1", name: "Exchange Online Plan 1", count: 0, price: 4 },
  { id: "teams-phone", name: "Microsoft Teams Phone Standard", count: 0, price: 8 },
  { id: "defender-p2", name: "Defender for Office 365 P2", count: 0, price: 5 },
];

const STORAGE_KEY = "ss.licence-planner";

export default function LicencePlannerPage() {
  const [skus, setSkus] = useState<Sku[]>(DEFAULT_SKUS);
  const [currency, setCurrency] = useState("GBP");

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { skus?: Sku[]; currency?: string };
        if (parsed?.skus && Array.isArray(parsed.skus)) setSkus(parsed.skus);
        if (parsed?.currency) setCurrency(parsed.currency);
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ skus, currency }));
    } catch {
      /* ignore */
    }
  }, [skus, currency]);

  const totals = useMemo(() => {
    const monthly = skus.reduce((sum, s) => sum + s.price * s.count, 0);
    return { monthly, yearly: monthly * 12, users: skus.reduce((s, x) => s + x.count, 0) };
  }, [skus]);

  function update(id: string, patch: Partial<Sku>) {
    setSkus((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }

  function resetPrices() {
    setSkus((prev) =>
      prev.map((s) => ({ ...s, price: DEFAULT_SKUS.find((d) => d.id === s.id)?.price ?? s.price })),
    );
  }

  function resetCounts() {
    setSkus((prev) => prev.map((s) => ({ ...s, count: 0 })));
  }

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(n);

  const summary = useMemo(
    () =>
      [
        `# Microsoft 365 licence plan`,
        ``,
        `Currency: ${currency}`,
        `Total users: ${totals.users}`,
        `Monthly cost: ${fmt(totals.monthly)}`,
        `Annual cost: ${fmt(totals.yearly)}`,
        ``,
        `| SKU | Users | Price / user | Monthly | Annual |`,
        `|---|---:|---:|---:|---:|`,
        ...skus
          .filter((s) => s.count > 0)
          .map(
            (s) =>
              `| ${s.name} | ${s.count} | ${fmt(s.price)} | ${fmt(s.count * s.price)} | ${fmt(s.count * s.price * 12)} |`,
          ),
      ].join("\n"),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [skus, currency, totals],
  );

  return (
    <ToolPageLayout
      title="Microsoft 365 Licence Planner"
      description="Plan how many of each SKU you need, override list prices for your tenant's agreement, and see monthly / annual cost. Counts and prices are saved locally to your browser."
    >
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <Meta label="Skill" body="Licensing, FinOps." accent="cyan" />
        <Meta label="Why" body="Forecast renewal cost and right-size before the bill arrives." accent="violet" />
        <Meta label="Privacy" body="Prices and counts are stored in localStorage. Nothing is sent anywhere." accent="emerald" />
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-3 rounded-[24px] border border-white/10 bg-[rgba(255,255,255,0.03)] p-4 text-xs text-white/65">
        <label className="inline-flex items-center gap-2">
          Currency
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="rounded-lg border border-white/10 bg-black/30 px-2 py-1 text-xs text-white"
          >
            {["GBP", "EUR", "USD"].map((c) => (
              <option key={c} value={c} className="bg-[#0b1220]">
                {c}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          onClick={resetCounts}
          className="rounded-lg border border-white/10 px-3 py-1 text-white/75 transition-colors hover:border-white/30 hover:text-white"
        >
          Reset counts
        </button>
        <button
          type="button"
          onClick={resetPrices}
          className="rounded-lg border border-white/10 px-3 py-1 text-white/75 transition-colors hover:border-white/30 hover:text-white"
        >
          Reset prices to defaults
        </button>
      </div>

      <div className="rounded-[24px] border border-white/10 bg-[rgba(255,255,255,0.03)] p-1 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-[0.18em] text-white/55">
                <th className="px-4 py-3">SKU</th>
                <th className="px-4 py-3 text-right">Users</th>
                <th className="px-4 py-3 text-right">Price / user / mo</th>
                <th className="px-4 py-3 text-right">Monthly</th>
                <th className="px-4 py-3 text-right">Annual</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {skus.map((s) => {
                const monthly = s.count * s.price;
                return (
                  <tr key={s.id} className="text-white/85">
                    <td className="px-4 py-2">
                      <input
                        value={s.name}
                        onChange={(e) => update(s.id, { name: e.target.value })}
                        className="w-full rounded-lg border border-transparent bg-transparent px-2 py-1 text-sm text-white focus:border-cyan-400/30 focus:bg-black/30"
                      />
                    </td>
                    <td className="px-4 py-2 text-right">
                      <input
                        type="number"
                        min={0}
                        value={s.count}
                        onChange={(e) => update(s.id, { count: Math.max(0, Number(e.target.value || 0)) })}
                        className="w-20 rounded-lg border border-white/10 bg-black/30 px-2 py-1 text-right text-sm text-white focus:border-cyan-400/30"
                      />
                    </td>
                    <td className="px-4 py-2 text-right">
                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        value={s.price}
                        onChange={(e) => update(s.id, { price: Math.max(0, Number(e.target.value || 0)) })}
                        className="w-24 rounded-lg border border-white/10 bg-black/30 px-2 py-1 text-right text-sm text-white focus:border-cyan-400/30"
                      />
                    </td>
                    <td className="px-4 py-2 text-right tabular-nums">{fmt(monthly)}</td>
                    <td className="px-4 py-2 text-right tabular-nums">{fmt(monthly * 12)}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-black/30 text-white">
                <th className="px-4 py-3 text-left text-sm font-semibold">Total</th>
                <th className="px-4 py-3 text-right text-sm font-semibold">{totals.users}</th>
                <th />
                <th className="px-4 py-3 text-right text-sm font-semibold tabular-nums">{fmt(totals.monthly)}</th>
                <th className="px-4 py-3 text-right text-sm font-semibold tabular-nums">{fmt(totals.yearly)}</th>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <div className="mt-6 rounded-[24px] border border-white/10 bg-black/30 p-4">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/55">
            Plan summary (Markdown)
          </p>
          <CopyButton text={summary} label="Copy summary" />
        </div>
        <pre className="max-h-72 overflow-auto rounded-xl bg-black/40 p-3 text-xs leading-6 text-white/85 whitespace-pre-wrap">
{summary}
        </pre>
      </div>
    </ToolPageLayout>
  );
}

function Meta({
  label,
  body,
  accent,
}: {
  label: string;
  body: string;
  accent: "cyan" | "violet" | "emerald";
}) {
  const map: Record<string, string> = {
    cyan: "border-cyan-400/20 bg-cyan-500/5 text-cyan-200",
    violet: "border-violet-400/20 bg-violet-500/5 text-violet-200",
    emerald: "border-emerald-400/20 bg-emerald-500/5 text-emerald-200",
  };
  return (
    <div className={`rounded-2xl border p-4 ${map[accent]}`}>
      <p className="text-[10px] font-semibold uppercase tracking-[0.28em] opacity-80">{label}</p>
      <p className="mt-1.5 text-xs leading-6 text-white/75">{body}</p>
    </div>
  );
}
