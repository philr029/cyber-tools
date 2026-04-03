import type { IPReputationResult } from "@/lib/types";
import Card from "@/app/components/ui/Card";
import StatusBadge from "@/app/components/ui/StatusBadge";

const ShieldIcon = (
  <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path
      fillRule="evenodd"
      d="M9.661 2.237a.531.531 0 01.678 0 11.947 11.947 0 007.078 2.749.5.5 0 01.479.425c.069.52.104 1.05.104 1.589 0 5.162-3.26 9.563-7.834 11.256a.48.48 0 01-.332 0C5.26 16.563 2 12.162 2 7a10.66 10.66 0 01.104-1.589.5.5 0 01.48-.425 11.947 11.947 0 007.077-2.749z"
      clipRule="evenodd"
    />
  </svg>
);

interface Props {
  data: IPReputationResult;
}

function StatItem({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">{label}</span>
      <span className="text-sm font-semibold text-gray-800">{value}</span>
    </div>
  );
}

export default function IPReputationCard({ data }: Props) {
  const riskColor =
    data.abuseConfidenceScore >= 50
      ? "text-red-600"
      : data.abuseConfidenceScore >= 20
      ? "text-amber-600"
      : "text-emerald-600";

  return (
    <Card
      title="IP Reputation"
      icon={ShieldIcon}
      headerRight={<StatusBadge status={data.status} />}
    >
      <div className="space-y-4">
        {/* Score bar */}
        <div>
          <div className="flex items-end justify-between mb-1.5">
            <span className="text-xs text-gray-500">Abuse Confidence Score</span>
            <span className={`text-sm font-bold ${riskColor}`}>
              {data.abuseConfidenceScore}%
            </span>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                data.abuseConfidenceScore >= 50
                  ? "bg-red-500"
                  : data.abuseConfidenceScore >= 20
                  ? "bg-amber-400"
                  : "bg-emerald-500"
              }`}
              style={{ width: `${Math.max(data.abuseConfidenceScore, 2)}%` }}
            />
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-3">
          <StatItem label="IP Address" value={data.ipAddress} />
          <StatItem label="Country" value={`${data.country} (${data.countryCode})`} />
          <StatItem label="ISP" value={data.isp} />
          <StatItem label="Usage Type" value={data.usageType} />
          <StatItem label="Total Reports" value={data.totalReports} />
          <StatItem
            label="Last Reported"
            value={data.lastReportedAt ? new Date(data.lastReportedAt).toLocaleDateString() : "Never"}
          />
        </div>
      </div>
    </Card>
  );
}
