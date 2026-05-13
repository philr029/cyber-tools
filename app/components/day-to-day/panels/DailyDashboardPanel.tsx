"use client";

import { useMemo } from "react";
import { useToast } from "@/lib/toast-context";
import ExportToolbar from "../ExportToolbar";
import { useLocalStorageState } from "../useLocalStorageState";

type Row = { id: string; text: string; done: boolean };

export type DailyDashboardState = {
  priorities: Row[];
  notes: string;
  daily: Row[];
  meetings: string;
  leadDue: string;
  webDue: string;
  phoneDue: string;
  secDue: string;
  eodWins: string;
  eodBlockers: string;
  eodTomorrow: string;
};

const defaultState = (): DailyDashboardState => ({
  priorities: [
    { id: "p1", text: "Today’s #1 outcome", done: false },
    { id: "p2", text: "Second priority", done: false },
    { id: "p3", text: "Third priority", done: false },
  ],
  notes: "",
  daily: [
    { id: "d1", text: "Morning focus block", done: false },
    { id: "d2", text: "Inbox / tickets sweep", done: false },
    { id: "d3", text: "Lead + website checks", done: false },
  ],
  meetings: "Meetings today — add times, attendees, and prep links.\n",
  leadDue: "",
  webDue: "",
  phoneDue: "",
  secDue: "",
  eodWins: "",
  eodBlockers: "",
  eodTomorrow: "",
});

