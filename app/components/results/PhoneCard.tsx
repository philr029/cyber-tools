import type { PhoneResult, PhoneNumberType } from "@/lib/types";
import Card from "@/app/components/ui/Card";
import StatusBadge from "@/app/components/ui/StatusBadge";

const PhoneIcon = (
  <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path
      fillRule="evenodd"
      d="M2 3.5A1.5 1.5 0 013.5 2h1.148a1.5 1.5 0 011.465 1.175l.716 3.223a1.5 1.5 0 01-1.052 1.767l-.933.267c-.41.117-.643.555-.48.95a11.542 11.542 0 006.254 6.254c.395.163.833-.07.95-.48l.267-.933a1.5 1.5 0 011.767-1.052l3.223.716A1.5 1.5 0 0118 15.352V16.5a1.5 1.5 0 01-1.5 1.5H15c-1.149 0-2.263-.15-3.326-.43A13.022 13.022 0 012.43 8.326 13.019 13.019 0 012 5V3.5z"
      clipRule="evenodd"
    />
  </svg>
);

const TYPE_LABELS: Record<PhoneNumberType, { label: string; classes: string }> = {
  mobile:       { label: "Mobile",       classes: "bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20" },
  landline:     { label: "Landline",     classes: "bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/20" },
  "toll-free":  { label: "Toll-Free",    classes: "bg-sky-500/10 text-sky-400 ring-1 ring-sky-500/20" },
  "premium-rate": { label: "Premium-Rate", classes: "bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20" },
  voip:         { label: "VoIP",         classes: "bg-orange-500/10 text-orange-400 ring-1 ring-orange-500/20" },
  unknown:      { label: "Unknown",      classes: "bg-slate-700/50 text-slate-400 ring-1 ring-[#1e2d4a]" },
};

const SEVERITY_CLASSES = {
  high:    "bg-red-500/10 text-red-400 border border-red-500/20",
  warning: "bg-amber-500/10 text-amber-300 border border-amber-500/20",
  info:    "bg-blue-500/10 text-blue-400 border border-blue-500/20",
};

const SEVERITY_ICON = {
  high:    "🔴",
  warning: "⚠️",
  info:    "ℹ️",
};

interface Props {
  data: PhoneResult;
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between py-2.5 border-b border-[#162038] last:border-0 gap-4">
      <span className="text-sm text-slate-400 whitespace-nowrap">{label}</span>
      <span className="text-sm font-semibold text-slate-200 text-right break-all">{value}</span>
    </div>
  );
}

export default function PhoneCard({ data }: Props) {
  const typeStyle = TYPE_LABELS[data.numberType];

  return (
    <Card
      title="Phone Number Analysis"
      icon={PhoneIcon}
      headerRight={<StatusBadge status={data.status} />}
    >
      <div className="space-y-5">
        {/* Core details */}
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
            Number Details
          </p>
          <Row label="Input" value={data.raw} />
          {data.e164 && <Row label="E.164 Format" value={<span className="font-mono">{data.e164}</span>} />}
          {data.formatted && <Row label="Formatted" value={data.formatted} />}
          {data.dialCode && <Row label="Dial Code" value={data.dialCode} />}
          {data.country && (
            <Row
              label="Country"
              value={
                <span className="flex items-center gap-1.5 justify-end">
                  {data.countryCode && (
                    <span className="text-xs font-mono bg-slate-700/60 px-1.5 py-0.5 rounded">
                      {data.countryCode}
                    </span>
                  )}
                  {data.country}
                </span>
              }
            />
          )}
          <Row
            label="Number Type"
            value={
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${typeStyle.classes}`}>
                {typeStyle.label}
              </span>
            }
          />
          {data.carrier && <Row label="Carrier (est.)" value={data.carrier} />}
        </div>

        {/* Risk flags */}
        <div className="border-t border-[#162038] pt-4">
          {data.flags.length === 0 ? (
            <div className="flex items-center gap-2 text-sm text-emerald-400">
              <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
              </svg>
              No risk flags detected
            </div>
          ) : (
            <>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                Risk Flags
              </p>
              <ul className="space-y-1.5">
                {data.flags.map((flag) => (
                  <li
                    key={flag.code}
                    className={`flex items-start gap-2 text-xs rounded-lg px-3 py-2 ${SEVERITY_CLASSES[flag.severity]}`}
                  >
                    <span className="flex-shrink-0 mt-0.5">{SEVERITY_ICON[flag.severity]}</span>
                    <span>{flag.label}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
    </Card>
  );
}
