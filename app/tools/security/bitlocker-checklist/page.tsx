"use client";

import { useMemo, useState } from "react";
import ToolPageLayout from "@/app/components/tools/ToolPageLayout";

const ITEMS = [
  { id: "bl-1", label: "BitLocker enabled on OS volume with AES-256 (or org standard)" },
  { id: "bl-2", label: "Recovery key escrowed to Entra ID / AD DS per policy" },
  { id: "bl-3", label: "TPM protector present; PIN or enhanced PIN policy documented" },
  { id: "bl-4", label: "Network Unlock / secondary unlock path tested for deskside" },
  { id: "bl-5", label: "Suspend BitLocker workflow understood for firmware updates" },
  { id: "bl-6", label: "Event log sample captured showing successful protector unlock" },
];

export default function BitLockerChecklistPage() {
  const [done, setDone] = useState<Record<string, boolean>>({});
  const count = useMemo(() => ITEMS.filter((i) => done[i.id]).length, [done]);

  return (
    <ToolPageLayout
      title="BitLocker readiness checklist"
      description="Disk encryption verification for Windows fleets before audit sign-off."
    >
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <p className="text-xs text-white/55 mb-4">
          Pair with Intune compliance views for live posture. API integration ready — connect Graph from server routes when
          keys are configured.
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
