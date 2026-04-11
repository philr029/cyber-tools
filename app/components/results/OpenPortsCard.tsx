import type { OpenPortsResult, PortEntry } from "@/lib/types";
import Card from "@/app/components/ui/Card";
import StatusBadge from "@/app/components/ui/StatusBadge";

const PortIcon = (
  <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path
      fillRule="evenodd"
      d="M2 5a3 3 0 013-3h10a3 3 0 013 3v10a3 3 0 01-3 3H5a3 3 0 01-3-3V5zm6 0a1 1 0 012 0v2h2V5a1 1 0 112 0v2a2 2 0 01-2 2H9a2 2 0 01-2-2V5zm-1 7a1 1 0 100 2h6a1 1 0 100-2H7z"
      clipRule="evenodd"
    />
  </svg>
);

interface Props {
  data: OpenPortsResult;
}

function StateChip({ state }: { state: PortEntry["state"] }) {
  const colors: Record<PortEntry["state"], string> = {
    open: "bg-red-500/10 text-red-400 ring-1 ring-red-500/20",
    closed: "bg-slate-700/40 text-slate-500 ring-1 ring-[#1e2d4a]",
    filtered: "bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20",
  };
  return (
    <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full capitalize ${colors[state]}`}>
      {state}
    </span>
  );
}

export default function OpenPortsCard({ data }: Props) {
  return (
    <Card
      title="Open Ports"
      icon={PortIcon}
      headerRight={<StatusBadge status={data.status} />}
    >
      <div className="space-y-3">
        {/* Summary */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-700/20 border border-[#162038]">
          <div>
            <p className="text-sm font-semibold text-slate-200">
              {data.openCount} open port{data.openCount !== 1 ? "s" : ""} detected
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              Scan completed in {(data.scanDuration / 1000).toFixed(1)}s · {data.target}
            </p>
          </div>
        </div>

        {data.ports.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-4">No ports scanned</p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-[#1e2d4a]">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-700/20 text-xs text-slate-500 font-medium uppercase tracking-wide">
                  <th className="px-3 py-2 text-left">Port</th>
                  <th className="px-3 py-2 text-left">Protocol</th>
                  <th className="px-3 py-2 text-left">Service</th>
                  <th className="px-3 py-2 text-left">State</th>
                  <th className="px-3 py-2 text-left hidden sm:table-cell">Version</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#162038]">
                {data.ports.map((port) => (
                  <tr key={`${port.port}-${port.protocol}`} className="hover:bg-white/5 transition-colors">
                    <td className="px-3 py-2.5 font-mono font-semibold text-slate-200">
                      {port.port}
                    </td>
                    <td className="px-3 py-2.5 text-slate-400">{port.protocol}</td>
                    <td className="px-3 py-2.5 text-slate-300 font-medium">{port.service}</td>
                    <td className="px-3 py-2.5">
                      <StateChip state={port.state} />
                    </td>
                    <td className="px-3 py-2.5 text-slate-500 text-xs hidden sm:table-cell font-mono">
                      {port.version || "—"}
                    </td>
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
