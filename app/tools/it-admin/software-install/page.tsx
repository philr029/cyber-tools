"use client";

import { useEffect, useMemo, useState } from "react";
import ToolPageLayout from "@/app/components/tools/ToolPageLayout";
import CopyButton from "@/app/components/tools/CopyButton";

const DEPARTMENTS: Record<string, string[]> = {
  "All staff (baseline)": [
    "Microsoft 365 Apps",
    "Microsoft Edge",
    "Microsoft Teams",
    "OneDrive (Known Folder Move)",
    "Windows Defender",
    "Adobe Acrobat Reader",
  ],
  Finance: [
    "Sage / Xero / NetSuite client",
    "Power BI Desktop",
    "Excel COM add-ins for finance reports",
    "DocuSign desktop client",
    "Secure file transfer client",
  ],
  Sales: [
    "Salesforce / HubSpot CRM browser pinned",
    "Calling / softphone (Teams Phone or 3CX)",
    "LinkedIn Sales Navigator browser pin",
    "Lead enrichment extension",
    "OneNote / Loop",
  ],
  Engineering: [
    "Visual Studio Code",
    "Git for Windows",
    "Node.js LTS",
    "Docker Desktop (where licensed)",
    "WSL 2 + Ubuntu",
    "GitHub CLI",
  ],
  "IT / Helpdesk": [
    "Remote support (TeamViewer / RMM)",
    "PowerShell 7",
    "Microsoft Graph PowerShell SDK",
    "Sysinternals Suite",
    "Wireshark",
    "Putty / WinSCP",
  ],
  HR: [
    "HRIS browser pin (BambooHR / Workday)",
    "DocuSign desktop client",
    "Background-check portal pin",
    "Loop / Planner",
  ],
  Marketing: [
    "Adobe Creative Cloud (where licensed)",
    "Canva pinned",
    "Loom / screen recorder (approved)",
    "Buffer / Hootsuite browser pin",
  ],
};

const STORAGE_KEY = "ss.software-install";

interface PersistShape {
  department?: string;
  custom?: string[];
  checks?: Record<string, boolean>;
}

export default function SoftwareInstallPage() {
  const [department, setDepartment] = useState<string>("All staff (baseline)");
  const [custom, setCustom] = useState<string[]>([]);
  const [newItem, setNewItem] = useState("");
  const [checks, setChecks] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as PersistShape;
        // Hydrating from localStorage — intentional client-side state restore.
        /* eslint-disable react-hooks/set-state-in-effect */
        if (parsed?.department) setDepartment(parsed.department);
        if (parsed?.custom) setCustom(parsed.custom);
        if (parsed?.checks) setChecks(parsed.checks);
        /* eslint-enable react-hooks/set-state-in-effect */
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ department, custom, checks } satisfies PersistShape),
      );
    } catch {
      /* ignore */
    }
  }, [department, custom, checks]);

  const items = useMemo(() => {
    const base = DEPARTMENTS["All staff (baseline)"];
    const dept = department === "All staff (baseline)" ? [] : DEPARTMENTS[department] ?? [];
    return [...base, ...dept, ...custom];
  }, [department, custom]);

  const checkedCount = items.filter((i) => checks[i]).length;

  function toggle(name: string) {
    setChecks((prev) => ({ ...prev, [name]: !prev[name] }));
  }

  function addCustom() {
    const v = newItem.trim();
    if (!v || custom.includes(v) || items.includes(v)) return;
    setCustom((prev) => [...prev, v]);
    setNewItem("");
  }

  function removeCustom(name: string) {
    setCustom((prev) => prev.filter((c) => c !== name));
    setChecks((prev) => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
  }

  const markdown = useMemo(
    () =>
      [
        `# Software install checklist — ${department}`,
        ``,
        ...items.map((i) => `- [${checks[i] ? "x" : " "}] ${i}`),
      ].join("\n"),
    [items, checks, department],
  );

  return (
    <ToolPageLayout
      title="Software Install Checklist"
      description="Pick a department to see the standard software stack, tick off as you install, and add any user-specific extras. Saved in your browser via localStorage."
    >
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <Meta label="Skill" body="Endpoint provisioning." accent="cyan" />
        <Meta label="Why" body="No more 'oh I forgot to install X' a week after onboarding." accent="violet" />
        <Meta label="Future API" body="Wire to Intune / Winget to push the same list as a deployment automatically." accent="emerald" />
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-3 rounded-[24px] border border-white/10 bg-[rgba(255,255,255,0.03)] p-4 text-xs text-white/65">
        <label className="inline-flex items-center gap-2">
          Department
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="rounded-lg border border-white/10 bg-black/30 px-2 py-1 text-xs text-white"
          >
            {Object.keys(DEPARTMENTS).map((d) => (
              <option key={d} value={d} className="bg-[#0b1220]">
                {d}
              </option>
            ))}
          </select>
        </label>
        <span className="text-white/65">
          Progress {checkedCount}/{items.length}
        </span>
      </div>

      <div className="rounded-[24px] border border-white/10 bg-[rgba(255,255,255,0.03)] p-5">
        <ul className="space-y-2">
          {items.map((item) => {
            const isCustom = custom.includes(item);
            return (
              <li
                key={item}
                className="flex items-center gap-3 rounded-xl border border-white/5 bg-black/20 px-3 py-2"
              >
                <input
                  id={`sw-${item}`}
                  type="checkbox"
                  checked={!!checks[item]}
                  onChange={() => toggle(item)}
                  className="h-4 w-4 rounded border-white/20 bg-black/40 text-cyan-500 focus:ring-cyan-400/30"
                />
                <label
                  htmlFor={`sw-${item}`}
                  className={`flex-1 text-sm leading-6 ${checks[item] ? "text-white/40 line-through" : "text-white/85"}`}
                >
                  {item}
                  {isCustom && <span className="ml-2 rounded bg-violet-500/20 px-1.5 py-0.5 text-[10px] text-violet-200">custom</span>}
                </label>
                {isCustom && (
                  <button
                    type="button"
                    onClick={() => removeCustom(item)}
                    className="rounded-lg border border-white/10 px-2 py-1 text-[11px] text-white/55 transition-colors hover:border-rose-400/40 hover:text-rose-200"
                  >
                    Remove
                  </button>
                )}
              </li>
            );
          })}
        </ul>

        <div className="mt-4 flex gap-2">
          <input
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addCustom();
              }
            }}
            placeholder="Add a custom app, e.g. 'AutoCAD 2025'"
            className="flex-1 rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
          />
          <button
            type="button"
            onClick={addCustom}
            className="rounded-xl bg-cyan-500/90 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-cyan-400"
          >
            Add
          </button>
        </div>
      </div>

      <div className="mt-6 rounded-[24px] border border-white/10 bg-black/30 p-4">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/55">
            Checklist Markdown
          </p>
          <CopyButton text={markdown} label="Copy checklist" />
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
