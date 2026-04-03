import type { SecurityHeadersResult } from "@/lib/types";
import Card from "@/app/components/ui/Card";
import StatusBadge from "@/app/components/ui/StatusBadge";

const HeaderIcon = (
  <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path d="M3 3.5A1.5 1.5 0 014.5 2h11A1.5 1.5 0 0117 3.5v1A1.5 1.5 0 0115.5 6h-11A1.5 1.5 0 013 4.5v-1zM3 9.5A1.5 1.5 0 014.5 8h11A1.5 1.5 0 0117 9.5v1a1.5 1.5 0 01-1.5 1.5h-11A1.5 1.5 0 013 10.5v-1zM4.5 14a1.5 1.5 0 00-1.5 1.5v1A1.5 1.5 0 004.5 18h11a1.5 1.5 0 001.5-1.5v-1a1.5 1.5 0 00-1.5-1.5h-11z" />
  </svg>
);

interface Props {
  data: SecurityHeadersResult;
}

function GradeCircle({ grade, score }: { grade: string; score: number }) {
  const colorClass =
    grade === "A" || grade === "A+"
      ? "text-emerald-600 border-emerald-200"
      : grade === "B"
      ? "text-blue-600 border-blue-200"
      : grade === "C"
      ? "text-amber-600 border-amber-200"
      : grade === "D"
      ? "text-orange-600 border-orange-200"
      : "text-red-600 border-red-200";

  return (
    <div className={`flex flex-col items-center justify-center w-16 h-16 rounded-full border-2 ${colorClass}`}>
      <span className={`text-2xl font-bold leading-none ${colorClass.split(" ")[0]}`}>{grade}</span>
      <span className="text-xs text-gray-400 mt-0.5">{score}/100</span>
    </div>
  );
}

export default function SecurityHeadersCard({ data }: Props) {
  const presentCount = data.headers.filter((h) => h.present).length;

  return (
    <Card
      title="Security Headers"
      icon={HeaderIcon}
      headerRight={<StatusBadge status={data.status} />}
    >
      <div className="space-y-4">
        {/* Grade + summary */}
        <div className="flex items-center gap-4 p-3 rounded-xl bg-gray-50">
          <GradeCircle grade={data.grade} score={data.score} />
          <div>
            <p className="text-sm font-semibold text-gray-800">
              {presentCount} of {data.headers.length} headers present
            </p>
            <p className="text-xs text-gray-400 mt-0.5">{data.domain}</p>
          </div>
        </div>

        {/* Header list */}
        <div className="divide-y divide-gray-50">
          {data.headers.map((header) => (
            <div key={header.name} className="flex items-start justify-between py-2.5 gap-2">
              <div className="flex items-start gap-2.5 min-w-0">
                <span
                  className={`flex-shrink-0 mt-0.5 w-5 h-5 rounded-full flex items-center justify-center ${
                    header.present ? "bg-emerald-100" : "bg-red-100"
                  }`}
                >
                  {header.present ? (
                    <svg className="w-3 h-3 text-emerald-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path
                        fillRule="evenodd"
                        d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <svg className="w-3 h-3 text-red-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                    </svg>
                  )}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-700 font-mono truncate">
                    {header.name}
                  </p>
                  {header.value ? (
                    <p className="text-xs text-gray-400 mt-0.5 truncate font-mono">{header.value}</p>
                  ) : (
                    <p className="text-xs text-gray-400 mt-0.5">{header.description}</p>
                  )}
                </div>
              </div>
              <span
                className={`flex-shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${
                  header.present
                    ? "bg-emerald-50 text-emerald-600"
                    : "bg-red-50 text-red-500"
                }`}
              >
                {header.present ? "Present" : "Missing"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
