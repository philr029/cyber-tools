import type { DomainThreatScoreResult, ThreatScoreFactor, StatusLevel } from "@/lib/types";
import Card from "@/app/components/ui/Card";
import StatusBadge from "@/app/components/ui/StatusBadge";

const ShieldIcon = (
  <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path fillRule="evenodd" d="M9.661 2.237a.531.531 0 01.678 0 11.947 11.947 0 007.078 2.749.5.5 0 01.479.425c.069.52.104 1.05.104 1.589 0 5.162-3.26 9.563-7.834 11.256a.48.48 0 01-.332 0C5.26 16.563 2 12.162 2 7a10.66 10.66 0 01.104-1.589.5.5 0 01.48-.425 11.947 11.947 0 007.077-2.749z" clipRule="evenodd" />
  </svg>
);

interface Props {
  data: DomainThreatScoreResult;
}

function labelColors(label: DomainThreatScoreResult["label"]) {
  switch (label) {
    case "Safe":
      return {
        text: "text-emerald-400",
        ring: "border-emerald-500/50",
        bar: "bg-emerald-500",
        badge: "bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/30",
      };
    case "Suspicious":
      return {
        text: "text-amber-400",
        ring: "border-amber-500/50",
        bar: "bg-amber-400",
        badge: "bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/30",
      };
    case "High Risk":
      return {
        text: "text-red-400",
        ring: "border-red-500/50",
        bar: "bg-red-500",
        badge: "bg-red-500/10 text-red-400 ring-1 ring-red-500/30",
      };
  }
}

function statusColors(status: StatusLevel): string {
  switch (status) {
    case "safe": return "bg-emerald-500";
    case "warning": return "bg-amber-400";
    case "risk": return "bg-red-500";
    default: return "bg-slate-500";
  }
}

function FactorRow({ factor }: { factor: ThreatScoreFactor }) {
  const pct = (factor.score / factor.maxScore) * 100;
  const barColor = statusColors(factor.status);

  return (
    <div className="py-3 border-b border-[#162038] last:border-0">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm font-medium text-slate-300">{factor.name}</span>
        <span className="text-xs font-mono text-slate-400">{factor.score}/{factor.maxScore}</span>
      </div>
      <div className="w-full h-1.5 rounded-full bg-slate-700/40 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-xs text-slate-500 mt-1">{factor.detail}</p>
    </div>
  );
}

export default function ThreatScoreCard({ data }: Props) {
  const colors = labelColors(data.label);
  const maxPossible = data.factors.reduce((s, f) => s + f.maxScore, 0) || 100;
  const pct = (data.totalScore / maxPossible) * 100;

  return (
    <Card
      title="Threat Score"
      icon={ShieldIcon}
      headerRight={<StatusBadge status={data.status} />}
    >
      <div className="space-y-4">
        {/* Score hero */}
        <div className="flex items-center gap-5 p-4 rounded-xl bg-slate-700/20 border border-[#162038]">
          {/* Circular score */}
          <div className="relative w-20 h-20 flex-shrink-0">
            <svg className="w-20 h-20 -rotate-90" viewBox="0 0 72 72" aria-hidden="true">
              <circle cx="36" cy="36" r="28" fill="none" stroke="#1e2d4a" strokeWidth="7" />
              <circle
                cx="36"
                cy="36"
                r="28"
                fill="none"
                stroke="currentColor"
                strokeWidth="7"
                strokeDasharray={2 * Math.PI * 28}
                strokeDashoffset={2 * Math.PI * 28 * (1 - pct / 100)}
                strokeLinecap="round"
                className={`${colors.text} transition-all duration-700`}
              />
            </svg>
            <span className={`absolute inset-0 flex items-center justify-center text-xl font-bold ${colors.text}`}>
              {data.totalScore}
            </span>
          </div>
          <div>
            <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${colors.badge}`}>
              {data.label}
            </span>
            <p className="text-xs text-slate-500 mt-2">
              Score: {data.totalScore} / {maxPossible} risk points
            </p>
            <p className="text-xs text-slate-600 mt-0.5">{data.target}</p>
          </div>
        </div>

        {/* Factor breakdown */}
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
            Score Breakdown
          </p>
          <div>
            {data.factors.map((f) => (
              <FactorRow key={f.name} factor={f} />
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
