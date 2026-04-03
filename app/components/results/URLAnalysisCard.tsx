import type { URLAnalysisResult } from "@/lib/types";
import Card from "@/app/components/ui/Card";
import StatusBadge from "@/app/components/ui/StatusBadge";

const URLIcon = (
  <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path d="M12.232 4.232a2.5 2.5 0 013.536 3.536l-1.225 1.224a.75.75 0 001.061 1.06l1.224-1.224a4 4 0 00-5.656-5.656l-3 3a4 4 0 00.225 5.865.75.75 0 00.977-1.138 2.5 2.5 0 01-.142-3.667l3-3z" />
    <path d="M11.603 7.963a.75.75 0 00-.977 1.138 2.5 2.5 0 01.142 3.667l-3 3a2.5 2.5 0 01-3.536-3.536l1.225-1.224a.75.75 0 00-1.061-1.06l-1.224 1.224a4 4 0 105.656 5.656l3-3a4 4 0 00-.225-5.865z" />
  </svg>
);

interface Props {
  data: URLAnalysisResult;
}

export default function URLAnalysisCard({ data }: Props) {
  const total = data.malicious + data.suspicious + data.undetected + data.harmless || 1;

  const segments = [
    { label: "Malicious", count: data.malicious, color: "bg-red-500", text: "text-red-600" },
    { label: "Suspicious", count: data.suspicious, color: "bg-amber-400", text: "text-amber-600" },
    { label: "Harmless", count: data.harmless, color: "bg-emerald-500", text: "text-emerald-600" },
    { label: "Undetected", count: data.undetected, color: "bg-gray-200", text: "text-gray-500" },
  ];

  return (
    <Card
      title="URL Analysis"
      icon={URLIcon}
      headerRight={<StatusBadge status={data.status} />}
    >
      <div className="space-y-4">
        {/* Vendor bar */}
        <div>
          <p className="text-xs text-gray-500 mb-2">Vendor Analysis ({total} engines)</p>
          <div className="flex w-full h-2.5 rounded-full overflow-hidden bg-gray-100">
            {segments.map((s) =>
              s.count > 0 ? (
                <div
                  key={s.label}
                  className={s.color}
                  style={{ width: `${(s.count / total) * 100}%` }}
                  title={`${s.label}: ${s.count}`}
                />
              ) : null,
            )}
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
            {segments.map((s) => (
              <span key={s.label} className={`text-xs font-medium ${s.text}`}>
                {s.count} {s.label}
              </span>
            ))}
          </div>
        </div>

        {/* URL details */}
        <div className="grid grid-cols-1 gap-3">
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">Submitted URL</span>
            <span className="text-sm font-mono text-gray-800 break-all">{data.url}</span>
          </div>
          {data.finalUrl !== data.url && (
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">Final URL</span>
              <span className="text-sm font-mono text-gray-800 break-all">{data.finalUrl}</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-x-6 gap-y-3">
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">Domain</span>
            <span className="text-sm font-semibold text-gray-800">{data.domain || "—"}</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">Status Code</span>
            <span className="text-sm font-semibold text-gray-800">{data.statusCode ?? "—"}</span>
          </div>
          {data.ipAddress && (
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">IP Address</span>
              <span className="text-sm font-mono text-gray-800">{data.ipAddress}</span>
            </div>
          )}
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">Content Type</span>
            <span className="text-sm text-gray-800 truncate">{data.contentType ?? "—"}</span>
          </div>
        </div>

        {/* Threat names */}
        {data.threatNames.length > 0 && (
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1.5">Threats Detected</p>
            <div className="flex flex-wrap gap-1.5">
              {data.threatNames.map((t) => (
                <span key={t} className="px-2 py-0.5 text-xs bg-red-50 text-red-700 rounded-md font-mono">
                  {t}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Redirect chain */}
        {data.redirectChain.length > 0 && (
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1.5">
              Redirect Chain ({data.redirectChain.length})
            </p>
            <div className="space-y-1">
              {data.redirectChain.map((url, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="flex-shrink-0 mt-0.5 text-xs text-gray-400">{i + 1}.</span>
                  <span className="text-xs font-mono text-gray-600 break-all">{url}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Categories */}
        {data.categories.length > 0 && (
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1.5">Categories</p>
            <div className="flex flex-wrap gap-1.5">
              {data.categories.map((cat) => (
                <span key={cat} className="px-2 py-0.5 text-xs bg-blue-50 text-blue-700 rounded-md">
                  {cat}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
