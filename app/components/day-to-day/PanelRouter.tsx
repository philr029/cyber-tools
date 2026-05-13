"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { DayToDayToolDefinition } from "@/lib/day-to-day-tools/types";
import { getGeneratorTemplate } from "@/lib/day-to-day-tools/generators";
import ExportToolbar from "./ExportToolbar";
import { useLocalStorageState } from "./useLocalStorageState";
import { useToast } from "@/lib/toast-context";
import DailyDashboardPanel from "./panels/DailyDashboardPanel";
import RichPlaceholderPanel from "./panels/RichPlaceholderPanel";
import {
  AmountTrackerPanel,
  CommandReferencePanel,
  CssGradientPanel,
  CssShadowPanel,
  CsvCleanerPanel,
  LeadResponseCalculatorPanel,
  QueryStringBuilderPanel,
  TextDiffPanel,
  UrlParserPanel,
} from "./panels/ExtraPanels";

function FieldLabel({ children }: { children: ReactNode }) {
  return <label className="block text-xs font-semibold uppercase tracking-wide text-[var(--ss-text-secondary)] mb-1.5">{children}</label>;
}

function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full rounded-xl border border-[var(--ss-border)] bg-[color-mix(in_srgb,var(--ss-text)_4%,transparent)] px-3 py-2 text-sm text-[var(--ss-text)] placeholder:text-[color-mix(in_srgb,var(--ss-text-secondary)_55%,transparent)] focus:outline-none focus:ring-2 focus:ring-[var(--ss-ring)] ${props.className ?? ""}`}
    />
  );
}

function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`w-full min-h-[120px] rounded-xl border border-[var(--ss-border)] bg-[color-mix(in_srgb,var(--ss-text)_4%,transparent)] px-3 py-2 text-sm text-[var(--ss-text)] placeholder:text-[color-mix(in_srgb,var(--ss-text-secondary)_55%,transparent)] focus:outline-none focus:ring-2 focus:ring-[var(--ss-ring)] ${props.className ?? ""}`}
    />
  );
}

function EmptyPanelHint({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-[var(--ss-border)] bg-[color-mix(in_srgb,var(--ss-accent-soft)_40%,transparent)] px-4 py-8 text-center">
      <p className="text-sm font-semibold text-[var(--ss-text)]">{title}</p>
      <p className="mt-2 text-sm text-[var(--ss-text-secondary)] max-w-md mx-auto">{body}</p>
    </div>
  );
}

function NotesPanel({ storageKey, placeholder }: { storageKey: string; placeholder?: string }) {
  const [text, setText] = useLocalStorageState(storageKey, "");
  return (
    <div className="space-y-3">
      <ExportToolbar filenameBase={storageKey} getText={() => text} getJson={() => ({ text })} />
      <TextArea value={text} onChange={(e) => setText(e.target.value)} placeholder={placeholder} className="min-h-[220px] font-mono text-[13px]" />
    </div>
  );
}

type CheckItem = { id: string; text: string; done: boolean };

function ChecklistPanel({ storageKey, seedItems }: { storageKey: string; seedItems?: string[] }) {
  const [items, setItems] = useLocalStorageState<CheckItem[]>(storageKey, []);
  const seeded = useRef(false);

  useEffect(() => {
    if (seeded.current) return;
    seeded.current = true;
    if (items.length === 0 && seedItems?.length) {
      setItems(seedItems.map((text, i) => ({ id: `seed-${i}`, text, done: false })));
    }
  }, [items.length, seedItems, setItems]);

  const csv = useMemo(() => {
    const headers = ["done", "text"];
    const rows = items.map((i) => [i.done ? "yes" : "no", i.text]);
    return { headers, rows };
  }, [items]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2 justify-between items-center">
        <ExportToolbar filenameBase={storageKey} getText={() => items.map((i) => `${i.done ? "[x]" : "[ ]"} ${i.text}`).join("\n")} getJson={() => items} csv={csv} />
        <button type="button" onClick={() => setItems((prev) => [...prev, { id: `n-${Date.now()}`, text: "", done: false }])} className="ss-pill ss-pill-primary px-3 py-1.5 text-xs font-semibold text-white">
          Add item
        </button>
      </div>
      <ul className="space-y-2">
        {items.length === 0 ? (
          <EmptyPanelHint title="No tasks yet" body="Add your first line, or they will appear here once you seed the list." />
        ) : (
          items.map((it, idx) => (
            <li key={it.id} className="flex items-start gap-2 rounded-xl border border-[var(--ss-border)] bg-[color-mix(in_srgb,var(--ss-text)_3%,transparent)] p-2">
              <input
                type="checkbox"
                checked={it.done}
                onChange={() => setItems((prev) => prev.map((p) => (p.id === it.id ? { ...p, done: !p.done } : p)))}
                className="mt-1.5"
                aria-label={`Done ${idx + 1}`}
              />
              <input
                value={it.text}
                onChange={(e) => {
                  const v = e.target.value;
                  setItems((prev) => prev.map((p) => (p.id === it.id ? { ...p, text: v } : p)));
                }}
                className="flex-1 min-w-0 bg-transparent border-0 text-sm text-[var(--ss-text)] focus:ring-0"
              />
              <button type="button" className="text-xs text-red-400 hover:text-red-300 px-2" onClick={() => setItems((prev) => prev.filter((p) => p.id !== it.id))}>
                Remove
              </button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

function StaticChecklistPanel({ items }: { items: string[] }) {
  const [done, setDone] = useState<Record<number, boolean>>({});
  return (
    <ul className="space-y-2">
      {items.map((label, i) => (
        <li key={i} className="flex items-start gap-3 rounded-xl border border-[var(--ss-border)] px-3 py-2.5">
          <input type="checkbox" checked={!!done[i]} onChange={() => setDone((d) => ({ ...d, [i]: !d[i] }))} className="mt-0.5" />
          <span className="text-sm text-[var(--ss-text)] leading-relaxed">{label}</span>
        </li>
      ))}
    </ul>
  );
}

function PriorityMatrixPanel({ storageKey }: { storageKey: string }) {
  const empty = { q1: "", q2: "", q3: "", q4: "" };
  const [data, setData] = useLocalStorageState(storageKey, empty);
  const setQ = (k: keyof typeof empty, v: string) => setData((d) => ({ ...d, [k]: v }));

  const textExport = useMemo(
    () =>
      ["Urgent & Important", data.q1, "", "Not Urgent & Important", data.q2, "", "Urgent & Not Important", data.q3, "", "Not Urgent & Not Important", data.q4].join("\n"),
    [data],
  );

  return (
    <div className="space-y-3">
      <ExportToolbar filenameBase="priority-matrix" getText={() => textExport} getJson={() => data} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="rounded-2xl border border-[var(--ss-border)] p-3 bg-rose-500/5">
          <p className="text-xs font-semibold text-rose-300 mb-2">Urgent + Important</p>
          <TextArea value={data.q1} onChange={(e) => setQ("q1", e.target.value)} className="min-h-[100px]" />
        </div>
        <div className="rounded-2xl border border-[var(--ss-border)] p-3 bg-emerald-500/5">
          <p className="text-xs font-semibold text-emerald-300 mb-2">Not urgent + Important</p>
          <TextArea value={data.q2} onChange={(e) => setQ("q2", e.target.value)} className="min-h-[100px]" />
        </div>
        <div className="rounded-2xl border border-[var(--ss-border)] p-3 bg-amber-500/5">
          <p className="text-xs font-semibold text-amber-200 mb-2">Urgent + Not important</p>
          <TextArea value={data.q3} onChange={(e) => setQ("q3", e.target.value)} className="min-h-[100px]" />
        </div>
        <div className="rounded-2xl border border-[var(--ss-border)] p-3 bg-slate-500/5">
          <p className="text-xs font-semibold text-[var(--ss-text-secondary)] mb-2">Not urgent + Not important</p>
          <TextArea value={data.q4} onChange={(e) => setQ("q4", e.target.value)} className="min-h-[100px]" />
        </div>
      </div>
    </div>
  );
}

type Reminder = { id: string; text: string; due: string };

function RemindersPanel({ storageKey }: { storageKey: string }) {
  const [rows, setRows] = useLocalStorageState<Reminder[]>(storageKey, []);
  return (
    <div className="space-y-3">
      <div className="flex justify-between gap-2 flex-wrap">
        <ExportToolbar
          filenameBase="reminders"
          getText={() => rows.map((r) => `${r.due ? `[${r.due}] ` : ""}${r.text}`).join("\n")}
          getJson={() => rows}
          csv={{ headers: ["due", "text"], rows: rows.map((r) => [r.due, r.text]) }}
        />
        <button type="button" onClick={() => setRows((p) => [...p, { id: `r-${Date.now()}`, text: "", due: "" }])} className="ss-pill ss-pill-primary px-3 py-1.5 text-xs font-semibold text-white">
          Add reminder
        </button>
      </div>
      {rows.length === 0 ? <EmptyPanelHint title="No reminders" body="Capture follow-ups so nothing slips through the cracks." /> : null}
      <ul className="space-y-2">
        {rows.map((r) => (
          <li key={r.id} className="flex flex-col sm:flex-row gap-2 rounded-xl border border-[var(--ss-border)] p-2">
            <TextInput className="sm:w-36" placeholder="Due" value={r.due} onChange={(e) => setRows((p) => p.map((x) => (x.id === r.id ? { ...x, due: e.target.value } : x)))} />
            <input
              value={r.text}
              onChange={(e) => setRows((p) => p.map((x) => (x.id === r.id ? { ...x, text: e.target.value } : x)))}
              className="flex-1 rounded-xl border border-[var(--ss-border)] bg-transparent px-3 py-2 text-sm"
            />
            <button type="button" className="text-xs text-red-400 px-2" onClick={() => setRows((p) => p.filter((x) => x.id !== r.id))}>
              Remove
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function TimerPanel({ variant }: { variant: "pomodoro" | "focus" }) {
  const work = variant === "pomodoro" ? 25 * 60 : 50 * 60;
  const br = variant === "pomodoro" ? 5 * 60 : 10 * 60;
  const [running, setRunning] = useState(false);
  const [tick, setTick] = useState({ mode: "work" as "work" | "break", sec: work });

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      setTick((t) => {
        if (t.sec > 1) return { ...t, sec: t.sec - 1 };
        const nextMode = t.mode === "work" ? "break" : "work";
        return { mode: nextMode, sec: nextMode === "work" ? work : br };
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [running, work, br]);

  const mm = String(Math.floor(tick.sec / 60)).padStart(2, "0");
  const ss = String(tick.sec % 60).padStart(2, "0");

  return (
    <div className="text-center space-y-4 py-4">
      <p className="text-xs uppercase tracking-wider text-[var(--ss-text-secondary)]">{tick.mode === "work" ? "Focus" : "Break"}</p>
      <p className="text-5xl sm:text-6xl font-semibold tabular-nums text-[var(--ss-text)] tracking-tight">
        {mm}:{ss}
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        <button type="button" onClick={() => setRunning((r) => !r)} className="ss-pill ss-pill-primary px-5 py-2 text-sm font-semibold text-white">
          {running ? "Pause" : "Start"}
        </button>
        <button
          type="button"
          onClick={() => {
            setRunning(false);
            setTick({ mode: "work", sec: work });
          }}
          className="ss-pill px-4 py-2 text-sm font-semibold border border-[var(--ss-border)]"
        >
          Reset
        </button>
      </div>
      <p className="text-xs text-[var(--ss-text-secondary)] max-w-sm mx-auto">
        {variant === "pomodoro" ? "25 minute focus blocks with 5 minute short breaks." : "50 minute deep work with 10 minute recovery."}
      </p>
    </div>
  );
}

const HOURS = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"];

function HourlyPlannerPanel({ storageKey }: { storageKey: string }) {
  const initial = Object.fromEntries(HOURS.map((h) => [h, ""]));
  const [map, setMap] = useLocalStorageState<Record<string, string>>(storageKey, initial);
  const text = useMemo(() => HOURS.map((h) => `${h}\t${map[h] ?? ""}`).join("\n"), [map]);

  return (
    <div className="space-y-3">
      <ExportToolbar filenameBase="day-planner" getText={() => text} getJson={() => map} csv={{ headers: ["hour", "plan"], rows: HOURS.map((h) => [h, map[h] ?? ""]) }} />
      <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
        {HOURS.map((h) => (
          <div key={h} className="flex flex-col sm:flex-row sm:items-center gap-2">
            <span className="text-xs font-mono text-[var(--ss-accent)] w-14 flex-shrink-0">{h}</span>
            <input
              value={map[h] ?? ""}
              onChange={(e) => setMap((m) => ({ ...m, [h]: e.target.value }))}
              className="flex-1 rounded-xl border border-[var(--ss-border)] bg-[color-mix(in_srgb,var(--ss-text)_4%,transparent)] px-3 py-2 text-sm"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

type Snippet = { id: string; label: string; body: string };

function SnippetLibraryPanel({ storageKey }: { storageKey: string }) {
  const { toast } = useToast();
  const [snips, setSnips] = useLocalStorageState<Snippet[]>(storageKey, []);

  async function copyBody(body: string) {
    try {
      await navigator.clipboard.writeText(body);
      toast("Copied to clipboard", "success");
    } catch {
      toast("Could not copy", "error");
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-between flex-wrap gap-2">
        <ExportToolbar filenameBase="snippets" getText={() => snips.map((s) => `## ${s.label}\n${s.body}`).join("\n\n")} getJson={() => snips} />
        <button type="button" onClick={() => setSnips((s) => [...s, { id: `s-${Date.now()}`, label: "New snippet", body: "" }])} className="ss-pill ss-pill-primary px-3 py-1.5 text-xs font-semibold text-white">
          Add snippet
        </button>
      </div>
      {snips.length === 0 ? <EmptyPanelHint title="No snippets" body="Store boilerplate you paste into tickets, email, or chat." /> : null}
      <ul className="space-y-3">
        {snips.map((s) => (
          <li key={s.id} className="rounded-2xl border border-[var(--ss-border)] p-3 space-y-2">
            <div className="flex gap-2 flex-wrap">
              <input
                value={s.label}
                onChange={(e) => setSnips((list) => list.map((x) => (x.id === s.id ? { ...x, label: e.target.value } : x)))}
                className="flex-1 min-w-[120px] rounded-lg border border-[var(--ss-border)] bg-transparent px-2 py-1 text-sm font-semibold"
              />
              <button type="button" onClick={() => void copyBody(s.body)} className="ss-pill px-3 py-1 text-xs font-semibold border border-[var(--ss-border)]">
                Copy body
              </button>
              <button type="button" onClick={() => setSnips((list) => list.filter((x) => x.id !== s.id))} className="text-xs text-red-400 px-2">
                Remove
              </button>
            </div>
            <TextArea value={s.body} onChange={(e) => setSnips((list) => list.map((x) => (x.id === s.id ? { ...x, body: e.target.value } : x)))} className="min-h-[80px]" />
          </li>
        ))}
      </ul>
    </div>
  );
}

