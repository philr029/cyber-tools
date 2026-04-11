import type { DNSResult } from "@/lib/types";
import Card from "@/app/components/ui/Card";
import StatusBadge from "@/app/components/ui/StatusBadge";

const DNSIcon = (
  <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path d="M10.75 16.82A7.462 7.462 0 0115 15.5c.71 0 1.396.098 2.046.282A.75.75 0 0018 15.06v-11a.75.75 0 00-.546-.721A9.006 9.006 0 0015 3a8.963 8.963 0 00-4.25 1.065V16.82zM9.25 4.065A8.963 8.963 0 005 3c-.85 0-1.673.118-2.454.339A.75.75 0 002 4.06v11a.75.75 0 00.954.721A7.506 7.506 0 015 15.5c1.579 0 3.042.487 4.25 1.32V4.065z" />
  </svg>
);

const TYPE_COLORS: Record<string, string> = {
  A: "bg-blue-500/10 text-blue-400",
  AAAA: "bg-indigo-500/10 text-indigo-400",
  MX: "bg-purple-500/10 text-purple-400",
  TXT: "bg-orange-500/10 text-orange-400",
  NS: "bg-teal-500/10 text-teal-400",
  CNAME: "bg-pink-500/10 text-pink-400",
  SOA: "bg-slate-500/10 text-slate-400",
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
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wide mb-1.5">
              Nameservers
            </p>
            <div className="flex flex-wrap gap-1.5">
              {data.nameservers.map((ns) => (
                <span
                  key={ns}
                  className="inline-block px-2 py-0.5 text-xs bg-slate-700/50 text-slate-300 rounded-md font-mono ring-1 ring-[#1e2d4a]"
                >
                  {ns}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Reverse DNS */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-700/20 border border-[#162038]">
          <span className="text-xs text-slate-500 font-medium uppercase tracking-wide">
            Reverse DNS
          </span>
          <span className="text-sm font-semibold text-slate-200 font-mono">
            {data.reverseDNS ?? "None"}
          </span>
        </div>

        {/* DNS records */}
        {data.records.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-4">No DNS records found</p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-[#1e2d4a]">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-700/20 text-xs text-slate-500 font-medium uppercase tracking-wide">
                  <th className="px-3 py-2 text-left">Type</th>
                  <th className="px-3 py-2 text-left">Value</th>
                  <th className="px-3 py-2 text-left">TTL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#162038]">
                {data.records.map((record, i) => (
                  <tr key={i} className="hover:bg-white/5 transition-colors">
                    <td className="px-3 py-2.5">
                      <span
                        className={`inline-block px-2 py-0.5 text-xs font-semibold rounded-md ${
                          TYPE_COLORS[record.type] ?? "bg-slate-500/10 text-slate-400"
                        }`}
                      >
                        {record.type}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 font-mono text-xs text-slate-300 max-w-[180px] truncate">
                      {record.value}
                    </td>
                    <td className="px-3 py-2.5 text-xs text-slate-500">{record.ttl}s</td>
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
