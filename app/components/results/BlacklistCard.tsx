import type { BlacklistResult } from "@/lib/types";
import Card from "@/app/components/ui/Card";
import StatusBadge from "@/app/components/ui/StatusBadge";

const ListIcon = (
  <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path
      fillRule="evenodd"
      d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10zm0 5.25a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75a.75.75 0 01-.75-.75z"
      clipRule="evenodd"
    />
  </svg>
);

interface Props {
  data: BlacklistResult;
}

export default function BlacklistCard({ data }: Props) {
  return (
    <Card
      title="Blacklist Status"
      icon={ListIcon}
      headerRight={<StatusBadge status={data.status} />}
    >
      <div className="space-y-3">
        {/* Summary */}
        <div className="flex items-center gap-2 p-3 rounded-xl bg-gray-50">
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-800">
              {data.listedCount} of {data.totalChecked} lists
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              {data.listedCount === 0
                ? "Target is not listed on any blacklist"
                : `Target appears on ${data.listedCount} blacklist${data.listedCount > 1 ? "s" : ""}`}
            </p>
          </div>
          <div className="text-2xl font-bold text-gray-200">
            {data.listedCount}/{data.totalChecked}
          </div>
        </div>

        {/* Individual entries */}
        <div className="divide-y divide-gray-50">
          {data.entries.map((entry) => (
            <div key={entry.source} className="flex items-center justify-between py-2.5">
              <div className="flex items-center gap-2.5">
                <span
                  className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${
                    entry.listed ? "bg-red-100" : "bg-emerald-100"
                  }`}
                >
                  {entry.listed ? (
                    <svg className="w-3 h-3 text-red-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                    </svg>
                  ) : (
                    <svg className="w-3 h-3 text-emerald-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path
                        fillRule="evenodd"
                        d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </span>
                <div>
                  <p className="text-sm font-medium text-gray-700">{entry.source}</p>
                  <p className="text-xs text-gray-400">{entry.detail}</p>
                </div>
              </div>
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  entry.listed
                    ? "bg-red-50 text-red-600"
                    : "bg-emerald-50 text-emerald-600"
                }`}
              >
                {entry.listed ? "Listed" : "Clean"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
