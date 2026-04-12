"use client";

interface NameServer {
  name: string;
}

interface ZonePlan {
  name: string;
}

export interface ZoneData {
  id: string;
  name: string;
  status: string;
  paused: boolean;
  name_servers: string[];
  original_name_servers?: string[];
  plan?: ZonePlan;
}

const STATUS_COLORS: Record<string, string> = {
  active: "text-emerald-400 bg-emerald-500/10",
  pending: "text-amber-400 bg-amber-500/10",
  initializing: "text-amber-400 bg-amber-500/10",
  moved: "text-red-400 bg-red-500/10",
  deleted: "text-red-400 bg-red-500/10",
};

export default function ZoneCard({
  data,
  loading,
  error,
}: {
  data: ZoneData | null;
  loading: boolean;
  error: string | null;
}) {
  return (
    <div className="rounded-2xl bg-[#0d1321] border border-[#1e2d4a] p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-200">Zone Overview</p>
        <svg
          className="w-4 h-4 text-slate-500"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M4.083 9h1.946c.089-1.546.383-2.97.837-4.118A6.004 6.004 0 004.083 9zM10 2a8 8 0 100 16A8 8 0 0010 2zm0 2c-.076 0-.232.032-.465.262-.238.234-.497.623-.737 1.182-.389.907-.673 2.142-.766 3.556h3.936c-.093-1.414-.377-2.649-.766-3.556-.24-.56-.5-.948-.737-1.182C10.232 4.032 10.076 4 10 4zm3.971 5c-.089-1.546-.383-2.97-.837-4.118A6.004 6.004 0 0115.917 9h-1.946zm-2.003 2H8.032c.093 1.414.377 2.649.766 3.556.24.56.5.948.737 1.182.233.23.389.262.465.262.076 0 .232-.032.465-.262.238-.234.498-.623.737-1.182.389-.907.673-2.142.766-3.556zm1.166 4.118c.454-1.147.748-2.572.837-4.118h1.946a6.004 6.004 0 01-2.783 4.118zm-6.268 0C6.412 13.97 6.118 12.546 6.03 11H4.083a6.004 6.004 0 002.783 4.118z"
            clipRule="evenodd"
          />
        </svg>
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <div className="w-4 h-4 border-2 border-slate-600/40 border-t-slate-400 rounded-full animate-spin" />
          Loading zone info…
        </div>
      )}

      {error && !loading && (
        <p className="text-sm text-amber-400 bg-amber-500/10 rounded-xl px-3 py-2">
          {error}
        </p>
      )}

      {data && !loading && (
        <div className="space-y-3">
          <div>
            <p className="text-xs text-slate-500 mb-0.5">Domain</p>
            <p className="text-sm font-mono font-medium text-slate-100">{data.name}</p>
          </div>

          <div className="flex items-center gap-3">
            <div>
              <p className="text-xs text-slate-500 mb-0.5">Status</p>
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-medium capitalize ${STATUS_COLORS[data.status] ?? "text-slate-400 bg-slate-700/40"}`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                {data.paused ? "paused" : data.status}
              </span>
            </div>

            {data.plan && (
              <div>
                <p className="text-xs text-slate-500 mb-0.5">Plan</p>
                <span className="inline-block px-2 py-0.5 rounded-lg text-xs font-medium bg-cyan-500/10 text-cyan-400">
                  {data.plan.name}
                </span>
              </div>
            )}
          </div>

          <div>
            <p className="text-xs text-slate-500 mb-1">Nameservers</p>
            <div className="space-y-1">
              {(data.name_servers as (string | NameServer)[]).map((ns, i) => (
                <p key={i} className="text-xs font-mono text-slate-400 bg-[#131929] rounded-lg px-2.5 py-1.5">
                  {typeof ns === "string" ? ns : ns.name}
                </p>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
