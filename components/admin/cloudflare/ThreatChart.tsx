"use client";

export interface AnalyticsTotals {
  requests: {
    all: number;
    cached: number;
    uncached: number;
  };
  bandwidth: {
    all: number;
    cached: number;
  };
  threats: {
    all: number;
  };
  pageviews: {
    all: number;
  };
  uniques?: {
    all: number;
  };
}

export interface AnalyticsTimeseries {
  since: string;
  until: string;
  requests: { all: number; cached: number };
  threats: { all: number };
  bandwidth: { all: number };
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

function Sparkline({ series, color }: { series: number[]; color: string }) {
  if (series.length < 2) return null;
  const max = Math.max(...series, 1);
  const w = 120;
  const h = 32;
  const step = w / (series.length - 1);
  const points = series
    .map((v, i) => `${i * step},${h - (v / max) * h}`)
    .join(" ");

  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      aria-hidden="true"
      className="overflow-visible"
    >
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function ThreatChart({
  totals,
  timeseries,
  loading,
  error,
}: {
  totals: AnalyticsTotals | null;
  timeseries: AnalyticsTimeseries[];
  loading: boolean;
  error: string | null;
}) {
  const cacheRatio =
    totals && totals.requests.all > 0
      ? Math.round((totals.requests.cached / totals.requests.all) * 100)
      : 0;

  const reqSeries = timeseries.map((t) => t.requests.all);
  const threatSeries = timeseries.map((t) => t.threats.all);

  return (
    <div className="rounded-2xl bg-[#0d1321] border border-[#1e2d4a] p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-200">Traffic (last 24h)</p>
        <svg
          className="w-4 h-4 text-slate-500"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
        </svg>
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <div className="w-4 h-4 border-2 border-slate-600/40 border-t-slate-400 rounded-full animate-spin" />
          Loading analytics…
        </div>
      )}

      {error && !loading && (
        <p className="text-sm text-amber-400 bg-amber-500/10 rounded-xl px-3 py-2">
          {error}
        </p>
      )}

      {totals && !loading && (
        <>
          <div className="grid grid-cols-2 gap-3">
            {/* Requests */}
            <div className="bg-[#131929] rounded-xl p-3">
              <p className="text-xs text-slate-500 mb-0.5">Total Requests</p>
              <p className="text-lg font-bold text-slate-100">
                {formatNumber(totals.requests.all)}
              </p>
              {reqSeries.length > 1 && (
                <div className="mt-1 opacity-70">
                  <Sparkline series={reqSeries} color="#22d3ee" />
                </div>
              )}
            </div>

            {/* Threats */}
            <div className="bg-[#131929] rounded-xl p-3">
              <p className="text-xs text-slate-500 mb-0.5">Threats Blocked</p>
              <p className={`text-lg font-bold ${totals.threats.all > 0 ? "text-red-400" : "text-emerald-400"}`}>
                {formatNumber(totals.threats.all)}
              </p>
              {threatSeries.length > 1 && (
                <div className="mt-1 opacity-70">
                  <Sparkline
                    series={threatSeries}
                    color={totals.threats.all > 0 ? "#f87171" : "#34d399"}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Cache + Bandwidth */}
          <div className="space-y-2">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">Cache hit rate</span>
                <span className="text-cyan-400 font-medium">{cacheRatio}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-[#1e2d4a]">
                <div
                  className="h-1.5 rounded-full bg-cyan-500 transition-all"
                  style={{ width: `${cacheRatio}%` }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Bandwidth served</span>
              <span className="text-slate-300 font-mono">
                {formatBytes(totals.bandwidth.all)}
              </span>
            </div>

            {totals.pageviews && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Page views</span>
                <span className="text-slate-300 font-mono">
                  {formatNumber(totals.pageviews.all)}
                </span>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
