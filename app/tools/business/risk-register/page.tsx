"use client";

import { useEffect, useMemo, useState } from "react";
import ToolPageLayout from "@/app/components/tools/ToolPageLayout";
import CopyButton from "@/app/components/tools/CopyButton";

interface Risk {
  id: string;
  risk: string;
  impact: "Low" | "Medium" | "High";
  likelihood: "Low" | "Medium" | "High";
  owner: string;
  mitigation: string;
  status: "Open" | "Mitigating" | "Closed";
}

const STORAGE_KEY = "ss.risk-register";

const DEFAULTS: Risk[] = [
  {
    id: "r1",
    risk: "Lack of MFA on legacy service accounts",
    impact: "High",
    likelihood: "Medium",
    owner: "Identity team",
    mitigation: "Move secrets to Key Vault, enforce Conditional Access on app-only sign-ins",
    status: "Mitigating",
  },
  {
    id: "r2",
    risk: "Outdated incident response playbook",
    impact: "Medium",
    likelihood: "Medium",
    owner: "Security lead",
    mitigation: "Quarterly tabletop, refresh runbooks after each exercise",
    status: "Open",
  },
];

function score(r: Risk): number {
  const map = { Low: 1, Medium: 2, High: 3 } as const;
  return map[r.impact] * map[r.likelihood];
}

