"use client";

import type { LookupResult } from "@/lib/types";
import IPReputationCard from "@/app/components/results/IPReputationCard";
import DomainReputationCard from "@/app/components/results/DomainReputationCard";
import BlacklistCard from "@/app/components/results/BlacklistCard";
import SSLCard from "@/app/components/results/SSLCard";
import SecurityHeadersCard from "@/app/components/results/SecurityHeadersCard";
import OpenPortsCard from "@/app/components/results/OpenPortsCard";
import DNSCard from "@/app/components/results/DNSCard";
import MockDataBanner from "@/app/components/ui/MockDataBanner";
import ShareButton from "@/app/components/ShareButton";
import ExportButton from "@/app/components/ExportButton";

interface Props {
  result: LookupResult;
  isMock: boolean;
}

export default function ResultsGrid({ result, isMock }: Props) {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Query summary bar */}
      <div className="flex items-center gap-3 px-5 py-4 bg-[#0f1629] rounded-2xl border border-[#1e2d4a] shadow-[0_4px_24px_rgba(0,0,0,0.3)]">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex-shrink-0 shadow-[0_0_12px_rgba(6,182,212,0.3)]">
          <svg
            className="w-5 h-5 text-white"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-base font-semibold text-slate-100 truncate">{result.query}</p>
          <p className="text-xs text-slate-500 mt-0.5">
            Scanned{" "}
            {new Intl.DateTimeFormat("en-US", {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            }).format(new Date(result.timestamp))}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <ExportButton result={result} />
          <ShareButton result={result} />
          <MockDataBanner isMock={isMock} />
        </div>
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="card-stagger-1"><IPReputationCard data={result.ipReputation} /></div>
        <div className="card-stagger-2"><DomainReputationCard data={result.domainReputation} /></div>
        <div className="card-stagger-3"><BlacklistCard data={result.blacklist} /></div>
        <div className="card-stagger-4"><SSLCard data={result.ssl} /></div>
        <div className="card-stagger-5"><SecurityHeadersCard data={result.securityHeaders} /></div>
        <div className="card-stagger-6"><OpenPortsCard data={result.openPorts} /></div>
        <div className="lg:col-span-2 card-stagger-7">
          <DNSCard data={result.dns} />
        </div>
      </div>
    </div>
  );
}
