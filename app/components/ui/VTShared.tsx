/**
 * Shared sub-components used by the VirusTotal check components.
 * Extracted to avoid duplication across VirusTotalIPCheck, VirusTotalDomainCheck,
 * and VirusTotalURLCheck.
 */

export function maliciousColor(count: number): string {
  if (count === 0) return "text-emerald-600";
  if (count <= 3) return "text-orange-500";
  return "text-red-600";
}

export function AnalysisBar({
  malicious,
  suspicious,
  harmless,
  undetected,
  label = "Vendor Analysis",
}: {
  malicious: number;
  suspicious: number;
  harmless: number;
  undetected: number;
  label?: string;
}) {
  const total = malicious + suspicious + harmless + undetected || 1;
  const segments = [
    { label: "Malicious", count: malicious, color: "bg-red-500", text: "text-red-600" },
    { label: "Suspicious", count: suspicious, color: "bg-amber-400", text: "text-amber-600" },
    { label: "Harmless", count: harmless, color: "bg-emerald-500", text: "text-emerald-600" },
    { label: "Undetected", count: undetected, color: "bg-gray-200", text: "text-gray-500" },
  ];

  return (
    <div>
      <p className="text-xs text-gray-500 mb-2">
        {label} ({total} engines)
      </p>
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
  );
}

export function StatItem({
  label,
  value,
  valueClass,
}: {
  label: string;
  value: string | number;
  valueClass?: string;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">{label}</span>
      <span className={`text-sm font-semibold ${valueClass ?? "text-gray-800"}`}>{value}</span>
    </div>
  );
}

export function VTErrorMessage({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-red-50 border border-red-100">
      <svg
        className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z"
          clipRule="evenodd"
        />
      </svg>
      <p className="text-sm text-red-700">{message}</p>
    </div>
  );
}
