"use client";

import { useState } from "react";
import type { RiskScore, RiskSeverity, RecommendationPriority } from "@/lib/risk-engine/types";

// ---------------------------------------------------------------------------
// Severity palette
// ---------------------------------------------------------------------------

const SEVERITY_CONFIG: Record<
  RiskSeverity,
  {
    label: string;
    textColor: string;
    bgColor: string;
    ringColor: string;
    barColor: string;
    dotColor: string;
    borderColor: string;
  }
> = {
  safe: {
    label: "Safe",
    textColor: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
    ringColor: "ring-emerald-500/30",
    barColor: "bg-emerald-500",
    dotColor: "bg-emerald-400",
    borderColor: "border-emerald-500/30",
  },
  low: {
    label: "Low",
    textColor: "text-cyan-400",
    bgColor: "bg-cyan-500/10",
    ringColor: "ring-cyan-500/30",
    barColor: "bg-cyan-500",
    dotColor: "bg-cyan-400",
    borderColor: "border-cyan-500/30",
  },
  medium: {
    label: "Medium",
    textColor: "text-amber-400",
    bgColor: "bg-amber-500/10",
    ringColor: "ring-amber-500/30",
    barColor: "bg-amber-400",
    dotColor: "bg-amber-400",
    borderColor: "border-amber-500/30",
  },
  high: {
    label: "High",
    textColor: "text-orange-400",
    bgColor: "bg-orange-500/10",
    ringColor: "ring-orange-500/30",
    barColor: "bg-orange-500",
    dotColor: "bg-orange-400",
    borderColor: "border-orange-500/30",
  },
  critical: {
    label: "Critical",
    textColor: "text-red-400",
    bgColor: "bg-red-500/10",
    ringColor: "ring-red-500/30",
    barColor: "bg-red-500",
    dotColor: "bg-red-400",
    borderColor: "border-red-500/30",
  },
};

const PRIORITY_CONFIG: Record<
  RecommendationPriority,
  { label: string; classes: string; dot: string }
