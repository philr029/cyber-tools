"use client";

import { useState } from "react";
import type { SubdomainResult, SubdomainEntry } from "@/lib/types";
import Card from "@/app/components/ui/Card";
import StatusBadge from "@/app/components/ui/StatusBadge";

const SubdomainIcon = (
  <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z" clipRule="evenodd" />
  </svg>
);

const PAGE_SIZE = 50;

interface Props {
  data: SubdomainResult;
}

function SubdomainRow({ entry }: { entry: SubdomainEntry }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-[#162038] last:border-0 gap-3">
      <span className="text-sm font-mono text-slate-300 break-all min-w-0">{entry.subdomain}</span>
      {entry.isWildcard && (
        <span className="flex-shrink-0 text-xs px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 ring-1 ring-cyan-500/20">
          wildcard
        </span>
      )}
    </div>
  );
}

export default function SubdomainCard({ data }: Props) {
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(data.subdomains.length / PAGE_SIZE);
  const visible = data.subdomains.slice(0, page * PAGE_SIZE);

  return (
    <Card
      title="Subdomain Enumeration"
      icon={SubdomainIcon}
      headerRight={<StatusBadge status={data.status} />}
    >
      <div className="space-y-4">
        {/* Summary */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-700/20 border border-[#162038]">
          <div>
            <p className="text-sm font-semibold text-slate-200">
              {data.totalFound} subdomain{data.totalFound !== 1 ? "s" : ""} found
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              {data.domain} · via {data.source}
            </p>
          </div>
        </div>

        {data.subdomains.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-4">
            No subdomains found in certificate transparency logs.
          </p>
        ) : (
          <>
            <div className="max-h-96 overflow-y-auto rounded-xl border border-[#1e2d4a] px-4 py-1">
              {visible.map((entry, i) => (
                <SubdomainRow key={i} entry={entry} />
              ))}
            </div>
            {page < totalPages && (
              <button
                type="button"
                onClick={() => setPage((p) => p + 1)}
                className="w-full text-xs text-slate-500 hover:text-cyan-400 transition-colors py-2"
              >
                Show more ({data.subdomains.length - visible.length} remaining)
              </button>
            )}
          </>
        )}
      </div>
    </Card>
  );
}
