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
    open: "bg-red-50 text-red-600",
    closed: "bg-gray-100 text-gray-500",
    filtered: "bg-amber-50 text-amber-600",
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
        <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
          <div>
            <p className="text-sm font-semibold text-gray-800">
              {data.openCount} open port{data.openCount !== 1 ? "s" : ""} detected
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              Scan completed in {(data.scanDuration / 1000).toFixed(1)}s · {data.target}
            </p>
          </div>
        </div>

        {data.ports.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">No ports scanned</p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-gray-100">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-xs text-gray-400 font-medium uppercase tracking-wide">
                  <th className="px-3 py-2 text-left">Port</th>
                  <th className="px-3 py-2 text-left">Protocol</th>
                  <th className="px-3 py-2 text-left">Service</th>
                  <th className="px-3 py-2 text-left">State</th>
                  <th className="px-3 py-2 text-left hidden sm:table-cell">Version</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.ports.map((port) => (
                  <tr key={`${port.port}-${port.protocol}`} className="hover:bg-gray-50 transition-colors">
                    <td className="px-3 py-2.5 font-mono font-semibold text-gray-800">
                      {port.port}
                    </td>
                    <td className="px-3 py-2.5 text-gray-600">{port.protocol}</td>
                    <td className="px-3 py-2.5 text-gray-700 font-medium">{port.service}</td>
                    <td className="px-3 py-2.5">
                      <StateChip state={port.state} />
                    </td>
                    <td className="px-3 py-2.5 text-gray-400 text-xs hidden sm:table-cell font-mono">
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
