"use client";

import { useMemo, useState } from "react";
import { useToast } from "@/lib/toast-context";
import ExportToolbar from "../ExportToolbar";
import { useLocalStorageState } from "../useLocalStorageState";

export function AmountTrackerPanel({ storageKey, headline }: { storageKey: string; headline: string }) {
  const [data, setData] = useLocalStorageState(storageKey, { current: "", goal: "" });
  const cur = parseFloat(data.current) || 0;
  const goal = parseFloat(data.goal) || 0;
  const pct = goal > 0 ? Math.min(100, Math.round((cur / goal) * 100)) : 0;

  return (
    <div className="space-y-4">
      <ExportToolbar filenameBase={storageKey} getText={() => JSON.stringify(data, null, 2)} getJson={() => data} />
      <p className="text-sm font-semibold text-[var(--ss-text)]">{headline}</p>
      <div className="grid sm:grid-cols-2 gap-3">
        <label className="space-y-1 block text-xs font-semibold uppercase tracking-wide text-[var(--ss-text-secondary)]">
          Current (£)
          <input
            value={data.current}
            onChange={(e) => setData((d) => ({ ...d, current: e.target.value }))}
            className="w-full mt-1 rounded-xl border border-[var(--ss-border)] bg-[color-mix(in_srgb,var(--ss-text)_4%,transparent)] px-3 py-2 text-sm text-[var(--ss-text)]"
            inputMode="decimal"
          />
        </label>
        <label className="space-y-1 block text-xs font-semibold uppercase tracking-wide text-[var(--ss-text-secondary)]">
          Goal (£)
          <input
            value={data.goal}
            onChange={(e) => setData((d) => ({ ...d, goal: e.target.value }))}
            className="w-full mt-1 rounded-xl border border-[var(--ss-border)] bg-[color-mix(in_srgb,var(--ss-text)_4%,transparent)] px-3 py-2 text-sm text-[var(--ss-text)]"
            inputMode="decimal"
          />
        </label>
      </div>
      <div className="rounded-2xl border border-[var(--ss-border)] p-4">
        <div className="h-2 rounded-full bg-[color-mix(in_srgb,var(--ss-text)_10%,transparent)] overflow-hidden">
          <div className="h-full bg-[var(--ss-accent)] motion-safe:transition-all motion-safe:duration-300" style={{ width: `${pct}%` }} />
        </div>
        <p className="mt-2 text-xs text-[var(--ss-text-secondary)]">
          {pct}% of goal · Remaining: £{Math.max(0, goal - cur).toFixed(2)}
        </p>
      </div>
    </div>
  );
}