function GeneratorPanel({ templateId }: { templateId: string }) {
  const tpl = getGeneratorTemplate(templateId);
  const [vals, setVals] = useState<Record<string, string>>({});
  const out = useMemo(() => (tpl ? tpl.build(vals) : ""), [tpl, vals]);

  if (!tpl) {
    return <EmptyPanelHint title="Template missing" body="This generator id is not registered in lib/day-to-day-tools/generators.ts." />;
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        {tpl.fields.map((f) => (
          <div key={f.id} className={f.multiline ? "sm:col-span-2" : ""}>
            <FieldLabel>{f.label}</FieldLabel>
            {f.multiline ? (
              <TextArea placeholder={f.placeholder} value={vals[f.id] ?? ""} onChange={(e) => setVals((v) => ({ ...v, [f.id]: e.target.value }))} />
            ) : (
              <TextInput placeholder={f.placeholder} value={vals[f.id] ?? ""} onChange={(e) => setVals((v) => ({ ...v, [f.id]: e.target.value }))} />
            )}
          </div>
        ))}
      </div>
      <ExportToolbar filenameBase={templateId} getText={() => out} />
      <pre className="rounded-2xl border border-[var(--ss-border)] bg-[color-mix(in_srgb,var(--ss-text)_4%,transparent)] p-4 text-sm whitespace-pre-wrap font-mono text-[var(--ss-text)]">{out || "Fill fields to generate output."}</pre>
    </div>
  );
}

