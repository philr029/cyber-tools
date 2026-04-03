import type { DNSResult } from "@/lib/types";
import Card from "@/app/components/ui/Card";
import StatusBadge from "@/app/components/ui/StatusBadge";

const DNSIcon = (
  <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path d="M10.75 16.82A7.462 7.462 0 0115 15.5c.71 0 1.396.098 2.046.282A.75.75 0 0018 15.06v-11a.75.75 0 00-.546-.721A9.006 9.006 0 0015 3a8.963 8.963 0 00-4.25 1.065V16.82zM9.25 4.065A8.963 8.963 0 005 3c-.85 0-1.673.118-2.454.339A.75.75 0 002 4.06v11a.75.75 0 00.954.721A7.506 7.506 0 015 15.5c1.579 0 3.042.487 4.25 1.32V4.065z" />
  </svg>
);

const TYPE_COLORS: Record<string, string> = {
  A: "bg-blue-50 text-blue-700",
  AAAA: "bg-indigo-50 text-indigo-700",
  MX: "bg-purple-50 text-purple-700",
  TXT: "bg-orange-50 text-orange-700",
  NS: "bg-teal-50 text-teal-700",
  CNAME: "bg-pink-50 text-pink-700",
  SOA: "bg-gray-100 text-gray-600",
};

interface Props {
  data: DNSResult;
}

export default function DNSCard({ data }: Props) {
  return (
    <Card
      title="DNS Information"
      icon={DNSIcon}
      headerRight={<StatusBadge status={data.status} />}
    >
      <div className="space-y-4">
        {/* Nameservers */}
        {data.nameservers.length > 0 && (
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1.5">
              Nameservers
            </p>
            <div className="flex flex-wrap gap-1.5">
              {data.nameservers.map((ns) => (
                <span
                  key={ns}
                  className="inline-block px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-md font-mono"
                >
                  {ns}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Reverse DNS */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
          <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">
            Reverse DNS
          </span>
          <span className="text-sm font-semibold text-gray-800 font-mono">
            {data.reverseDNS ?? "None"}
          </span>
        </div>

        {/* DNS records */}
        {data.records.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">No DNS records found</p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-gray-100">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-xs text-gray-400 font-medium uppercase tracking-wide">
                  <th className="px-3 py-2 text-left">Type</th>
                  <th className="px-3 py-2 text-left">Value</th>
                  <th className="px-3 py-2 text-left">TTL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.records.map((record, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition-colors">
                    <td className="px-3 py-2.5">
                      <span
                        className={`inline-block px-2 py-0.5 text-xs font-semibold rounded-md ${
                          TYPE_COLORS[record.type] ?? "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {record.type}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 font-mono text-xs text-gray-700 max-w-[180px] truncate">
                      {record.value}
                    </td>
                    <td className="px-3 py-2.5 text-xs text-gray-400">{record.ttl}s</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Card>
  );
}
