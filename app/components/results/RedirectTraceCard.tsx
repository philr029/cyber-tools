import type { RedirectTraceResult, RedirectHop } from "@/lib/types";
import Card from "@/app/components/ui/Card";
import StatusBadge from "@/app/components/ui/StatusBadge";

const ChainIcon = (
  <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path fillRule="evenodd" d="M12.232 4.232a2.5 2.5 0 013.536 3.536l-1.225 1.224a.75.75 0 001.061 1.06l1.224-1.224a4 4 0 00-5.656-5.656l-3 3a4 4 0 00.225 5.865.75.75 0 00.977-1.138 2.5 2.5 0 01-.142-3.667l3-3z" clipRule="evenodd" />
    <path d="M11.603 7.963a.75.75 0 00-.977 1.138 2.5 2.5 0 01.142 3.667l-3 3a2.5 2.5 0 01-3.536-3.536l1.225-1.224a.75.75 0 00-1.061-1.06l-1.224 1.224a4 4 0 105.656 5.656l3-3a4 4 0 00-.225-5.865z" />
  </svg>
);

interface Props {
  data: RedirectTraceResult;
}

function statusCodeColor(code: number): string {
  if (code === 0) return "bg-slate-700/50 text-slate-400";
  if (code >= 200 && code < 300) return "bg-emerald-500/10 text-emerald-400";
  if (code >= 300 && code < 400) return "bg-cyan-500/10 text-cyan-400";
  if (code >= 400 && code < 500) return "bg-amber-500/10 text-amber-400";
  return "bg-red-500/10 text-red-400";
}

function HopRow({ hop, index, total }: { hop: RedirectHop; index: number; total: number }) {
  const isLast = index === total - 1;
  return (
    <div className="flex gap-3">
      {/* Timeline */}
      <div className="flex flex-col items-center flex-shrink-0">
        <div
          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
            hop.isSuspicious
              ? "bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/30"
              : isLast
              ? "bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/30"
              : "bg-slate-700/50 text-slate-400 ring-1 ring-[#1e2d4a]"
          }`}
        >
          {index + 1}
        </div>
        {!isLast && <div className="w-px flex-1 bg-[#1e2d4a] mt-1" />}
      </div>

      {/* Content */}
      <div className={`pb-4 min-w-0 flex-1 ${isLast ? "pb-0" : ""}`}>
        <div className="flex items-center gap-2 flex-wrap">
          {hop.statusCode > 0 && (
            <span className={`text-xs font-mono font-semibold px-2 py-0.5 rounded-full ${statusCodeColor(hop.statusCode)}`}>
              {hop.statusCode}
            </span>
          )}
          {hop.isSuspicious && hop.reason && (
            <span className="text-xs text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">
              ⚠ {hop.reason}
            </span>
          )}
        </div>
        <p className="text-xs font-mono text-slate-400 mt-1 break-all">{hop.url}</p>
      </div>
    </div>
  );
}

export default function RedirectTraceCard({ data }: Props) {
  return (
    <Card
      title="Redirect Trace"
      icon={ChainIcon}
      headerRight={<StatusBadge status={data.status} />}
    >
      <div className="space-y-4">
        {/* Summary */}
        <div className="flex items-center gap-4 p-3 rounded-xl bg-slate-700/20 border border-[#162038]">
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-200">{data.hopCount}</p>
            <p className="text-xs text-slate-500">hop{data.hopCount !== 1 ? "s" : ""}</p>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-slate-500 font-medium">Original URL</p>
            <p className="text-xs font-mono text-slate-400 truncate">{data.originalUrl}</p>
            {data.finalUrl !== data.originalUrl && (
              <>
                <p className="text-xs text-slate-500 font-medium mt-1.5">Final URL</p>
                <p className="text-xs font-mono text-slate-400 truncate">{data.finalUrl}</p>
              </>
            )}
          </div>
        </div>

        {/* Suspicious reasons */}
        {data.suspiciousReasons.length > 0 && (
          <div className="space-y-1.5">
            {data.suspiciousReasons.map((r, i) => (
              <div
                key={i}
                className="flex items-start gap-2 text-xs text-amber-300 bg-amber-500/5 border border-amber-500/10 rounded-lg px-3 py-2"
              >
                <span className="flex-shrink-0 mt-0.5">⚠</span>
                {r}
              </div>
            ))}
          </div>
        )}

        {/* Hop chain */}
        {data.hops.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
              Redirect Chain
            </p>
            <div>
              {data.hops.map((hop, i) => (
                <HopRow key={i} hop={hop} index={i} total={data.hops.length} />
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
