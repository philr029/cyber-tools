import type { EmailHeaderResult } from "@/lib/types";
import Card from "@/app/components/ui/Card";
import StatusBadge from "@/app/components/ui/StatusBadge";

const EmailIcon = (
  <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path d="M3 4a2 2 0 00-2 2v1.161l8.441 4.221a1.25 1.25 0 001.118 0L19 7.162V6a2 2 0 00-2-2H3z" />
    <path d="M19 8.839l-7.77 3.885a2.75 2.75 0 01-2.46 0L1 8.839V14a2 2 0 002 2h14a2 2 0 002-2V8.839z" />
  </svg>
);

interface Props {
  data: EmailHeaderResult;
}

function AuthRow({
  label,
  present,
  pass,
  result,
}: {
  label: string;
  present: boolean;
  pass: boolean;
  result: string | null;
}) {
  const status = !present
    ? { label: "Not Found", classes: "bg-slate-700/50 text-slate-400 ring-1 ring-[#1e2d4a]" }
    : pass
    ? { label: "Pass", classes: "bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20" }
    : { label: result ? `Fail (${result})` : "Fail", classes: "bg-red-500/10 text-red-400 ring-1 ring-red-500/20" };

  return (
    <div className="flex items-center justify-between py-2.5 border-b border-[#162038] last:border-0">
      <span className="text-sm font-medium text-slate-300">{label}</span>
      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${status.classes}`}>
        {status.label}
      </span>
    </div>
  );
}

export default function EmailHeaderCard({ data }: Props) {
  const fields = [
    { label: "From", value: data.fromAddress },
    { label: "Reply-To", value: data.replyTo },
    { label: "Subject", value: data.subject },
    { label: "Date", value: data.date },
    { label: "Sender IP", value: data.senderIP },
  ];

  return (
    <Card
      title="Email Header Analysis"
      icon={EmailIcon}
      headerRight={<StatusBadge status={data.status} />}
    >
      <div className="space-y-5">
        {/* Authentication results */}
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
            Email Authentication
          </p>
          <AuthRow
            label="SPF"
            present={data.spf.present}
            pass={data.spf.pass}
            result={data.spf.result}
          />
          <AuthRow
            label="DKIM"
            present={data.dkim.present}
            pass={data.dkim.pass}
            result={data.dkim.result}
          />
          <AuthRow
            label="DMARC"
            present={data.dmarc.present}
            pass={data.dmarc.pass}
            result={data.dmarc.result}
          />
        </div>

        {/* Header fields */}
        <div className="border-t border-[#162038] pt-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
            Key Fields
          </p>
          <div className="space-y-2">
            {fields.map(({ label, value }) =>
              value ? (
                <div key={label} className="flex flex-col gap-0.5">
                  <span className="text-xs text-slate-500 font-medium">{label}</span>
                  <span className="text-sm font-mono text-slate-300 break-all">{value}</span>
                </div>
              ) : null,
            )}
          </div>
        </div>

        {/* Received chain */}
        {data.receivedChain.length > 0 && (
          <div className="border-t border-[#162038] pt-4">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
              Received Chain ({data.receivedChain.length} hops)
            </p>
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {data.receivedChain.map((hop, i) => (
                <div key={i} className="flex gap-2">
                  <span className="flex-shrink-0 text-xs text-slate-600 font-mono mt-0.5">
                    {data.receivedChain.length - i}.
                  </span>
                  <span className="text-xs font-mono text-slate-400 break-all">{hop}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Suspicious indicators */}
        {data.suspiciousIndicators.length > 0 && (
          <div className="border-t border-[#162038] pt-4">
            <p className="text-xs font-semibold text-amber-400 uppercase tracking-wide mb-2">
              ⚠ Suspicious Indicators
            </p>
            <ul className="space-y-1.5">
              {data.suspiciousIndicators.map((s, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-xs text-amber-300 bg-amber-500/5 border border-amber-500/10 rounded-lg px-3 py-2"
                >
                  <span className="flex-shrink-0 mt-0.5">⚠</span>
                  {s}
                </li>
              ))}
            </ul>
          </div>
        )}

        {data.suspiciousIndicators.length === 0 && (
          <div className="border-t border-[#162038] pt-4">
            <div className="flex items-center gap-2 text-sm text-emerald-400">
              <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
              </svg>
              No suspicious indicators detected
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