export default function RiskRegisterPage() {
  const [risks, setRisks] = useState<Risk[]>(DEFAULTS);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        // Hydrating from localStorage — intentional client-side state restore.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (Array.isArray(parsed)) setRisks(parsed);
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(risks));
    } catch {
      /* ignore */
    }
  }, [risks]);

  function update(id: string, patch: Partial<Risk>) {
    setRisks((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  function add() {
    setRisks((prev) => [
      ...prev,
      {
        id: `r${Date.now()}`,
        risk: "",
        impact: "Medium",
        likelihood: "Medium",
        owner: "",
        mitigation: "",
        status: "Open",
      },
    ]);
  }

  function remove(id: string) {
    setRisks((prev) => prev.filter((r) => r.id !== id));
  }

  const markdown = useMemo(() => {
    const header = `| Risk | Impact | Likelihood | Score | Owner | Mitigation | Status |\n|---|---|---|---:|---|---|---|`;
    const rows = risks
      .map(
        (r) =>
          `| ${r.risk || "(blank)"} | ${r.impact} | ${r.likelihood} | ${score(r)} | ${r.owner || "(none)"} | ${r.mitigation || "(none)"} | ${r.status} |`,
      )
      .join("\n");
    return [`# Risk register`, ``, header, rows].join("\n");
  }, [risks]);

  const sevColor = (n: number) =>
    n >= 6
      ? "bg-rose-500/20 text-rose-200"
      : n >= 4
        ? "bg-amber-500/20 text-amber-200"
        : "bg-emerald-500/20 text-emerald-200";

  return (
    <ToolPageLayout
      title="Risk Register Builder"
      description="Capture risks in a structured register with impact, likelihood, ownership, mitigation and status. Saved locally and exportable as a Markdown table."
    >
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <Meta label="Skill" body="Risk management, governance." accent="cyan" />
        <Meta label="Why" body="A register that exists and is reviewed is worth ten policies that aren't." accent="violet" />
        <Meta label="Privacy" body="Stored entirely in your browser via localStorage. Nothing transmitted." accent="emerald" />
      </div>

      <div className="mb-4 flex justify-end">
        <button
          type="button"
          onClick={add}
          className="rounded-xl bg-cyan-500/90 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-cyan-400"
        >
          + Add risk
        </button>
      </div>

      <div className="rounded-[24px] border border-white/10 bg-[rgba(255,255,255,0.03)] p-1 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-[0.18em] text-white/55">
                <th className="px-3 py-3 w-[24%]">Risk</th>
                <th className="px-3 py-3">Impact</th>
                <th className="px-3 py-3">Likelihood</th>
                <th className="px-3 py-3 text-right">Score</th>
                <th className="px-3 py-3">Owner</th>
                <th className="px-3 py-3 w-[24%]">Mitigation</th>
                <th className="px-3 py-3">Status</th>
                <th />
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {risks.map((r) => {
                const s = score(r);
                return (
                  <tr key={r.id} className="text-white/85 align-top">
                    <td className="px-3 py-2">
                      <textarea
                        rows={2}
                        value={r.risk}
                        onChange={(e) => update(r.id, { risk: e.target.value })}
                        className="w-full rounded-lg border border-white/10 bg-black/30 px-2 py-1 text-sm text-white focus:border-cyan-400/30 focus:outline-none"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <select
                        value={r.impact}
                        onChange={(e) => update(r.id, { impact: e.target.value as Risk["impact"] })}
                        className="rounded-lg border border-white/10 bg-black/30 px-2 py-1 text-sm text-white"
                      >
                        <option className="bg-[#0b1220]">Low</option>
                        <option className="bg-[#0b1220]">Medium</option>
                        <option className="bg-[#0b1220]">High</option>
                      </select>
                    </td>
                    <td className="px-3 py-2">
                      <select
                        value={r.likelihood}
                        onChange={(e) => update(r.id, { likelihood: e.target.value as Risk["likelihood"] })}
                        className="rounded-lg border border-white/10 bg-black/30 px-2 py-1 text-sm text-white"
                      >
                        <option className="bg-[#0b1220]">Low</option>
                        <option className="bg-[#0b1220]">Medium</option>
                        <option className="bg-[#0b1220]">High</option>
                      </select>
                    </td>
                    <td className="px-3 py-2 text-right">
                      <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${sevColor(s)}`}>
                        {s}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <input
                        value={r.owner}
                        onChange={(e) => update(r.id, { owner: e.target.value })}
                        className="w-full rounded-lg border border-white/10 bg-black/30 px-2 py-1 text-sm text-white focus:border-cyan-400/30 focus:outline-none"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <textarea
                        rows={2}
                        value={r.mitigation}
                        onChange={(e) => update(r.id, { mitigation: e.target.value })}
                        className="w-full rounded-lg border border-white/10 bg-black/30 px-2 py-1 text-sm text-white focus:border-cyan-400/30 focus:outline-none"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <select
                        value={r.status}
                        onChange={(e) => update(r.id, { status: e.target.value as Risk["status"] })}
                        className="rounded-lg border border-white/10 bg-black/30 px-2 py-1 text-sm text-white"
                      >
                        <option className="bg-[#0b1220]">Open</option>
                        <option className="bg-[#0b1220]">Mitigating</option>
                        <option className="bg-[#0b1220]">Closed</option>
                      </select>
                    </td>
                    <td className="px-3 py-2">
                      <button
                        type="button"
                        onClick={() => remove(r.id)}
                        aria-label="Remove risk"
                        className="rounded-lg border border-white/10 px-2 py-1 text-[11px] text-white/55 transition-colors hover:border-rose-400/40 hover:text-rose-200"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6 rounded-[24px] border border-white/10 bg-black/30 p-4">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/55">
            Risk register (Markdown)
          </p>
          <CopyButton text={markdown} label="Copy table" />
        </div>
        <pre className="max-h-72 overflow-auto rounded-xl bg-black/40 p-3 text-xs leading-6 text-white/85 whitespace-pre-wrap">
{markdown}
        </pre>
      </div>
    </ToolPageLayout>
  );
}

function Meta({
  label,
  body,
  accent,
}: {
  label: string;
  body: string;
  accent: "cyan" | "violet" | "emerald";
}) {
  const map: Record<string, string> = {
    cyan: "border-cyan-400/20 bg-cyan-500/5 text-cyan-200",
    violet: "border-violet-400/20 bg-violet-500/5 text-violet-200",
    emerald: "border-emerald-400/20 bg-emerald-500/5 text-emerald-200",
  };
  return (
    <div className={`rounded-2xl border p-4 ${map[accent]}`}>
      <p className="text-[10px] font-semibold uppercase tracking-[0.28em] opacity-80">{label}</p>
      <p className="mt-1.5 text-xs leading-6 text-white/75">{body}</p>
    </div>
  );
}