function MiniChecklist({
  title,
  rows,
  onChange,
  onAdd,
}: {
  title: string;
  rows: Row[];
  onChange: (next: Row[]) => void;
  onAdd: () => void;
}) {
  return (
    <div className="rounded-2xl border border-[var(--ss-border)] p-4 space-y-3 bg-[color-mix(in_srgb,var(--ss-text)_3%,transparent)]">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-[var(--ss-text)]">{title}</h3>
        <button type="button" onClick={onAdd} className="text-xs font-semibold text-[var(--ss-accent)] hover:underline">
          Add
        </button>
      </div>
      <ul className="space-y-2">
        {rows.map((r) => (
          <li key={r.id} className="flex items-start gap-2">
            <input type="checkbox" checked={r.done} onChange={() => onChange(rows.map((x) => (x.id === r.id ? { ...x, done: !x.done } : x)))} className="mt-1" />
            <input
              value={r.text}
              onChange={(e) => onChange(rows.map((x) => (x.id === r.id ? { ...x, text: e.target.value } : x)))}
              className="flex-1 min-w-0 bg-transparent border border-transparent border-b-[var(--ss-border)] text-sm text-[var(--ss-text)] focus:border-[var(--ss-accent)] focus:outline-none"
            />
            <button type="button" className="text-xs text-red-400" onClick={() => onChange(rows.filter((x) => x.id !== r.id))}>
              ✕
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function DailyDashboardPanel({ storageKey }: { storageKey: string }) {
  const { toast } = useToast();
  const [data, setData] = useLocalStorageState<DailyDashboardState>(storageKey, defaultState());

  const report = useMemo(() => {
    const pr = data.priorities.map((p) => `${p.done ? "[x]" : "[ ]"} ${p.text}`).join("\n");
    const dl = data.daily.map((p) => `${p.done ? "[x]" : "[ ]"} ${p.text}`).join("\n");
    return [
      `# Daily report — ${new Date().toLocaleDateString()}`,
      "",
      "## Priority tasks",
      pr || "—",
      "",
      "## Quick notes",
      data.notes || "—",
      "",
      "## Daily checklist",
      dl || "—",
      "",
      "## Meetings",
      data.meetings || "—",
      "",
      "## Due today",
      `Lead checks: ${data.leadDue || "—"}`,
      `Website checks: ${data.webDue || "—"}`,
      `Phone checks: ${data.phoneDue || "—"}`,
      `Security checks: ${data.secDue || "—"}`,
      "",
      "## End of day summary",
      "### Wins",
      data.eodWins || "—",
      "",
      "### Blockers",
      data.eodBlockers || "—",
      "",
      "### Tomorrow",
      data.eodTomorrow || "—",
    ].join("\n");
  }, [data]);

  async function copyReport() {
    try {
      await navigator.clipboard.writeText(report);
      toast("Daily report copied", "success");
    } catch {
      toast("Copy failed", "error");
    }
  }

  function patch<K extends keyof DailyDashboardState>(key: K, value: DailyDashboardState[K]) {
    setData((d) => ({ ...d, [key]: value }));
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2 justify-between items-center">
        <ExportToolbar filenameBase="daily-dashboard" getText={() => report} getJson={() => data} />
        <button type="button" onClick={() => void copyReport()} className="ss-pill ss-pill-primary px-4 py-2 text-xs font-semibold text-white">
          Copy daily report
        </button>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <MiniChecklist
          title="Today’s priority tasks"
          rows={data.priorities}
          onChange={(priorities) => patch("priorities", priorities)}
          onAdd={() => patch("priorities", [...data.priorities, { id: `p-${Date.now()}`, text: "", done: false }])}
        />
        <MiniChecklist
          title="Daily checklist"
          rows={data.daily}
          onChange={(daily) => patch("daily", daily)}
          onAdd={() => patch("daily", [...data.daily, { id: `d-${Date.now()}`, text: "", done: false }])}
        />
      </div>

      <div className="rounded-2xl border border-[var(--ss-border)] p-4 space-y-2">
        <h3 className="text-sm font-semibold text-[var(--ss-text)]">Quick notes</h3>
        <textarea
          value={data.notes}
          onChange={(e) => patch("notes", e.target.value)}
          className="w-full min-h-[100px] rounded-xl border border-[var(--ss-border)] bg-[color-mix(in_srgb,var(--ss-text)_4%,transparent)] px-3 py-2 text-sm text-[var(--ss-text)]"
          placeholder="Capture thoughts, links, and follow-ups…"
        />
      </div>

      <div className="rounded-2xl border border-[var(--ss-border)] p-4 space-y-2">
        <h3 className="text-sm font-semibold text-[var(--ss-text)]">Meetings today (placeholder)</h3>
        <textarea
          value={data.meetings}
          onChange={(e) => patch("meetings", e.target.value)}
          className="w-full min-h-[88px] rounded-xl border border-[var(--ss-border)] bg-[color-mix(in_srgb,var(--ss-text)_4%,transparent)] px-3 py-2 text-sm text-[var(--ss-text)]"
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <label className="block space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-[var(--ss-text-secondary)]">Lead checks due</span>
          <textarea value={data.leadDue} onChange={(e) => patch("leadDue", e.target.value)} className="w-full min-h-[72px] rounded-xl border border-[var(--ss-border)] bg-[color-mix(in_srgb,var(--ss-text)_4%,transparent)] px-3 py-2 text-sm" />
        </label>
        <label className="block space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-[var(--ss-text-secondary)]">Website checks due</span>
          <textarea value={data.webDue} onChange={(e) => patch("webDue", e.target.value)} className="w-full min-h-[72px] rounded-xl border border-[var(--ss-border)] bg-[color-mix(in_srgb,var(--ss-text)_4%,transparent)] px-3 py-2 text-sm" />
        </label>
        <label className="block space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-[var(--ss-text-secondary)]">Phone checks due</span>
          <textarea value={data.phoneDue} onChange={(e) => patch("phoneDue", e.target.value)} className="w-full min-h-[72px] rounded-xl border border-[var(--ss-border)] bg-[color-mix(in_srgb,var(--ss-text)_4%,transparent)] px-3 py-2 text-sm" />
        </label>
        <label className="block space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-[var(--ss-text-secondary)]">Security checks due</span>
          <textarea value={data.secDue} onChange={(e) => patch("secDue", e.target.value)} className="w-full min-h-[72px] rounded-xl border border-[var(--ss-border)] bg-[color-mix(in_srgb,var(--ss-text)_4%,transparent)] px-3 py-2 text-sm" />
        </label>
      </div>

      <div className="rounded-2xl border border-[var(--ss-border)] p-4 space-y-3">
        <h3 className="text-sm font-semibold text-[var(--ss-text)]">End-of-day summary generator</h3>
        <div className="grid sm:grid-cols-3 gap-3">
          <label className="space-y-1 block">
            <span className="text-xs text-[var(--ss-text-secondary)]">Wins</span>
            <textarea value={data.eodWins} onChange={(e) => patch("eodWins", e.target.value)} className="w-full min-h-[80px] rounded-xl border border-[var(--ss-border)] bg-[color-mix(in_srgb,var(--ss-text)_4%,transparent)] px-2 py-1.5 text-sm" />
          </label>
          <label className="space-y-1 block">
            <span className="text-xs text-[var(--ss-text-secondary)]">Blockers</span>
            <textarea value={data.eodBlockers} onChange={(e) => patch("eodBlockers", e.target.value)} className="w-full min-h-[80px] rounded-xl border border-[var(--ss-border)] bg-[color-mix(in_srgb,var(--ss-text)_4%,transparent)] px-2 py-1.5 text-sm" />
          </label>
          <label className="space-y-1 block">
            <span className="text-xs text-[var(--ss-text-secondary)]">Tomorrow</span>
            <textarea value={data.eodTomorrow} onChange={(e) => patch("eodTomorrow", e.target.value)} className="w-full min-h-[80px] rounded-xl border border-[var(--ss-border)] bg-[color-mix(in_srgb,var(--ss-text)_4%,transparent)] px-2 py-1.5 text-sm" />
          </label>
        </div>
        <pre className="rounded-xl border border-[var(--ss-border)] bg-[color-mix(in_srgb,var(--ss-text)_4%,transparent)] p-3 text-xs font-mono whitespace-pre-wrap text-[var(--ss-text)] max-h-48 overflow-auto">{report}</pre>
      </div>

      <p className="text-xs text-[var(--ss-text-secondary)]">All sections persist in localStorage under this device only.</p>
    </div>
  );
}
