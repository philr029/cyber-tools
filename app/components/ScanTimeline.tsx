"use client";

import { useState, useEffect } from "react";

interface Step {
  id: string;
  label: string;
  detail: string;
  durationMs: number;
}

const SCAN_STEPS: Step[] = [
  { id: "resolve",   label: "Resolving query",         detail: "Detecting IP / domain / URL",     durationMs: 600 },
  { id: "geo",       label: "Geolocating IP",           detail: "Country, city, ISP, ASN",         durationMs: 700 },
  { id: "rep",       label: "IP reputation check",      detail: "AbuseIPDB confidence score",      durationMs: 900 },
  { id: "vt",        label: "VirusTotal analysis",      detail: "Multi-engine threat detection",   durationMs: 1100 },
  { id: "ssl",       label: "SSL certificate check",    detail: "Expiry, issuer, protocol",        durationMs: 700 },
  { id: "headers",   label: "Security headers scan",    detail: "CSP, HSTS, X-Frame-Options",      durationMs: 600 },
  { id: "dns",       label: "DNS records lookup",       detail: "A, MX, TXT, NS records",         durationMs: 800 },
  { id: "blacklist", label: "Blacklist verification",   detail: "Spamhaus, SURBL, Barracuda",      durationMs: 900 },
  { id: "ports",     label: "Port analysis",            detail: "Common TCP ports",                durationMs: 500 },
  { id: "compile",   label: "Compiling results",        detail: "Building threat report",          durationMs: 400 },
];

type StepStatus = "pending" | "running" | "done";

export default function ScanTimeline() {
  const [statuses, setStatuses] = useState<Record<string, StepStatus>>(() =>
    Object.fromEntries(SCAN_STEPS.map((s) => [s.id, "pending"]))
  );
  const [currentIdx, setCurrentIdx] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function runSteps() {
      for (let i = 0; i < SCAN_STEPS.length; i++) {
        if (cancelled) return;
        const step = SCAN_STEPS[i];
        setCurrentIdx(i);
        setStatuses((prev) => ({ ...prev, [step.id]: "running" }));
        await new Promise<void>((res) => setTimeout(res, step.durationMs));
        if (cancelled) return;
        setStatuses((prev) => ({ ...prev, [step.id]: "done" }));
      }
    }

    runSteps();
    return () => { cancelled = true; };
  }, []);

  const doneCount = Object.values(statuses).filter((s) => s === "done").length;
  const progress = Math.round((doneCount / SCAN_STEPS.length) * 100);

  return (
    <div className="flex flex-col items-center py-12 animate-fade-in">
      {/* Spinner + title */}
      <div className="relative w-16 h-16 mb-6">
        <div className="absolute inset-0 rounded-full border-2 border-cyan-500/20" />
        <div className="absolute inset-0 rounded-full border-2 border-t-cyan-500 animate-spin" />
        <div className="absolute inset-2 rounded-full border-2 border-t-blue-500/60 animate-spin-reverse" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-bold text-cyan-400">{progress}%</span>
        </div>
      </div>

      <p className="text-sm font-semibold text-slate-200 mb-1">Scanning target…</p>
      <p className="text-xs text-slate-500 mb-6">
        {currentIdx < SCAN_STEPS.length
          ? SCAN_STEPS[currentIdx].detail
          : "Finalising…"}
      </p>

      {/* Progress bar */}
      <div className="w-full max-w-sm h-1.5 bg-slate-700/50 rounded-full overflow-hidden mb-6">
        <div
          className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Steps list */}
      <div className="w-full max-w-sm space-y-1.5">
        {SCAN_STEPS.map((step, idx) => {
          const status = statuses[step.id];
          return (
            <div
              key={step.id}
              className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-300 ${
                status === "running"
                  ? "bg-cyan-500/10 border border-cyan-500/20"
                  : status === "done"
                  ? "bg-emerald-500/5 border border-transparent"
                  : "border border-transparent opacity-40"
              }`}
            >
              {/* Step indicator */}
              <div className="relative w-5 h-5 flex-shrink-0 flex items-center justify-center">
                {status === "done" && (
                  <svg
                    className="w-5 h-5 text-emerald-400 animate-step-done"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
                {status === "running" && (
                  <>
                    <span className="absolute w-2.5 h-2.5 rounded-full bg-cyan-400 dot-pulse" />
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
                  </>
                )}
                {status === "pending" && (
                  <span className="w-2 h-2 rounded-full bg-slate-600" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p
                  className={`text-xs font-medium leading-tight ${
                    status === "done"
                      ? "text-slate-400"
                      : status === "running"
                      ? "text-slate-200"
                      : "text-slate-500"
                  }`}
                >
                  {step.label}
                </p>
              </div>

              {/* Step number / checkmark */}
              <span className="text-xs text-slate-600 flex-shrink-0">
                {String(idx + 1).padStart(2, "0")}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
