"use client";

import { useCallback, useEffect, useState } from "react";
import { withBasePath } from "@/lib/base-path";

type Entry = {
  id: string;
  ts: string;
  type: string;
  userId: string | null;
  email: string | null;
  ip: string | null;
  message: string;
};

export default function AdminSecurityLogPage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await fetch(withBasePath("/api/admin/audit-logs"));
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Forbidden.");
        return;
      }
      setEntries(data.entries ?? []);
    } catch {
      setError("Unable to load audit log.");
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => void load());
  }, [load]);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Security audit log</h1>
        <p className="text-sm text-slate-400 mt-1">
          In-process ring buffer for this server instance — suitable for demos only. Production should stream to SIEM,
          Postgres, or immutable object storage.
        </p>
      </div>
      {error ? <p className="text-sm text-red-400">{error}</p> : null}
      <div className="rounded-2xl border border-[#1e2d4a] divide-y divide-[#1e2d4a] bg-[#0d1321] max-h-[70vh] overflow-y-auto">
        {entries.length === 0 ? (
          <p className="p-6 text-sm text-slate-500">No events recorded yet. Sign in or change a user to generate entries.</p>
        ) : (
          entries.map((e) => (
            <div key={e.id} className="px-4 py-3 text-sm">
              <div className="flex flex-wrap items-baseline gap-2">
                <span className="text-xs font-mono text-slate-500">{e.ts}</span>
                <span className="text-xs font-semibold uppercase text-cyan-400/90">{e.type.replace(/_/g, " ")}</span>
              </div>
              <p className="text-slate-300 mt-1">{e.message}</p>
              <p className="text-xs text-slate-500 mt-1">
                {(e.email ?? "—") + " · " + (e.ip ?? "—") + (e.userId ? ` · id ${e.userId}` : "")}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