export function LeadResponseCalculatorPanel() {
  const [received, setReceived] = useState("");
  const [firstTouch, setFirstTouch] = useState("");
  const { toast } = useToast();

  const minutes = useMemo(() => {
    const a = Date.parse(received);
    const b = Date.parse(firstTouch);
    if (!Number.isFinite(a) || !Number.isFinite(b)) return null;
    const diff = (b - a) / 60000;
    if (!Number.isFinite(diff)) return null;
    return diff;
  }, [received, firstTouch]);

  const summary =
    minutes === null
      ? "Enter valid ISO-like datetimes (e.g. 2026-05-13T09:00) for both fields."
      : `Minutes between lead received and first touch: ${minutes.toFixed(1)}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(summary);
      toast("Copied summary", "success");
    } catch {
      toast("Copy failed", "error");
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-[var(--ss-text-secondary)]">Uses <code className="text-[var(--ss-accent)]">Date.parse</code> — use ISO 8601 strings for accuracy.</p>
      <div className="grid sm:grid-cols-2 gap-3">
        <label className="space-y-1 block text-xs font-semibold uppercase tracking-wide text-[var(--ss-text-secondary)]">
          Lead received (ISO)
          <input value={received} onChange={(e) => setReceived(e.target.value)} className="w-full mt-1 rounded-xl border border-[var(--ss-border)] bg-[color-mix(in_srgb,var(--ss-text)_4%,transparent)] px-3 py-2 text-sm font-mono" placeholder="2026-05-13T09:15:00" />
        </label>
        <label className="space-y-1 block text-xs font-semibold uppercase tracking-wide text-[var(--ss-text-secondary)]">
          First touch (ISO)
          <input value={firstTouch} onChange={(e) => setFirstTouch(e.target.value)} className="w-full mt-1 rounded-xl border border-[var(--ss-border)] bg-[color-mix(in_srgb,var(--ss-text)_4%,transparent)] px-3 py-2 text-sm font-mono" placeholder="2026-05-13T09:42:00" />
        </label>
      </div>
      <div className="rounded-xl border border-[var(--ss-border)] p-4 text-sm text-[var(--ss-text)]">{summary}</div>
      <div className="flex gap-2">
        <ExportToolbar filenameBase="lead-response-calc" getText={() => `${summary}\n\nreceived=${received}\nfirstTouch=${firstTouch}`} getJson={() => ({ received, firstTouch, minutes })} />
        <button type="button" onClick={() => void copy()} className="ss-pill px-3 py-1.5 text-xs font-semibold border border-[var(--ss-border)]">
          Copy summary
        </button>
      </div>
    </div>
  );
}

const WIN_CMD = String.raw`# Windows quick reference (non-exhaustive)
ipconfig /all
ipconfig /flushdns
ping -n 10 1.1.1.1
tracert example.com
pathping example.com
netsh wlan show profiles
netsh int ip reset   # disruptive — use with care
Get-NetAdapter | ft Name,Status,LinkSpeed
Get-Process | Sort CPU -desc | select -first 10
sfc /scannow
DISM /Online /Cleanup-Image /RestoreHealth
`;

const MAC_CMD = String.raw`# macOS quick reference
ifconfig
networksetup -listallhardwareports
scutil --dns | head -n 40
netstat -rn | head
sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder
log show --predicate 'subsystem == "com.apple.network"' --last 5m
system_profiler SPAirPortDataType
`;

const PW_CMD = String.raw`# Playwright CLI snippets
npx playwright install
npx playwright test
npx playwright test --headed
npx playwright test --grep @smoke
npx playwright show-report
PWDEBUG=1 npx playwright test
`;

export function CommandReferencePanel({ variant }: { variant: "windows" | "mac" | "playwright" }) {
  const text = variant === "windows" ? WIN_CMD : variant === "mac" ? MAC_CMD : PW_CMD;
  return (
    <div className="space-y-3">
      <ExportToolbar filenameBase={`commands-${variant}`} getText={() => text} />
      <pre className="rounded-2xl border border-[var(--ss-border)] bg-[color-mix(in_srgb,var(--ss-text)_4%,transparent)] p-4 text-xs font-mono whitespace-pre-wrap text-[var(--ss-text)] overflow-auto max-h-[55vh]">{text}</pre>
    </div>
  );
}

function simpleDiff(a: string, b: string): string {
  const la = a.split("\n");
  const lb = b.split("\n");
  const out: string[] = [];
  const max = Math.max(la.length, lb.length);
  for (let i = 0; i < max; i++) {
    const x = la[i];
    const y = lb[i];
    if (x === y) out.push(` ${x ?? ""}`);
    else {
      if (x !== undefined) out.push(`-${x}`);
      if (y !== undefined) out.push(`+${y}`);
    }
  }
  return out.join("\n");
}

export function TextDiffPanel() {
  const [left, setLeft] = useState("");
  const [right, setRight] = useState("");
  const diff = useMemo(() => simpleDiff(left, right), [left, right]);
  return (
    <div className="space-y-3">
      <ExportToolbar filenameBase="text-diff" getText={() => diff} getJson={() => ({ left, right, diff })} />
      <div className="grid md:grid-cols-2 gap-3">
        <textarea value={left} onChange={(e) => setLeft(e.target.value)} className="min-h-[200px] rounded-xl border border-[var(--ss-border)] bg-[color-mix(in_srgb,var(--ss-text)_4%,transparent)] p-3 text-sm font-mono" placeholder="Original…" />
        <textarea value={right} onChange={(e) => setRight(e.target.value)} className="min-h-[200px] rounded-xl border border-[var(--ss-border)] bg-[color-mix(in_srgb,var(--ss-text)_4%,transparent)] p-3 text-sm font-mono" placeholder="Changed…" />
      </div>
      <pre className="rounded-xl border border-[var(--ss-border)] p-3 text-xs font-mono whitespace-pre-wrap text-[var(--ss-text)] max-h-48 overflow-auto">{diff || "—"}</pre>
    </div>
  );
}

export function CsvCleanerPanel() {
  const [raw, setRaw] = useState("");
  const cleaned = useMemo(() => {
    return raw
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0)
      .join("\n");
  }, [raw]);
  return (
    <div className="space-y-3">
      <ExportToolbar filenameBase="csv-clean" getText={() => cleaned} getJson={() => ({ lines: cleaned.split("\n") })} />
      <textarea value={raw} onChange={(e) => setRaw(e.target.value)} className="min-h-[200px] w-full rounded-xl border border-[var(--ss-border)] bg-[color-mix(in_srgb,var(--ss-text)_4%,transparent)] p-3 text-sm font-mono" placeholder="Paste messy CSV rows…" />
      <pre className="rounded-xl border border-[var(--ss-border)] p-3 text-xs font-mono whitespace-pre-wrap text-[var(--ss-text)] max-h-48 overflow-auto">{cleaned || "—"}</pre>
    </div>
  );
}

export function CssShadowPanel() {
  const [x, setX] = useState("0");
  const [y, setY] = useState("8");
  const [blur, setBlur] = useState("24");
  const [spread, setSpread] = useState("0");
  const [color, setColor] = useState("rgba(0,0,0,0.35)");
  const css = `${x}px ${y}px ${blur}px ${spread}px ${color}`;
  return (
    <div className="space-y-4">
      <ExportToolbar filenameBase="box-shadow" getText={() => `box-shadow: ${css};`} />
      <div className="grid sm:grid-cols-5 gap-2 text-xs">
        <label className="space-y-1">
          X
          <input value={x} onChange={(e) => setX(e.target.value)} className="w-full rounded-lg border border-[var(--ss-border)] bg-transparent px-2 py-1" />
        </label>
        <label className="space-y-1">
          Y
          <input value={y} onChange={(e) => setY(e.target.value)} className="w-full rounded-lg border border-[var(--ss-border)] bg-transparent px-2 py-1" />
        </label>
        <label className="space-y-1">
          Blur
          <input value={blur} onChange={(e) => setBlur(e.target.value)} className="w-full rounded-lg border border-[var(--ss-border)] bg-transparent px-2 py-1" />
        </label>
        <label className="space-y-1">
          Spread
          <input value={spread} onChange={(e) => setSpread(e.target.value)} className="w-full rounded-lg border border-[var(--ss-border)] bg-transparent px-2 py-1" />
        </label>
        <label className="space-y-1">
          Colour
          <input value={color} onChange={(e) => setColor(e.target.value)} className="w-full rounded-lg border border-[var(--ss-border)] bg-transparent px-2 py-1 font-mono" />
        </label>
      </div>
      <div className="rounded-2xl border border-[var(--ss-border)] p-8 flex items-center justify-center bg-[color-mix(in_srgb,var(--ss-text)_6%,transparent)]">
        <div className="w-40 h-24 rounded-2xl bg-[color-mix(in_srgb,var(--ss-accent)_35%,transparent)] border border-[var(--ss-border)]" style={{ boxShadow: css }} />
      </div>
      <code className="block rounded-xl border border-[var(--ss-border)] p-3 text-xs font-mono text-[var(--ss-accent)]">box-shadow: {css};</code>
    </div>
  );
}

export function CssGradientPanel() {
  const [c1, setC1] = useState("#38bdf8");
  const [c2, setC2] = useState("#6366f1");
  const [angle, setAngle] = useState("135");
  const css = `linear-gradient(${angle}deg, ${c1}, ${c2})`;
  return (
    <div className="space-y-4">
      <ExportToolbar filenameBase="gradient" getText={() => `background-image: ${css};`} />
      <div className="flex flex-wrap gap-4 items-center">
        <label className="text-xs space-y-1">
          From
          <input type="color" value={c1} onChange={(e) => setC1(e.target.value)} className="block h-10 w-14 rounded-lg border border-[var(--ss-border)]" />
        </label>
        <label className="text-xs space-y-1">
          To
          <input type="color" value={c2} onChange={(e) => setC2(e.target.value)} className="block h-10 w-14 rounded-lg border border-[var(--ss-border)]" />
        </label>
        <label className="text-xs space-y-1">
          Angle (deg)
          <input value={angle} onChange={(e) => setAngle(e.target.value)} className="block w-20 rounded-lg border border-[var(--ss-border)] bg-transparent px-2 py-1" />
        </label>
      </div>
      <div className="h-28 rounded-2xl border border-[var(--ss-border)]" style={{ backgroundImage: css }} />
      <code className="block rounded-xl border border-[var(--ss-border)] p-3 text-xs font-mono text-[var(--ss-text)]">background-image: {css};</code>
    </div>
  );
}

type QRow = { id: string; key: string; value: string };

export function QueryStringBuilderPanel() {
  const [base, setBase] = useState("https://example.com/page");
  const [rows, setRows] = useState<QRow[]>([
    { id: "1", key: "utm_source", value: "newsletter" },
    { id: "2", key: "utm_medium", value: "email" },
  ]);
  const built = useMemo(() => {
    try {
      const u = new URL(base.includes("://") ? base : `https://${base}`);
      for (const r of rows) {
        const k = r.key.trim();
        if (!k) continue;
        u.searchParams.set(k, r.value);
      }
      return u.toString();
    } catch {
      return "Invalid base URL";
    }
  }, [base, rows]);

  return (
    <div className="space-y-3">
      <ExportToolbar filenameBase="querystring" getText={() => built} getJson={() => ({ base, rows, built })} />
      <input value={base} onChange={(e) => setBase(e.target.value)} className="w-full rounded-xl border border-[var(--ss-border)] bg-[color-mix(in_srgb,var(--ss-text)_4%,transparent)] px-3 py-2 text-sm" />
      <div className="space-y-2">
        {rows.map((r) => (
          <div key={r.id} className="flex gap-2 flex-wrap">
            <input value={r.key} onChange={(e) => setRows((rs) => rs.map((x) => (x.id === r.id ? { ...x, key: e.target.value } : x)))} className="flex-1 min-w-[120px] rounded-lg border border-[var(--ss-border)] bg-transparent px-2 py-1 text-sm" placeholder="key" />
            <input value={r.value} onChange={(e) => setRows((rs) => rs.map((x) => (x.id === r.id ? { ...x, value: e.target.value } : x)))} className="flex-1 min-w-[120px] rounded-lg border border-[var(--ss-border)] bg-transparent px-2 py-1 text-sm" placeholder="value" />
            <button type="button" className="text-xs text-red-400" onClick={() => setRows((rs) => rs.filter((x) => x.id !== r.id))}>
              ✕
            </button>
          </div>
        ))}
        <button type="button" className="ss-pill ss-pill-primary px-3 py-1.5 text-xs font-semibold text-white" onClick={() => setRows((rs) => [...rs, { id: `q-${Date.now()}`, key: "", value: "" }])}>
          Add parameter
        </button>
      </div>
      <pre className="rounded-xl border border-[var(--ss-border)] p-3 text-xs font-mono break-all whitespace-pre-wrap">{built}</pre>
    </div>
  );
}

