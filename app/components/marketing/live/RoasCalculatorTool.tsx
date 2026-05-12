"use client";

import { useId, useState } from "react";
import MarketingToolLayout from "@/app/components/marketing/MarketingToolLayout";

const field =
  "w-full rounded-xl border border-white/10 bg-black/35 px-3 py-2.5 text-sm text-white placeholder:text-white/35 focus:border-cyan-500/40 focus:outline-none focus:ring-2 focus:ring-cyan-400/25";
const label = "block text-sm font-medium text-white/75 mb-1.5";
const btnP = "rounded-xl bg-cyan-500/90 px-4 py-2.5 text-sm font-semibold text-white hover:bg-cyan-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60";
const btnS = "rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-white/85 hover:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/25";

function parseMoney(s: string): number | null {
  const t = s.replace(/,/g, "").trim();
  if (!t) return null;
  const n = Number.parseFloat(t);
  if (!Number.isFinite(n) || n < 0) return null;
  return n;
}

export default function RoasCalculatorTool() {
  const id = useId();
  const [spend, setSpend] = useState("");
  const [revenue, setRevenue] = useState("");
  const [err, setErr] = useState("");
  const [roas, setRoas] = useState<number | null>(null);
  const [profit, setProfit] = useState<number | null>(null);

  function calc() {
    const s = parseMoney(spend);
    const r = parseMoney(revenue);
    if (s === null || r === null) {
      setErr("Enter valid non-negative numbers for spend and revenue.");
      setRoas(null);
      setProfit(null);
      return;
    }
    if (s === 0) {
      setErr("Ad spend cannot be zero when calculating ROAS.");
      setRoas(null);
      setProfit(null);
      return;
    }
    setErr("");
    setRoas(r / s);
    setProfit(r - s);
  }

  function reset() {
    setSpend("");
    setRevenue("");
    setErr("");
    setRoas(null);
    setProfit(null);
  }

  return (
    <MarketingToolLayout
      title="ROAS Calculator"
      description="Return on ad spend from revenue and media cost, plus a simple profit or loss estimate before other fixed costs."
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className={label} htmlFor={`${id}-spend`}>
            Ad spend
          </label>
          <input
            id={`${id}-spend`}
            className={field}
            inputMode="decimal"
            value={spend}
            onChange={(e) => setSpend(e.target.value)}
            placeholder="e.g. 5000"
          />
        </div>
        <div>
          <label className={label} htmlFor={`${id}-rev`}>
            Revenue
          </label>
          <input
            id={`${id}-rev`}
            className={field}
            inputMode="decimal"
            value={revenue}
            onChange={(e) => setRevenue(e.target.value)}
            placeholder="e.g. 22000"
          />
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <button type="button" className={btnP} onClick={calc}>
          Calculate
        </button>
        <button type="button" className={btnS} onClick={reset}>
          Reset
        </button>
      </div>

      {err ? (
        <p className="mt-4 rounded-xl border border-rose-500/25 bg-rose-500/10 px-3 py-2 text-sm text-rose-100" role="alert">
          {err}
        </p>
      ) : null}

      {roas !== null && profit !== null ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-black/35 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/45">ROAS</p>
            <p className="mt-2 text-3xl font-semibold tabular-nums text-cyan-200">{roas.toFixed(2)}×</p>
            <p className="mt-1 text-xs text-white/45">Revenue divided by ad spend.</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/35 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/45">Profit / loss (estimate)</p>
            <p className={`mt-2 text-3xl font-semibold tabular-nums ${profit >= 0 ? "text-emerald-300" : "text-rose-300"}`}>
              {profit >= 0 ? "+" : "−"}
              {Math.abs(profit).toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </p>
            <p className="mt-1 text-xs text-white/45">Revenue minus ad spend — excludes COGS and fees.</p>
          </div>
        </div>
      ) : null}
    </MarketingToolLayout>
  );
}