> = {
  immediate: {
    label: "Immediate",
    classes: "bg-red-500/10 text-red-400 ring-1 ring-red-500/30",
    dot: "bg-red-400",
  },
  soon: {
    label: "Soon",
    classes: "bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/30",
    dot: "bg-amber-400",
  },
  optional: {
    label: "Optional",
    classes: "bg-slate-500/10 text-slate-400 ring-1 ring-slate-500/30",
    dot: "bg-slate-400",
  },
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function ScoreGauge({ score, severity }: { score: number; severity: RiskSeverity }) {
  const { textColor } = SEVERITY_CONFIG[severity];
  const circumference = 2 * Math.PI * 28;
  const offset = circumference * (1 - score / 100);

  // Track color (darker version of the fill color)
  const trackClass = "stroke-[#1e2d4a]";

  return (
    <div className="relative w-20 h-20 flex-shrink-0">
      <svg className="w-20 h-20 -rotate-90" viewBox="0 0 72 72" aria-hidden="true">
        <circle cx="36" cy="36" r="28" fill="none" strokeWidth="7" className={trackClass} />
        <circle
          cx="36"
          cy="36"
          r="28"
          fill="none"
          strokeWidth="7"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={`${textColor} transition-all duration-700`}
          style={{ stroke: "currentColor" }}
        />
      </svg>
      <span
        className={`absolute inset-0 flex items-center justify-center text-xl font-bold ${textColor}`}
      >
        {score}
      </span>
    </div>
  );
}

function ScoreBar({ score, severity }: { score: number; severity: RiskSeverity }) {
  const { barColor } = SEVERITY_CONFIG[severity];
  return (
    <div className="w-full h-2 bg-slate-700/40 rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-700 ${barColor}`}
        style={{ width: `${Math.max(score, 2)}%` }}
      />
    </div>
  );
}

function ConfidenceIndicator({
  confidence,
  label,
}: {
  confidence: number;
  label: RiskScore["confidenceLabel"];
}) {
  const colorClass =
    label === "High"
      ? "text-emerald-400"
      : label === "Medium"
      ? "text-amber-400"
      : "text-slate-400";

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-slate-500">Confidence:</span>
      <div className="flex items-center gap-1.5">
        <div className="flex gap-0.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`w-4 h-1.5 rounded-full transition-colors ${
                confidence >= (i + 1) * 33
                  ? colorClass.replace("text-", "bg-")
                  : "bg-slate-700"
              }`}
            />
          ))}
        </div>
        <span className={`text-xs font-medium ${colorClass}`}>{label}</span>
        <span className="text-xs text-slate-600">({confidence}%)</span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

interface RiskScorePanelProps {
  risk: RiskScore;
}

export default function RiskScorePanel({ risk }: RiskScorePanelProps) {
  const [recommendationsOpen, setRecommendationsOpen] = useState(false);
  const cfg = SEVERITY_CONFIG[risk.severity];

  return (
    <div
      className={`rounded-2xl bg-[#0f1629] border ${cfg.borderColor} overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.3)]`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#162038]">
        <div className="flex items-center gap-2.5">
          <span className={`flex items-center justify-center w-8 h-8 rounded-lg ${cfg.bgColor}`}>
            <svg
              className={`w-4 h-4 ${cfg.textColor}`}
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z"
                clipRule="evenodd"
              />
            </svg>
          </span>
          <h3 className="text-sm font-semibold text-slate-200">Risk Assessment</h3>
        </div>
        {/* Severity badge */}
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${cfg.bgColor} ${cfg.textColor} ring-1 ${cfg.ringColor}`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${cfg.dotColor}`} />
          {cfg.label}
        </span>
      </div>

      <div className="px-5 py-4 space-y-4">
        {/* Score row */}
        <div className="flex items-center gap-5">
          <ScoreGauge score={risk.score} severity={risk.severity} />
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-end justify-between">
              <span className="text-xs text-slate-500">Risk Score</span>
              <span className={`text-sm font-bold ${cfg.textColor}`}>{risk.score} / 100</span>
            </div>
            <ScoreBar score={risk.score} severity={risk.severity} />
            <ConfidenceIndicator confidence={risk.confidence} label={risk.confidenceLabel} />
          </div>
        </div>

        {/* Explanation */}
        <div className="rounded-xl bg-slate-700/10 border border-[#162038] px-4 py-3">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
            Explanation
          </p>
          <p className="text-sm text-slate-300 leading-relaxed">{risk.explanation}</p>
        </div>

        {/* Recommendations toggle */}
        <div>
          <button
            type="button"
            onClick={() => setRecommendationsOpen((o) => !o)}
            className="flex w-full items-center justify-between rounded-xl bg-slate-700/10 border border-[#162038] px-4 py-3 hover:bg-slate-700/20 transition-colors"
            aria-expanded={recommendationsOpen}
          >
            <div className="flex items-center gap-2">
              <svg
                className="w-4 h-4 text-slate-400"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                Recommendations
              </span>
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-slate-600/50 text-slate-400 text-xs font-medium">
                {risk.recommendations.length}
              </span>
            </div>
            <svg
              className={`w-4 h-4 text-slate-500 transition-transform ${recommendationsOpen ? "rotate-180" : ""}`}
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M5.22 8.22a.75.75 0 011.06 0L10 11.94l3.72-3.72a.75.75 0 111.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0L5.22 9.28a.75.75 0 010-1.06z"
                clipRule="evenodd"
              />
            </svg>
          </button>

          {recommendationsOpen && (
            <div className="mt-2 space-y-2">
              {risk.recommendations.map((rec, i) => {
                const { label, classes, dot } = PRIORITY_CONFIG[rec.priority];
                return (
                  <div
                    key={i}
                    className="flex items-start gap-3 rounded-xl bg-slate-700/10 border border-[#162038] px-4 py-3"
                  >
                    <span
                      className={`mt-0.5 inline-flex items-center gap-1 flex-shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${classes}`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
                      {label}
                    </span>
                    <p className="text-sm text-slate-300 leading-relaxed">{rec.text}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
