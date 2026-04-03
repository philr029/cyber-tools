import type { DomainReputationResult } from "@/lib/types";
import Card from "@/app/components/ui/Card";
import StatusBadge from "@/app/components/ui/StatusBadge";

const GlobeIcon = (
  <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path
      fillRule="evenodd"
      d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z"
      clipRule="evenodd"
    />
  </svg>
);

interface Props {
  data: DomainReputationResult;
}

export default function DomainReputationCard({ data }: Props) {
  const total = data.malicious + data.suspicious + data.undetected + data.harmless || 1;

  const segments = [
    { label: "Malicious", count: data.malicious, color: "bg-red-500", text: "text-red-600" },
    { label: "Suspicious", count: data.suspicious, color: "bg-amber-400", text: "text-amber-600" },
    { label: "Harmless", count: data.harmless, color: "bg-emerald-500", text: "text-emerald-600" },
    { label: "Undetected", count: data.undetected, color: "bg-gray-200", text: "text-gray-500" },
  ];

  return (
    <Card
      title="Domain Reputation"
      icon={GlobeIcon}
      headerRight={<StatusBadge status={data.status} />}
    >
      <div className="space-y-4">
        {/* Stacked bar */}
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

        {/* Domain details */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-3">
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">Domain</span>
            <span className="text-sm font-semibold text-gray-800 truncate">{data.domain}</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">Registrar</span>
            <span className="text-sm font-semibold text-gray-800 truncate">{data.registrar}</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">Created</span>
            <span className="text-sm font-semibold text-gray-800">{data.createdDate}</span>
          </div>
          <div className="flex flex-col gap-0.5 col-span-1">
            <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">Categories</span>
            <div className="flex flex-wrap gap-1 mt-0.5">
              {data.categories.length > 0 ? (
                data.categories.map((cat) => (
                  <span
                    key={cat}
                    className="inline-block px-2 py-0.5 text-xs bg-blue-50 text-blue-700 rounded-md"
                  >
                    {cat}
                  </span>
                ))
              ) : (
                <span className="text-sm font-semibold text-gray-800">—</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
