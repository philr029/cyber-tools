"use client";

import { useMemo, useState } from "react";
import ToolPageLayout from "@/app/components/tools/ToolPageLayout";

const ITEMS = [
  { id: "pb-1", label: "Default inbound profile documented (block vs allow) per device class" },
  { id: "pb-2", label: "SMB 445 exposure verified closed on client subnets" },
  { id: "pb-3", label: "RDP 3389 not exposed to internet; jump hosts or VPN enforced" },
  { id: "pb-4", label: "WinRM / WMI hardening reviewed for lateral movement paths" },
  { id: "pb-5", label: "Defender Firewall profiles aligned with Intune configuration policies" },
  { id: "pb-6", label: "Emergency change window defined to open temporary rules with expiry" },
];

export default function PortBlockingChecklistPage() {
  const [done, setDone] = useState<Record<string, boolean>>({});
  const count = useMemo(() => ITEMS.filter((i) => done[i.id]).length, [done]);

  return (
    <ToolPageLayout
      title="Port blocking & firewall checklist"
      description="Host and edge posture review focused on common lateral movement ports."
    >
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <p className="text-xs text-white/55 mb-4">
          For automated port intelligence, plan AbuseIPDB / cloud NSG integrations behind `/api` routes. Keys stay in
          Vercel environment variables only.
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
