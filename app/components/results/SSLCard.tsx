import type { SSLCertificateResult } from "@/lib/types";
import Card from "@/app/components/ui/Card";
import StatusBadge from "@/app/components/ui/StatusBadge";

const LockIcon = (
  <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path
      fillRule="evenodd"
      d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z"
      clipRule="evenodd"
    />
  </svg>
);

interface Props {
  data: SSLCertificateResult;
}

function formatDate(iso: string): string {
  if (iso === "Unknown") return iso;
  try {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function DaysRemainingBadge({ days }: { days: number }) {
  let color = "bg-emerald-50 text-emerald-700";
  let label = `${days} days remaining`;
  if (days <= 0) {
    color = "bg-red-50 text-red-700";
    label = "Expired";
  } else if (days <= 30) {
    color = "bg-red-50 text-red-700";
    label = `${days} days remaining`;
  } else if (days <= 90) {
    color = "bg-amber-50 text-amber-700";
    label = `${days} days remaining`;
  }
  return (
    <span className={`inline-block px-2.5 py-1 text-xs font-medium rounded-full ${color}`}>
      {label}
    </span>
  );
}

export default function SSLCard({ data }: Props) {
  return (
    <Card
      title="SSL Certificate"
      icon={LockIcon}
      headerRight={<StatusBadge status={data.status} />}
    >
      <div className="space-y-4">
        {/* Expiry highlight */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
          <div>
            <p className="text-xs text-gray-400 mb-1">Certificate Expiry</p>
            <p className="text-sm font-semibold text-gray-800">{formatDate(data.validTo)}</p>
          </div>
          <DaysRemainingBadge days={data.daysRemaining} />
        </div>

        {/* Details grid */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-3">
          {[
            { label: "Domain", value: data.domain },
            { label: "Issuer", value: data.issuer },
            { label: "Valid From", value: formatDate(data.validFrom) },
            { label: "Protocol", value: data.protocol },
            { label: "Key Size", value: data.keySize > 0 ? `${data.keySize}-bit` : "Unknown" },
            { label: "Algorithm", value: data.signatureAlgorithm },
          ].map(({ label, value }) => (
            <div key={label} className="flex flex-col gap-0.5">
              <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">
                {label}
              </span>
              <span className="text-sm font-semibold text-gray-800 truncate">{value}</span>
            </div>
          ))}
        </div>

        {/* SANs */}
        {data.subjectAltNames.length > 0 && (
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1.5">
              Subject Alt Names
            </p>
            <div className="flex flex-wrap gap-1.5">
              {data.subjectAltNames.map((san) => (
                <span
                  key={san}
                  className="inline-block px-2 py-0.5 text-xs bg-blue-50 text-blue-700 rounded-md font-mono"
                >
                  {san}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
