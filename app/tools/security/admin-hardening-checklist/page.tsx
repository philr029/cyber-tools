"use client";

import { useMemo, useState } from "react";
import ToolPageLayout from "@/app/components/tools/ToolPageLayout";

const ITEMS = [
  { id: "ah-1", label: "Break-glass accounts inventoried, cloud-only, and excluded from per-user MFA policies safely" },
  { id: "ah-2", label: "Global Administrator count at minimum viable; PIM/PAM in place where licensed" },
  { id: "ah-3", label: "Guest access restricted; cross-tenant settings reviewed" },
  { id: "ah-4", label: "Legacy auth blocked for privileged workloads" },
  { id: "ah-5", label: "Conditional Access report-only policies reviewed for unintended blocks" },
  { id: "ah-6", label: "Durable audit export path defined (Graph / SIEM) before changes" },
];

export default function AdminHardeningChecklistPage() {
  const [done, setDone] = useState<Record<string, boolean>>({});
  const count = useMemo(() => ITEMS.filter((i) => done[i.id]).length, [done]);

  return (
    <ToolPageLayout
      title="Administrator hardening checklist"
      description="Tenant-level guardrails before expanding privileged roles or integrating third parties."
    >
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <p className="text-xs text-white/55 mb-4">
          Microsoft Graph and security API calls belong in Vercel serverless routes — never ship application secrets to the
          browser bundle.
        </p>
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-white/70">
            Progress:{" "}
            <span className="font-semibold text-cyan-300">
              {count}/{ITEMS.length}
            </span>
          </p>
          <button
            type="button"
            onClick={() => setDone({})}
            className="text-xs font-semibold text-white/50 hover:text-cyan-200"
          >
            Reset
          </button>
        </div>
        <ul className="space-y-2">
          {ITEMS.map((item) => (
            <li key={item.id}>
              <label className="flex items-start gap-3 rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white/80 hover:border-cyan-500/30 cursor-pointer">
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4 rounded border-white/30 text-cyan-500 focus:ring-cyan-400/40"
                  checked={Boolean(done[item.id])}
                  onChange={(e) => setDone((d) => ({ ...d, [item.id]: e.target.checked }))}
                />
                <span>{item.label}</span>
              </label>
            </li>
          ))}
        </ul>
      </div>
    </ToolPageLayout>
  );
}