type Row = { id: string; cells: Record<string, string> };

function RowLogPanel({
  storageKey,
  columns,
}: {
  storageKey: string;
  columns: { id: string; label: string }[];
}) {
  const [rows, setRows] = useLocalStorageState<Row[]>(storageKey, []);
  const emptyRow = useCallback(() => {
    const cells: Record<string, string> = {};
    for (const c of columns) cells[c.id] = "";
    return cells;
  }, [columns]);

  const csv = useMemo(
    () => ({
      headers: columns.map((c) => c.label),
      rows: rows.map((r) => columns.map((c) => r.cells[c.id] ?? "")),
    }),
    [rows, columns],
  );

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap justify-between gap-2">
        <ExportToolbar filenameBase={storageKey} getText={() => [columns.map((c) => c.label).join("\t"), ...rows.map((r) => columns.map((c) => r.cells[c.id] ?? "").join("\t"))].join("\n")} getJson={() => rows} csv={csv} />
        <button type="button" onClick={() => setRows((p) => [...p, { id: `row-${Date.now()}`, cells: emptyRow() }])} className="ss-pill ss-pill-primary px-3 py-1.5 text-xs font-semibold text-white">
          Add row
        </button>
      </div>
      {rows.length === 0 ? <EmptyPanelHint title="No rows" body="Add a row for each call, lead, or daily check." /> : null}
      <div className="space-y-2 max-h-[48vh] overflow-y-auto">
        {rows.map((r) => (
          <div key={r.id} className="rounded-xl border border-[var(--ss-border)] p-3 grid gap-2 sm:grid-cols-2">
            {columns.map((c) => (
              <div key={c.id}>
                <FieldLabel>{c.label}</FieldLabel>
                <TextInput
                  value={r.cells[c.id] ?? ""}
                  onChange={(e) =>
                    setRows((list) =>
                      list.map((row) => (row.id === r.id ? { ...row, cells: { ...row.cells, [c.id]: e.target.value } } : row)),
                    )
                  }
                />
              </div>
            ))}
            <div className="sm:col-span-2 flex justify-end">
              <button type="button" className="text-xs text-red-400" onClick={() => setRows((list) => list.filter((x) => x.id !== r.id))}>
                Remove row
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

type Session = { id: string; start: string; end?: string; label: string };

function TimeTrackerPanel({ storageKey }: { storageKey: string }) {
  const [sessions, setSessions] = useLocalStorageState<Session[]>(storageKey, []);
  const [label, setLabel] = useState("");
  const active = sessions.find((s) => !s.end);

  function start() {
    if (active) return;
    setSessions((s) => [...s, { id: `t-${Date.now()}`, start: new Date().toISOString(), label: label.trim() || "Session" }]);
    setLabel("");
  }

  function stop() {
    if (!active) return;
    const end = new Date().toISOString();
    setSessions((s) => s.map((x) => (x.id === active.id ? { ...x, end } : x)));
  }

  const text = sessions
    .map((s) => {
      const dur = s.end ? `${s.start} → ${s.end}` : `${s.start} … running`;
      return `${s.label}\t${dur}`;
    })
    .join("\n");

  return (
    <div className="space-y-4">
      <ExportToolbar filenameBase="time-log" getText={() => text} getJson={() => sessions} csv={{ headers: ["label", "start", "end"], rows: sessions.map((s) => [s.label, s.start, s.end ?? ""]) }} />
      <div className="flex flex-wrap gap-2 items-end">
        <div className="flex-1 min-w-[160px]">
          <FieldLabel>Session label</FieldLabel>
          <TextInput value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Deep work, client call…" disabled={!!active} />
        </div>
        {!active ? (
          <button type="button" onClick={start} className="ss-pill ss-pill-primary px-4 py-2 text-sm font-semibold text-white">
            Start
          </button>
        ) : (
          <button type="button" onClick={stop} className="ss-pill px-4 py-2 text-sm font-semibold border border-red-400/50 text-red-300">
            Stop
          </button>
        )}
      </div>
      {active ? <p className="text-sm text-[var(--ss-accent)]">Timer running for: {active.label}</p> : null}
      <ul className="text-sm space-y-1 text-[var(--ss-text-secondary)] font-mono">
        {sessions
          .slice()
          .reverse()
          .map((s) => (
            <li key={s.id}>
              {s.label} — {s.start}
              {s.end ? ` → ${s.end}` : " …"}
            </li>
          ))}
      </ul>
    </div>
  );
}

function randomPassword(length: number, symbols: boolean) {
  const lower = "abcdefghjkmnpqrstuvwxyz";
  const upper = "ABCDEFGHJKMNPQRSTUVWXYZ";
  const num = "23456789";
  const sym = "!@#$%^&*-_=+";
  const pool = lower + upper + num + (symbols ? sym : "");
  const buf = new Uint8Array(length);
  crypto.getRandomValues(buf);
  let out = "";
  for (let i = 0; i < length; i++) out += pool[buf[i]! % pool.length];
  return out;
}

function PasswordGenPanel() {
  const { toast } = useToast();
  const [len, setLen] = useState(20);
  const [sym, setSym] = useState(true);
  const [pw, setPw] = useState(() => randomPassword(20, true));

  async function copy() {
    try {
      await navigator.clipboard.writeText(pw);
      toast("Password copied", "success");
    } catch {
      toast("Copy failed", "error");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4 items-center">
        <div>
          <FieldLabel>Length ({len})</FieldLabel>
          <input type="range" min={12} max={64} value={len} onChange={(e) => setLen(Number(e.target.value))} className="w-40" />
        </div>
        <label className="flex items-center gap-2 text-sm text-[var(--ss-text)] cursor-pointer mt-5">
          <input type="checkbox" checked={sym} onChange={(e) => setSym(e.target.checked)} />
          Symbols
        </label>
        <button type="button" onClick={() => setPw(randomPassword(len, sym))} className="ss-pill ss-pill-primary px-4 py-2 text-sm font-semibold text-white mt-5">
          Generate
        </button>
        <button type="button" onClick={() => void copy()} className="ss-pill px-4 py-2 text-sm font-semibold border border-[var(--ss-border)] mt-5">
          Copy
        </button>
      </div>
      <code className="block break-all rounded-2xl border border-[var(--ss-border)] bg-[color-mix(in_srgb,var(--ss-text)_5%,transparent)] p-4 text-sm font-mono text-[var(--ss-text)]">{pw}</code>
      <p className="text-xs text-[var(--ss-text-secondary)]">Generated only in your browser. Prefer a vault for production secrets.</p>
    </div>
  );
}

type LicRow = { id: string; user: string; sku: string; renewal: string };

function LicenseTablePanel({ storageKey }: { storageKey: string }) {
  const [rows, setRows] = useLocalStorageState<LicRow[]>(storageKey, []);
  const csv = useMemo(
    () => ({
      headers: ["user", "sku", "renewal"],
      rows: rows.map((r) => [r.user, r.sku, r.renewal]),
    }),
    [rows],
  );

  return (
    <div className="space-y-3">
      <div className="flex justify-between flex-wrap gap-2">
        <ExportToolbar filenameBase="m365-licences" getText={() => ["user\tsku\trenewal", ...rows.map((r) => `${r.user}\t${r.sku}\t${r.renewal}`)].join("\n")} getJson={() => rows} csv={csv} />
        <button type="button" onClick={() => setRows((r) => [...r, { id: `l-${Date.now()}`, user: "", sku: "", renewal: "" }])} className="ss-pill ss-pill-primary px-3 py-1.5 text-xs font-semibold text-white">
          Add row
        </button>
      </div>
      {rows.length === 0 ? <EmptyPanelHint title="No assignments" body="Track SKU entitlements locally before syncing to a CMDB." /> : null}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-[var(--ss-text-secondary)] border-b border-[var(--ss-border)]">
              <th className="py-2 pr-2">User</th>
              <th className="py-2 pr-2">SKU</th>
              <th className="py-2">Renewal</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-[var(--ss-border)]">
                <td className="py-2 pr-2">
                  <input value={r.user} onChange={(e) => setRows((list) => list.map((x) => (x.id === r.id ? { ...x, user: e.target.value } : x)))} className="w-full bg-transparent border-0 text-[var(--ss-text)]" />
                </td>
                <td className="py-2 pr-2">
                  <input value={r.sku} onChange={(e) => setRows((list) => list.map((x) => (x.id === r.id ? { ...x, sku: e.target.value } : x)))} className="w-full bg-transparent border-0" />
                </td>
                <td className="py-2">
                  <input value={r.renewal} onChange={(e) => setRows((list) => list.map((x) => (x.id === r.id ? { ...x, renewal: e.target.value } : x)))} className="w-full bg-transparent border-0" />
                </td>
                <td>
                  <button type="button" className="text-xs text-red-400" onClick={() => setRows((list) => list.filter((x) => x.id !== r.id))}>
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ApiPlaceholderPanel({
  scenario,
}: {
  scenario: "dns" | "ip" | "mx" | "m365" | "phone" | "website" | "pension" | "broken-links" | "seo-meta" | "regex-safe";
}) {
  const routes: Record<string, string> = {
    dns: "`app/api/mxtoolbox/dns/route.ts` — add resolver + rate limits; keep provider keys in env.",
    ip: "`app/api/lookup/geo/route.ts` or dedicated `app/api/lookup/ip/route.ts` — server-only token.",
    mx: "`app/api/monitoring/run/mxtoolbox/route.ts` — align with existing MXToolbox patterns.",
    m365: "`app/tools/m365/*` — Graph delegated permissions; never ship client secrets.",
    phone: "`app/api/monitoring/run/*` — Twilio or PSTN bridge; keys server-side only.",
    website: "`app/api/monitoring/run/form/route.ts` — synthetic checks from server regions.",
    pension: "`app/api/tools/pension-calc/route.ts` — payroll rules vary; return computed bands from server.",
    "broken-links": "`app/api/tools/link-crawl/route.ts` — bounded BFS from server; respect robots + rate limits; never ship crawl tokens client-side.",
    "seo-meta": "`app/api/tools/seo-meta/route.ts` — server fetch + parse <head>; cache responses; rotate user-agent per policy.",
    "regex-safe": "`app/api/tools/regex-test/route.ts` — bounded engine with step limits / timeout; never run arbitrary regex in the browser (ReDoS).",
  };
  return (
    <div className="space-y-4 text-sm text-[var(--ss-text-secondary)] leading-relaxed">
      <EmptyPanelHint title="API integration placeholder" body="This panel is intentionally offline. Wire a Next.js Route Handler and call it from here with fetch — store API keys in environment variables only." />
      <div className="rounded-2xl border border-[var(--ss-border)] bg-[color-mix(in_srgb,var(--ss-text)_4%,transparent)] p-4 font-mono text-xs text-[var(--ss-text)] whitespace-pre-wrap">
        {`// Future integration (${scenario}):\n// ${routes[scenario] ?? "Add a server route under app/api/…"}\n// Client: call appFetch('/api/...') from lib/base-path.ts — never embed secrets.`}
      </div>
    </div>
  );
}

const PORT_ROWS: { port: number; proto: string; name: string }[] = [
  { port: 20, proto: "TCP", name: "FTP-DATA" },
  { port: 21, proto: "TCP", name: "FTP" },
  { port: 22, proto: "TCP", name: "SSH" },
  { port: 23, proto: "TCP", name: "Telnet" },
  { port: 25, proto: "TCP", name: "SMTP" },
  { port: 53, proto: "TCP/UDP", name: "DNS" },
  { port: 80, proto: "TCP", name: "HTTP" },
  { port: 110, proto: "TCP", name: "POP3" },
  { port: 143, proto: "TCP", name: "IMAP" },
  { port: 443, proto: "TCP", name: "HTTPS" },
  { port: 445, proto: "TCP", name: "SMB" },
  { port: 587, proto: "TCP", name: "SMTP submission" },
  { port: 993, proto: "TCP", name: "IMAPS" },
  { port: 995, proto: "TCP", name: "POP3S" },
  { port: 3389, proto: "TCP", name: "RDP" },
  { port: 8080, proto: "TCP", name: "HTTP-alt" },
];

function PortsReferencePanel() {
  return (
    <div className="overflow-x-auto rounded-2xl border border-[var(--ss-border)]">
      <table className="min-w-full text-sm">
        <thead className="bg-[color-mix(in_srgb,var(--ss-text)_6%,transparent)]">
          <tr className="text-left text-[var(--ss-text-secondary)]">
            <th className="px-3 py-2">Port</th>
            <th className="px-3 py-2">Proto</th>
            <th className="px-3 py-2">Service</th>
          </tr>
        </thead>
        <tbody>
          {PORT_ROWS.map((r) => (
            <tr key={`${r.port}-${r.proto}`} className="border-t border-[var(--ss-border)]">
              <td className="px-3 py-2 font-mono text-[var(--ss-accent)]">{r.port}</td>
              <td className="px-3 py-2">{r.proto}</td>
              <td className="px-3 py-2 text-[var(--ss-text)]">{r.name}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SavingsCalculatorPanel() {
  const [target, setTarget] = useState("5000");
  const [months, setMonths] = useState("12");
  const [saved, setSaved] = useState("500");
  const result = useMemo(() => {
    const T = parseFloat(target) || 0;
    const M = Math.max(1, parseInt(months, 10) || 1);
    const S = parseFloat(saved) || 0;
    const need = Math.max(0, T - S);
    const per = need / M;
    return { per, need, T, M, S };
  }, [target, months, saved]);

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <div>
        <FieldLabel>Target (£)</FieldLabel>
        <TextInput inputMode="decimal" value={target} onChange={(e) => setTarget(e.target.value)} />
      </div>
      <div>
        <FieldLabel>Months to goal</FieldLabel>
        <TextInput inputMode="numeric" value={months} onChange={(e) => setMonths(e.target.value)} />
      </div>
      <div>
        <FieldLabel>Already saved (£)</FieldLabel>
        <TextInput inputMode="decimal" value={saved} onChange={(e) => setSaved(e.target.value)} />
      </div>
      <div className="sm:col-span-3 rounded-2xl border border-[var(--ss-border)] p-4 text-sm">
        <p className="text-[var(--ss-text)]">
          You still need <strong>£{result.need.toFixed(2)}</strong> over <strong>{result.M}</strong> months → about{" "}
          <strong className="text-[var(--ss-accent)]">£{result.per.toFixed(2)}</strong> per month.
        </p>
      </div>
    </div>
  );
}

function EmergencyFundPanel({ storageKey }: { storageKey: string }) {
  const [data, setData] = useLocalStorageState(storageKey, { balance: "", monthlyExpense: "", targetMonths: "3" });
  const bal = parseFloat(data.balance) || 0;
  const exp = parseFloat(data.monthlyExpense) || 0;
  const mo = parseInt(data.targetMonths, 10) || 3;
  const target = exp * mo;
  const pct = target > 0 ? Math.min(100, Math.round((bal / target) * 100)) : 0;

  return (
    <div className="space-y-4">
      <ExportToolbar filenameBase="emergency-fund" getText={() => JSON.stringify(data, null, 2)} getJson={() => data} />
      <div className="grid sm:grid-cols-3 gap-3">
        <div>
          <FieldLabel>Current balance (£)</FieldLabel>
          <TextInput value={data.balance} onChange={(e) => setData((d) => ({ ...d, balance: e.target.value }))} />
        </div>
        <div>
          <FieldLabel>Monthly essentials (£)</FieldLabel>
          <TextInput value={data.monthlyExpense} onChange={(e) => setData((d) => ({ ...d, monthlyExpense: e.target.value }))} />
        </div>
        <div>
          <FieldLabel>Target months cover</FieldLabel>
          <TextInput value={data.targetMonths} onChange={(e) => setData((d) => ({ ...d, targetMonths: e.target.value }))} />
        </div>
      </div>
      <div className="rounded-2xl border border-[var(--ss-border)] p-4">
        <p className="text-sm text-[var(--ss-text)] mb-2">
          Target runway: <strong>£{target.toFixed(2)}</strong> ({mo}× monthly essentials)
        </p>
        <div className="h-2 rounded-full bg-[color-mix(in_srgb,var(--ss-text)_10%,transparent)] overflow-hidden">
          <div className="h-full bg-[var(--ss-accent)] motion-safe:transition-all motion-safe:duration-300" style={{ width: `${pct}%` }} />
        </div>
        <p className="mt-2 text-xs text-[var(--ss-text-secondary)]">{pct}% of target</p>
      </div>
    </div>
  );
}

type SubRow = { id: string; name: string; cost: string; renewal: string };

function SubscriptionTablePanel({ storageKey }: { storageKey: string }) {
  const [rows, setRows] = useLocalStorageState<SubRow[]>(storageKey, []);
  const csv = useMemo(
    () => ({ headers: ["service", "monthly", "renewal"], rows: rows.map((r) => [r.name, r.cost, r.renewal]) }),
    [rows],
  );
  const total = rows.reduce((a, r) => a + (parseFloat(r.cost) || 0), 0);

  return (
    <div className="space-y-3">
      <div className="flex justify-between flex-wrap gap-2">
        <ExportToolbar filenameBase="subscriptions" getText={() => rows.map((r) => `${r.name}\t${r.cost}\t${r.renewal}`).join("\n")} getJson={() => rows} csv={csv} />
        <button type="button" onClick={() => setRows((r) => [...r, { id: `sub-${Date.now()}`, name: "", cost: "", renewal: "" }])} className="ss-pill ss-pill-primary px-3 py-1.5 text-xs font-semibold text-white">
          Add
        </button>
      </div>
      <p className="text-sm text-[var(--ss-text-secondary)]">Monthly total (numeric costs): £{total.toFixed(2)}</p>
      <div className="space-y-2">
        {rows.map((r) => (
          <div key={r.id} className="grid sm:grid-cols-4 gap-2 items-end rounded-xl border border-[var(--ss-border)] p-2">
            <TextInput placeholder="Service" value={r.name} onChange={(e) => setRows((list) => list.map((x) => (x.id === r.id ? { ...x, name: e.target.value } : x)))} />
            <TextInput placeholder="£ / mo" value={r.cost} onChange={(e) => setRows((list) => list.map((x) => (x.id === r.id ? { ...x, cost: e.target.value } : x)))} />
            <TextInput placeholder="Renewal" value={r.renewal} onChange={(e) => setRows((list) => list.map((x) => (x.id === r.id ? { ...x, renewal: e.target.value } : x)))} />
            <button type="button" className="text-xs text-red-400 justify-self-end" onClick={() => setRows((list) => list.filter((x) => x.id !== r.id))}>
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

type Debt = { id: string; name: string; balance: string; apr: string; minimum: string };

function DebtPlannerPanel({ storageKey }: { storageKey: string }) {
  const [debts, setDebts] = useLocalStorageState<Debt[]>(storageKey, []);
  const totalBal = debts.reduce((a, d) => a + (parseFloat(d.balance) || 0), 0);
  const csv = useMemo(
    () => ({ headers: ["name", "balance", "apr", "minimum"], rows: debts.map((d) => [d.name, d.balance, d.apr, d.minimum]) }),
    [debts],
  );

  return (
    <div className="space-y-3">
      <div className="flex justify-between flex-wrap gap-2">
        <ExportToolbar filenameBase="debts" getText={() => debts.map((d) => `${d.name}\t${d.balance}\t${d.apr}%\t${d.minimum}`).join("\n")} getJson={() => debts} csv={csv} />
        <button type="button" onClick={() => setDebts((d) => [...d, { id: `d-${Date.now()}`, name: "", balance: "", apr: "", minimum: "" }])} className="ss-pill ss-pill-primary px-3 py-1.5 text-xs font-semibold text-white">
          Add debt
        </button>
      </div>
      <p className="text-sm">Total balance: £{totalBal.toFixed(2)}</p>
      <p className="text-xs text-[var(--ss-text-secondary)]">Avalanche: pay minimums everywhere, then throw extra cash at the highest APR first.</p>
      <div className="space-y-2 max-h-[40vh] overflow-y-auto">
        {debts.map((d) => (
          <div key={d.id} className="grid sm:grid-cols-5 gap-2 rounded-xl border border-[var(--ss-border)] p-2">
            <TextInput placeholder="Name" value={d.name} onChange={(e) => setDebts((list) => list.map((x) => (x.id === d.id ? { ...x, name: e.target.value } : x)))} />
            <TextInput placeholder="Balance" value={d.balance} onChange={(e) => setDebts((list) => list.map((x) => (x.id === d.id ? { ...x, balance: e.target.value } : x)))} />
            <TextInput placeholder="APR %" value={d.apr} onChange={(e) => setDebts((list) => list.map((x) => (x.id === d.id ? { ...x, apr: e.target.value } : x)))} />
            <TextInput placeholder="Min pay" value={d.minimum} onChange={(e) => setDebts((list) => list.map((x) => (x.id === d.id ? { ...x, minimum: e.target.value } : x)))} />
            <button type="button" className="text-xs text-red-400" onClick={() => setDebts((list) => list.filter((x) => x.id !== d.id))}>
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function BudgetSplitPanel() {
  const [income, setIncome] = useState("4000");
  const inc = parseFloat(income) || 0;
  const n = inc * 0.5;
  const w = inc * 0.3;
  const s = inc * 0.2;

  return (
    <div className="space-y-4">
      <div>
        <FieldLabel>Monthly after-tax income (£)</FieldLabel>
        <TextInput value={income} onChange={(e) => setIncome(e.target.value)} />
      </div>
      <div className="grid sm:grid-cols-3 gap-3 text-sm">
        <div className="rounded-2xl border border-[var(--ss-border)] p-4">
          <p className="text-[var(--ss-text-secondary)] text-xs uppercase">Needs 50%</p>
          <p className="text-2xl font-semibold text-[var(--ss-text)]">£{n.toFixed(0)}</p>
        </div>
        <div className="rounded-2xl border border-[var(--ss-border)] p-4">
          <p className="text-[var(--ss-text-secondary)] text-xs uppercase">Wants 30%</p>
          <p className="text-2xl font-semibold text-[var(--ss-text)]">£{w.toFixed(0)}</p>
        </div>
        <div className="rounded-2xl border border-[var(--ss-border)] p-4">
          <p className="text-[var(--ss-text-secondary)] text-xs uppercase">Savings 20%</p>
          <p className="text-2xl font-semibold text-[var(--ss-accent)]">£{s.toFixed(0)}</p>
        </div>
      </div>
      <p className="text-xs text-[var(--ss-text-secondary)]">Illustrative 50/30/20 split — adjust to your reality.</p>
    </div>
  );
}

function PayRisePanel() {
  const [oldS, setOldS] = useState("50000");
  const [newS, setNewS] = useState("55000");
  const oldN = parseFloat(oldS) || 0;
  const newN = parseFloat(newS) || 0;
  const pct = oldN > 0 ? ((newN - oldN) / oldN) * 100 : 0;
  const monthlyDelta = (newN - oldN) / 12;

  return (
    <div className="grid sm:grid-cols-2 gap-4">
      <div>
        <FieldLabel>Old annual salary (£)</FieldLabel>
        <TextInput value={oldS} onChange={(e) => setOldS(e.target.value)} />
      </div>
      <div>
        <FieldLabel>New annual salary (£)</FieldLabel>
        <TextInput value={newS} onChange={(e) => setNewS(e.target.value)} />
      </div>
      <div className="sm:col-span-2 rounded-2xl border border-[var(--ss-border)] p-4 text-sm space-y-1">
        <p>
          Change: <strong>{pct.toFixed(2)}%</strong>
        </p>
        <p>
          Extra per month (pre-tax, /12): <strong>£{monthlyDelta.toFixed(2)}</strong>
        </p>
      </div>
    </div>
  );
}

function JsonToolPanel() {
  const [raw, setRaw] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const { toast } = useToast();

  function format(pretty: boolean) {
    setErr(null);
    try {
      const o = JSON.parse(raw);
      setRaw(pretty ? JSON.stringify(o, null, 2) : JSON.stringify(o));
      toast(pretty ? "Formatted" : "Minified", "success");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Invalid JSON");
      toast("Invalid JSON", "error");
    }
  }

  return (
    <div className="space-y-3">
      <ExportToolbar
        filenameBase="json"
        getText={() => raw}
        getJson={() => {
          try {
            return JSON.parse(raw);
          } catch {
            return { parseError: true, raw };
          }
        }}
      />
      {err ? <p className="text-sm text-red-400">{err}</p> : null}
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => format(true)} className="ss-pill px-3 py-1.5 text-xs font-semibold border border-[var(--ss-border)]">
          Pretty
        </button>
        <button type="button" onClick={() => format(false)} className="ss-pill px-3 py-1.5 text-xs font-semibold border border-[var(--ss-border)]">
          Minify
        </button>
      </div>
      <TextArea value={raw} onChange={(e) => setRaw(e.target.value)} className="min-h-[200px] font-mono text-[13px]" spellCheck={false} />
    </div>
  );
}

function utf8ToBase64(str: string) {
  const bytes = new TextEncoder().encode(str);
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary);
}

function base64ToUtf8(b64: string) {
  const binary = atob(b64.trim());
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function Base64ToolPanel() {
  const [text, setText] = useState("");
  const [mode, setMode] = useState<"enc" | "dec">("enc");
  const { toast } = useToast();
  const out = useMemo(() => {
    try {
      if (mode === "enc") return utf8ToBase64(text);
      return base64ToUtf8(text);
    } catch {
      return "";
    }
  }, [text, mode]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(out);
      toast("Copied", "success");
    } catch {
      toast("Copy failed", "error");
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <button type="button" onClick={() => setMode("enc")} className={`ss-pill px-3 py-1.5 text-xs font-semibold ${mode === "enc" ? "ss-pill-primary text-white" : "border border-[var(--ss-border)]"}`}>
          Encode
        </button>
        <button type="button" onClick={() => setMode("dec")} className={`ss-pill px-3 py-1.5 text-xs font-semibold ${mode === "dec" ? "ss-pill-primary text-white" : "border border-[var(--ss-border)]"}`}>
          Decode
        </button>
        <button type="button" onClick={() => void copy()} className="ss-pill px-3 py-1.5 text-xs font-semibold border border-[var(--ss-border)]">
          Copy output
        </button>
      </div>
      <FieldLabel>Input</FieldLabel>
      <TextArea value={text} onChange={(e) => setText(e.target.value)} className="font-mono text-[13px]" />
      <FieldLabel>Output</FieldLabel>
      <pre className="rounded-xl border border-[var(--ss-border)] p-3 text-xs font-mono whitespace-pre-wrap break-all">{out || "—"}</pre>
    </div>
  );
}

function UrlToolPanel() {
  const [text, setText] = useState("");
  const [mode, setMode] = useState<"enc" | "dec">("enc");
  const out = useMemo(() => {
    try {
      return mode === "enc" ? encodeURIComponent(text) : decodeURIComponent(text);
    } catch {
      return "";
    }
  }, [text, mode]);

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <button type="button" onClick={() => setMode("enc")} className={`ss-pill px-3 py-1.5 text-xs font-semibold ${mode === "enc" ? "ss-pill-primary text-white" : "border border-[var(--ss-border)]"}`}>
          Encode
        </button>
        <button type="button" onClick={() => setMode("dec")} className={`ss-pill px-3 py-1.5 text-xs font-semibold ${mode === "dec" ? "ss-pill-primary text-white" : "border border-[var(--ss-border)]"}`}>
          Decode
        </button>
      </div>
      <TextArea value={text} onChange={(e) => setText(e.target.value)} className="font-mono text-[13px]" />
      <pre className="rounded-xl border border-[var(--ss-border)] p-3 text-xs font-mono break-all">{out || "—"}</pre>
    </div>
  );
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function SlugToolPanel() {
  const [text, setText] = useState("");
  const out = slugify(text);
  return (
    <div className="space-y-3">
      <TextInput value={text} onChange={(e) => setText(e.target.value)} placeholder="Page title…" />
      <code className="block rounded-xl border border-[var(--ss-border)] p-3 text-sm font-mono">{out || "—"}</code>
    </div>
  );
}

function CaseToolPanel() {
  const [text, setText] = useState("HelloWorld example_string");
  const splitWords = text.includes(" ") || text.includes("-") || text.includes("_");

  return (
    <div className="space-y-3">
      <TextArea value={text} onChange={(e) => setText(e.target.value)} />
      <div className="grid sm:grid-cols-2 gap-2 text-xs font-mono break-all">
        <div className="rounded-xl border border-[var(--ss-border)] p-2">lower: {text.toLowerCase()}</div>
        <div className="rounded-xl border border-[var(--ss-border)] p-2">UPPER: {text.toUpperCase()}</div>
        <div className="rounded-xl border border-[var(--ss-border)] p-2">Title: {text.replace(/\w\S*/g, (t) => t.charAt(0).toUpperCase() + t.slice(1).toLowerCase())}</div>
        <div className="rounded-xl border border-[var(--ss-border)] p-2">snake: {slugify(text).replace(/-/g, "_")}</div>
        <div className="sm:col-span-2 rounded-xl border border-[var(--ss-border)] p-2">
          camel:{" "}
          {splitWords
            ? text
                .split(/[\s\-_]+/)
                .filter(Boolean)
                .map((w, i) => (i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()))
                .join("")
            : text.charAt(0).toLowerCase() + text.slice(1)}
        </div>
      </div>
    </div>
  );
}

function CountToolPanel() {
  const [text, setText] = useState("");
  const chars = text.length;
  const charsNoWs = text.replace(/\s/g, "").length;
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;

  return (
    <div className="space-y-3">
      <TextArea value={text} onChange={(e) => setText(e.target.value)} />
      <div className="flex flex-wrap gap-4 text-sm">
        <span>
          Words: <strong>{words}</strong>
        </span>
        <span>
          Characters: <strong>{chars}</strong>
        </span>
        <span>
          Chars (no whitespace): <strong>{charsNoWs}</strong>
        </span>
      </div>
    </div>
  );
}

function simpleMdToHtml(md: string): string {
  const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return md
    .split("\n")
    .map((line) => {
      const e = esc(line);
      const bolded = e.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/`([^`]+)`/g, "<code>$1</code>");
      if (/^###\s+/.test(line)) return `<h3 class="text-base font-semibold mt-3 mb-1">${bolded.replace(/^###\s+/, "")}</h3>`;
      if (/^##\s+/.test(line)) return `<h2 class="text-lg font-semibold mt-3 mb-1">${bolded.replace(/^##\s+/, "")}</h2>`;
      if (/^#\s+/.test(line)) return `<h1 class="text-xl font-semibold mt-2 mb-1">${bolded.replace(/^#\s+/, "")}</h1>`;
      if (/^\s*-\s+/.test(line)) return `<li class="ml-4 list-disc text-sm mb-0.5">${bolded.replace(/^\s*-\s+/, "")}</li>`;
      if (line.trim() === "") return "<br/>";
      return `<p class="text-sm leading-relaxed mb-1">${bolded}</p>`;
    })
    .join("");
}

function MarkdownPreviewPanel() {
  const [md, setMd] = useState("# Preview\n\n**Bold** and `code`.\n\n- Item one");
  const html = useMemo(() => simpleMdToHtml(md), [md]);
  return (
    <div className="grid md:grid-cols-2 gap-3 min-h-[200px]">
      <TextArea value={md} onChange={(e) => setMd(e.target.value)} className="min-h-[220px] font-mono text-[13px]" />
      <div className="rounded-xl border border-[var(--ss-border)] p-3 overflow-auto max-h-[50vh] text-[var(--ss-text)]" dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}

function stripScripts(html: string) {
  return html.replace(/<\s*script[^>]*>[\s\S]*?<\s*\/\s*script\s*>/gi, "");
}

function HtmlPreviewPanel() {
  const [html, setHtml] = useState("<p>Hello <strong>world</strong></p>");
  const safe = stripScripts(html);
  return (
    <div className="space-y-3">
      <p className="text-xs text-[var(--ss-text-secondary)]">Scripts are stripped; preview uses a sandboxed iframe without script execution.</p>
      <TextArea value={html} onChange={(e) => setHtml(e.target.value)} className="font-mono text-[13px] min-h-[120px]" />
      <iframe title="HTML preview" sandbox="" className="w-full min-h-[160px] rounded-xl border border-[var(--ss-border)] bg-white text-black" srcDoc={safe} />
    </div>
  );
}

function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const h = hex.replace("#", "");
  if (h.length !== 6) return { h: 200, s: 70, l: 50 };
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let hh = 0;
  const l = (max + min) / 2;
  let s = 0;
  if (max !== min) {
    s = l > 0.5 ? (max - min) / (2 - max - min) : (max - min) / (max + min);
    switch (max) {
      case r:
        hh = (g - b) / (max - min) + (g < b ? 6 : 0);
        break;
      case g:
        hh = (b - r) / (max - min) + 2;
        break;
      default:
        hh = (r - g) / (max - min) + 4;
    }
    hh /= 6;
  }
  return { h: Math.round(hh * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function hslCss(h: number, s: number, l: number) {
  return `hsl(${h} ${s}% ${l}%)`;
}

function ColorPalettePanel() {
  const [hex, setHex] = useState("#38bdf8");
  const base = hexToHsl(hex);
  const swatches = [-30, -15, 0, 15, 30].map((d) => ({ h: (base.h + d + 360) % 360, label: `${d >= 0 ? "+" : ""}${d}°` }));

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <FieldLabel>Base</FieldLabel>
        <input type="color" value={hex} onChange={(e) => setHex(e.target.value)} className="h-10 w-14 rounded-lg border border-[var(--ss-border)] cursor-pointer bg-transparent" />
        <TextInput className="w-32 font-mono" value={hex} onChange={(e) => setHex(e.target.value)} />
      </div>
      <div className="flex flex-wrap gap-2">
        {swatches.map((s) => (
          <div key={s.label} className="text-center">
            <div className="h-16 w-20 rounded-xl border border-[var(--ss-border)] shadow-inner" style={{ background: hslCss(s.h, base.s, base.l) }} />
            <span className="text-[10px] text-[var(--ss-text-secondary)]">{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function UtmBuilderPanel() {
  const [base, setBase] = useState("https://example.com/page");
  const [utmSource, setUtmSource] = useState("newsletter");
  const [utmMedium, setUtmMedium] = useState("email");
  const [utmCampaign, setUtmCampaign] = useState("spring_launch");
  const [utmContent, setUtmContent] = useState("");
  const [utmTerm, setUtmTerm] = useState("");

  const out = useMemo(() => {
    try {
      const u = new URL(base.includes("://") ? base : `https://${base}`);
      u.searchParams.set("utm_source", utmSource);
      u.searchParams.set("utm_medium", utmMedium);
      u.searchParams.set("utm_campaign", utmCampaign);
      if (utmContent) u.searchParams.set("utm_content", utmContent);
      if (utmTerm) u.searchParams.set("utm_term", utmTerm);
      return u.toString();
    } catch {
      return "Invalid base URL";
    }
  }, [base, utmSource, utmMedium, utmCampaign, utmContent, utmTerm]);

  return (
    <div className="space-y-3">
      <ExportToolbar filenameBase="utm" getText={() => out} />
      <div className="grid sm:grid-cols-2 gap-3">
        <div className="sm:col-span-2">
          <FieldLabel>Landing URL</FieldLabel>
          <TextInput value={base} onChange={(e) => setBase(e.target.value)} />
        </div>
        <div>
          <FieldLabel>utm_source</FieldLabel>
          <TextInput value={utmSource} onChange={(e) => setUtmSource(e.target.value)} />
        </div>
        <div>
          <FieldLabel>utm_medium</FieldLabel>
          <TextInput value={utmMedium} onChange={(e) => setUtmMedium(e.target.value)} />
        </div>
        <div>
          <FieldLabel>utm_campaign</FieldLabel>
          <TextInput value={utmCampaign} onChange={(e) => setUtmCampaign(e.target.value)} />
        </div>
        <div>
          <FieldLabel>utm_content (optional)</FieldLabel>
          <TextInput value={utmContent} onChange={(e) => setUtmContent(e.target.value)} />
        </div>
        <div className="sm:col-span-2">
          <FieldLabel>utm_term (optional)</FieldLabel>
          <TextInput value={utmTerm} onChange={(e) => setUtmTerm(e.target.value)} />
        </div>
      </div>
      <pre className="rounded-xl border border-[var(--ss-border)] p-3 text-xs font-mono break-all whitespace-pre-wrap">{out}</pre>
    </div>
  );
}

function RegexPlaceholderPanelFixed() {
  return (
    <div className="space-y-4 text-sm text-[var(--ss-text-secondary)]">
      <EmptyPanelHint
        title="Regex tester (offline)"
        body="Running arbitrary regex in the browser can cause ReDoS on untrusted input. A future version should call a bounded server route with timeouts."
      />
      <pre className="rounded-2xl border border-[var(--ss-border)] bg-[color-mix(in_srgb,var(--ss-text)_4%,transparent)] p-4 font-mono text-xs whitespace-pre-wrap text-[var(--ss-text)]">
        {`// Suggested server integration:\n// app/api/tools/regex-test/route.ts\n// - Accept { pattern, flags, sample } JSON\n// - Use a safe engine with step limits / timeout\n// - Never log secrets; rate-limit per IP`}
      </pre>
    </div>
  );
}

export default function PanelRouter({ tool }: { tool: DayToDayToolDefinition }) {
  const p = tool.panel;
  switch (p.kind) {
    case "notes":
      return <NotesPanel storageKey={p.storageKey} placeholder={p.placeholder} />;
    case "checklist":
      return <ChecklistPanel storageKey={p.storageKey} seedItems={p.seedItems} />;
    case "staticChecklist":
      return <StaticChecklistPanel items={p.items} />;
    case "priorityMatrix":
      return <PriorityMatrixPanel storageKey={p.storageKey} />;
    case "reminders":
      return <RemindersPanel storageKey={p.storageKey} />;
    case "timer":
      return <TimerPanel variant={p.variant} />;
    case "hourlyPlanner":
      return <HourlyPlannerPanel storageKey={p.storageKey} />;
    case "snippetLibrary":
      return <SnippetLibraryPanel storageKey={p.storageKey} />;
    case "generator":
      return <GeneratorPanel templateId={p.templateId} />;
    case "rowLog":
      return <RowLogPanel storageKey={p.storageKey} columns={p.columns} />;
    case "timeTracker":
      return <TimeTrackerPanel storageKey={p.storageKey} />;
    case "passwordGen":
      return <PasswordGenPanel />;
    case "licenseTable":
      return <LicenseTablePanel storageKey={p.storageKey} />;
    case "apiPlaceholder":
      return <ApiPlaceholderPanel scenario={p.scenario} />;
    case "portsReference":
      return <PortsReferencePanel />;
    case "savingsCalculator":
      return <SavingsCalculatorPanel />;
    case "emergencyFund":
      return <EmergencyFundPanel storageKey={p.storageKey} />;
    case "subscriptionTable":
      return <SubscriptionTablePanel storageKey={p.storageKey} />;
    case "debtPlanner":
      return <DebtPlannerPanel storageKey={p.storageKey} />;
    case "budgetSplit":
      return <BudgetSplitPanel />;
    case "payRise":
      return <PayRisePanel />;
    case "jsonTool":
      return <JsonToolPanel />;
    case "base64Tool":
      return <Base64ToolPanel />;
    case "urlTool":
      return <UrlToolPanel />;
    case "slugTool":
      return <SlugToolPanel />;
    case "caseTool":
      return <CaseToolPanel />;
    case "countTool":
      return <CountToolPanel />;
    case "regexPlaceholder":
      return <RegexPlaceholderPanelFixed />;
    case "markdownPreview":
      return <MarkdownPreviewPanel />;
    case "htmlPreview":
      return <HtmlPreviewPanel />;
    case "colorPalette":
      return <ColorPalettePanel />;
    case "utmBuilder":
      return <UtmBuilderPanel />;
    case "dailyDashboard":
      return <DailyDashboardPanel storageKey={p.storageKey} />;
    case "richPlaceholder":
      return <RichPlaceholderPanel placeholderId={p.placeholderId} />;
    case "textDiff":
      return <TextDiffPanel />;
    case "csvCleaner":
      return <CsvCleanerPanel />;
    case "cssShadow":
      return <CssShadowPanel />;
    case "cssGradient":
      return <CssGradientPanel />;
    case "queryStringBuilder":
      return <QueryStringBuilderPanel />;
    case "urlParser":
      return <UrlParserPanel />;
    case "commandReference":
      return <CommandReferencePanel variant={p.variant} />;
    case "amountTracker":
      return <AmountTrackerPanel storageKey={p.storageKey} headline={p.headline} />;
    case "leadResponseCalculator":
      return <LeadResponseCalculatorPanel />;
    default:
      return <EmptyPanelHint title="Unsupported panel" body="This tool type is not wired in PanelRouter yet." />;
  }
}
