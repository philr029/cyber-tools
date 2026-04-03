import type { WHOISResult } from "@/lib/types";
import Card from "@/app/components/ui/Card";
import StatusBadge from "@/app/components/ui/StatusBadge";

const WHOISIcon = (
  <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path
      fillRule="evenodd"
      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z"
      clipRule="evenodd"
    />
  </svg>
);

interface Props {
  data: WHOISResult;
}

function Row({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">{label}</span>
      <span className="text-sm font-semibold text-gray-800 break-all">{value ?? "—"}</span>
    </div>
  );
}

export default function WHOISCard({ data }: Props) {
  return (
    <Card
      title="WHOIS / Registrar Info"
      icon={WHOISIcon}
      headerRight={<StatusBadge status={data.lookupStatus} />}
    >
      <div className="space-y-4">
        {/* Key dates */}
        <div className="grid grid-cols-3 gap-3 p-3 rounded-xl bg-gray-50">
          {[
            { label: "Registered", value: data.createdDate },
            { label: "Updated", value: data.updatedDate },
            { label: "Expires", value: data.expiryDate },
          ].map(({ label, value }) => (
            <div key={label} className="flex flex-col items-center text-center">
              <span className="text-xs text-gray-400 mb-0.5">{label}</span>
              <span className="text-sm font-semibold text-gray-800">{value}</span>
            </div>
          ))}
        </div>

        {/* Registrar details */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-3">
          <Row label="Domain" value={data.domain} />
          <Row label="Registrar" value={data.registrar} />
          <Row label="Organisation" value={data.registrantOrg} />
          <Row label="Country" value={data.registrantCountry} />
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">DNSSEC</span>
            <span className={`text-sm font-semibold ${data.dnssec ? "text-emerald-600" : "text-gray-500"}`}>
              {data.dnssec ? "Enabled" : "Disabled"}
            </span>
          </div>
          {data.registrarUrl && (
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">Registrar URL</span>
              <a
                href={data.registrarUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-blue-600 hover:underline truncate"
              >
                {data.registrarUrl}
              </a>
            </div>
          )}
        </div>

        {/* Nameservers */}
        {data.nameservers.length > 0 && (
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1.5">Nameservers</p>
            <div className="flex flex-wrap gap-1.5">
              {data.nameservers.map((ns) => (
                <span key={ns} className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-md font-mono">
                  {ns}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Domain status */}
        {data.status.length > 0 && (
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1.5">Domain Status</p>
            <div className="flex flex-wrap gap-1.5">
              {data.status.map((s) => (
                <span key={s} className="px-2 py-0.5 text-xs bg-blue-50 text-blue-700 rounded-md font-mono">
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