export function UrlParserPanel() {
  const [raw, setRaw] = useState("https://user:pass@example.com:8080/path/to?a=1&b=two#frag");
  const parsed = useMemo(() => {
    try {
      const u = new URL(raw);
      const params: Record<string, string> = {};
      u.searchParams.forEach((v, k) => {
        params[k] = v;
      });
      return {
        href: u.href,
        protocol: u.protocol,
        username: u.username,
        password: u.password ? "***" : "",
        host: u.host,
        hostname: u.hostname,
        port: u.port,
        pathname: u.pathname,
        search: u.search,
        hash: u.hash,
        query: params,
      };
    } catch (e) {
      return { error: e instanceof Error ? e.message : "Invalid URL" };
    }
  }, [raw]);

  return (
    <div className="space-y-3">
      <ExportToolbar filenameBase="url-parse" getText={() => JSON.stringify(parsed, null, 2)} getJson={() => parsed} />
      <textarea value={raw} onChange={(e) => setRaw(e.target.value)} className="w-full min-h-[80px] rounded-xl border border-[var(--ss-border)] bg-[color-mix(in_srgb,var(--ss-text)_4%,transparent)] p-3 text-sm font-mono" />
      <pre className="rounded-xl border border-[var(--ss-border)] p-3 text-xs font-mono overflow-auto max-h-[40vh] text-[var(--ss-text)]">{JSON.stringify(parsed, null, 2)}</pre>
    </div>
  );
}
