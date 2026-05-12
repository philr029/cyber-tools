"use client";

import { useId, useState } from "react";
import MarketingToolLayout from "@/app/components/marketing/MarketingToolLayout";

const field =
  "w-full rounded-xl border border-white/10 bg-black/35 px-3 py-2.5 text-sm text-white placeholder:text-white/35 focus:border-cyan-500/40 focus:outline-none focus:ring-2 focus:ring-cyan-400/25";
const label = "block text-sm font-medium text-white/75 mb-1.5";
const btnP = "rounded-xl bg-cyan-500/90 px-4 py-2.5 text-sm font-semibold text-white hover:bg-cyan-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60";
const btnS = "rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-white/85 hover:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/25";

function parseCount(s: string): number | null {
  const t = s.replace(/,/g, "").trim();
  if (!t) return null;
  const n = Number.parseFloat(t);
  if (!Number.isFinite(n) || n < 0) return null;
  return n;
}

export default function ConversionRateCalculatorTool() {
  const id = useId();
  const [visitors, setVisitors] = useState("");
  const [conversions, setConversions] = useState("");
  const [err, setErr] = useState("");
  const [rate, setRate] = useState<number | null>(null);

  function calc() {
    const v = parseCount(visitors);
    const c = parseCount(conversions);
    if (v === null || c === null) {
      setErr("Enter valid non-negative numbers.");
      setRate(null);
      return;
    }
    if (v === 0) {
      setErr("Visitors cannot be zero.");
      setRate(null);
      return;
    }
    if (c > v) {
      setErr("Conversions cannot exceed visitors for this simple model.");
      setRate(null);
      return;
    }
    setErr("");
    setRate((c / v) * 100);
  }

  function reset() {
    setVisitors("");
    setConversions("");
    setErr("");
    setRate(null);
  }

  return (
    <MarketingToolLayout
      title="Conversion Rate Calculator"
      description="Classic visitors-to-conversions percentage for landing pages, signup flows and storefront funnels."
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className={label} htmlFor={`${id}-vis`}>
            Visitors
          </label>
          <input
            id={`${id}-vis`}
            className={field}
            inputMode="numeric"
            value={visitors}
            onChange={(e) => setVisitors(e.target.value)}
            placeholder="e.g. 8420"
          />
        </div>
        <div>
          <label className={label} htmlFor={`${id}-cv`}>
            Conversions
          </label>
          <input
            id={`${id}-cv`}
            className={field}
            inputMode="numeric"
            value={conversions}
            onChange={(e) => setConversions(e.target.value)}
            placeholder="e.g. 214"
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

      {rate !== null ? (
        <div className="mt-6 rounded-2xl border border-white/10 bg-black/35 p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/45">Conversion rate</p>
          <p className="mt-2 text-4xl font-semibold tabular-nums text-cyan-200">{rate.toFixed(2)}%</p>
          <p className="mt-2 text-sm text-white/50">Conversions ÷ visitors × 100.</p>
        </div>
      ) : null}
    </MarketingToolLayout>
  );
}
