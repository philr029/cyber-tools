"use client";

import { useCallback, useEffect, useRef, useState, type RefObject, type ReactNode } from "react";
import {
  BellRinging,
  Browser,
  ClipboardText,
  GlobeHemisphereWest,
  MagnifyingGlass,
  PhoneCall,
  Pulse,
  TreeStructure,
  X,
} from "@phosphor-icons/react";
import ToolPageLayout from "@/app/components/tools/ToolPageLayout";
import PremiumToolPreviewBanner from "@/app/components/pricing/PremiumToolPreviewBanner";
import MonitoringAdvancedSearch from "@/app/components/monitoring/MonitoringAdvancedSearch";
import MonitoringTestCard from "@/app/components/monitoring/MonitoringTestCard";
import type { HubSearchFilters, HubSortOption, HubTestType, HubSchedule, TestResult } from "@/lib/monitoring-hub/types";
import { buildPlaywrightMonitoringSnippet } from "@/lib/monitoring-hub/form-playwright-snippet";
import { withBasePath } from "@/lib/base-path";

interface SummaryCard {
  id: string;
  title: string;
  testType: HubTestType | "meta";
  status: TestResult["status"];
  lastChecked: string | null;
  responseTime: number | null;
  summary: string;
  errorSummary: string | null;
}

const CARD_ICONS: Record<string, ReactNode> = {
  phone: <PhoneCall className="h-5 w-5" weight="duotone" aria-hidden />,
  website: <Browser className="h-5 w-5" weight="duotone" aria-hidden />,
  form: <ClipboardText className="h-5 w-5" weight="duotone" aria-hidden />,
  domain: <TreeStructure className="h-5 w-5" weight="duotone" aria-hidden />,
  mxtoolbox: <GlobeHemisphereWest className="h-5 w-5" weight="duotone" aria-hidden />,
  advanced_search: <MagnifyingGlass className="h-5 w-5" weight="duotone" aria-hidden />,
  history: <Pulse className="h-5 w-5" weight="duotone" aria-hidden />,
  alerts: <BellRinging className="h-5 w-5" weight="duotone" aria-hidden />,
};

export default function AutomatedMonitoringHubClient() {
  const historyRef = useRef<HTMLDivElement | null>(null);
  const phoneRef = useRef<HTMLDivElement | null>(null);
  const websiteRef = useRef<HTMLDivElement | null>(null);
  const formRef = useRef<HTMLDivElement | null>(null);
  const domainRef = useRef<HTMLDivElement | null>(null);
  const mxRef = useRef<HTMLDivElement | null>(null);
  const searchRef = useRef<HTMLDivElement | null>(null);
  const alertsRef = useRef<HTMLDivElement | null>(null);

  const [apiOk, setApiOk] = useState<boolean | null>(null);
  const [staticHost, setStaticHost] = useState(false);
  const [cards, setCards] = useState<SummaryCard[]>([]);
  const [globalSchedule, setGlobalSchedule] = useState<HubSchedule>("manual");
  const [history, setHistory] = useState<TestResult[]>([]);
  const [detail, setDetail] = useState<TestResult | null>(null);

  const [cardLoading, setCardLoading] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [advBusy, setAdvBusy] = useState(false);

  const [phoneName, setPhoneName] = useState("Primary line check");
  const [phoneE164, setPhoneE164] = useState("+15551234567");
  const [phoneExpected, setPhoneExpected] = useState("connected");

  const [webUrl, setWebUrl] = useState("https://example.com");

  const [formUrl, setFormUrl] = useState("https://example.com/contact");
  const [formEnabled, setFormEnabled] = useState(false);
  const [formInterval, setFormInterval] = useState(300);
  const [formPrivate, setFormPrivate] = useState(false);

  const [dom, setDom] = useState("example.com");
  const [mxCommand, setMxCommand] = useState<"dns" | "mx" | "spf" | "dmarc" | "blacklist" | "txt">("dns");

  const [schedChoice, setSchedChoice] = useState<HubSchedule>("manual");
  const [alertSlack, setAlertSlack] = useState("");
  const [alertDiscord, setAlertDiscord] = useState("");
  const [alertTeams, setAlertTeams] = useState("");
  const [alertEmail, setAlertEmail] = useState("");
  const [alertSms, setAlertSms] = useState("");
  const [dashOnly, setDashOnly] = useState(true);

  const refreshSummary = useCallback(async () => {
    try {
      const res = await fetch(withBasePath("/api/monitoring/summary"));
      if (!res.ok) throw new Error("summary");
      const j = (await res.json()) as {
        data: { cards: SummaryCard[]; globalSchedule: HubSchedule };
      };
      setCards(j.data.cards);
      setGlobalSchedule(j.data.globalSchedule);
      setSchedChoice(j.data.globalSchedule);
    } catch {
      /* ignore */
    }
  }, [setSchedChoice]);

  const refreshHistory = useCallback(async () => {
    try {
      const res = await fetch(withBasePath("/api/monitoring/results?limit=60&sort=newest"));
      if (!res.ok) throw new Error("results");
      const j = (await res.json()) as { data: TestResult[] };
      setHistory(j.data);
    } catch {
      setHistory([]);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const host = window.location.hostname;
    queueMicrotask(() => {
      setStaticHost(host.endsWith(".github.io") || host.endsWith(".gitlab.io"));
    });

    void (async () => {
      try {
        const h = await fetch(withBasePath("/api/monitoring/health"));
        setApiOk(h.ok);
      } catch {
        setApiOk(false);
      }
      await refreshSummary();
      await refreshHistory();
    })();
  }, [refreshHistory, refreshSummary]);

  async function persistSchedule() {
    setBusy(true);
    try {
      const res = await fetch(withBasePath("/api/monitoring/schedule"), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ schedule: schedChoice }),
      });
      if (!res.ok) throw new Error();
      await refreshSummary();
    } finally {
      setBusy(false);
    }
  }

  async function persistAlerts() {
    setBusy(true);
    try {
      const body = {
        channels: {
          email: { enabled: Boolean(alertEmail.trim()), destination: alertEmail.trim() || undefined },
          teams: { enabled: Boolean(alertTeams.trim()), destination: alertTeams.trim() || undefined },
          slack: { enabled: Boolean(alertSlack.trim()), destination: alertSlack.trim() || undefined },
          discord: { enabled: Boolean(alertDiscord.trim()), destination: alertDiscord.trim() || undefined },
          sms: { enabled: Boolean(alertSms.trim()), destination: alertSms.trim() || undefined },
          dashboard: { enabled: dashOnly },
        },
        lastMockDispatchAt: null as string | null,
      };
      const cur = await fetch(withBasePath("/api/monitoring/alerts"));
      if (cur.ok) {
        const j = (await cur.json()) as { data: { lastMockDispatchAt: string | null } };
        body.lastMockDispatchAt = j.data.lastMockDispatchAt;
      }
      const res = await fetch(withBasePath("/api/monitoring/alerts"), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error();
      await refreshSummary();
    } finally {
      setBusy(false);
    }
  }

  async function mockAlertDispatch() {
    setBusy(true);
    try {
      await fetch(withBasePath("/api/monitoring/alerts"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "mock_dispatch" }),
      });
      await refreshSummary();
    } finally {
      setBusy(false);
    }
  }

  async function runPhone() {
    setCardLoading("phone");
    try {
      const res = await fetch(withBasePath("/api/monitoring/run/phone"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          testName: phoneName,
          phone: phoneE164,
          expectedResult: phoneExpected,
        }),
      });
      await res.json().catch(() => null);
      await refreshSummary();
      await refreshHistory();
    } finally {
      setCardLoading(null);
    }
  }

  async function runWebsite() {
    setCardLoading("website");
    try {
      await fetch(withBasePath("/api/monitoring/run/website"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: webUrl }),
      });
      await refreshSummary();
      await refreshHistory();
    } finally {
      setCardLoading(null);
    }
  }

  async function runForm() {
    setCardLoading("form");
    try {
      await fetch(withBasePath("/api/monitoring/run/form"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formUrl,
          method: "POST",
          contentType: "application/x-www-form-urlencoded",
          enabled: formEnabled,
          minIntervalSeconds: formInterval,
          allowPrivateTargets: formPrivate,
        }),
      });
      await refreshSummary();
      await refreshHistory();
    } finally {
      setCardLoading(null);
    }
  }

  async function runDomain() {
    setCardLoading("domain");
    try {
      await fetch(withBasePath("/api/monitoring/run/domain"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: dom }),
      });
      await refreshSummary();
      await refreshHistory();
    } finally {
      setCardLoading(null);
    }
  }

  async function runMxTool() {
    setCardLoading("mxtoolbox");
    try {
      await fetch(withBasePath("/api/monitoring/run/mxtoolbox"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command: mxCommand, argument: dom }),
      });
      await refreshSummary();
      await refreshHistory();
    } finally {
      setCardLoading(null);
    }
  }

  function scrollTo(ref: RefObject<HTMLDivElement | null>) {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function handleCardRun(id: string) {
    if (id === "phone") {
      scrollTo(phoneRef);
      await runPhone();
    } else if (id === "website") {
      scrollTo(websiteRef);
      await runWebsite();
    } else if (id === "form") {
      scrollTo(formRef);
      await runForm();
    } else if (id === "domain") {
      scrollTo(domainRef);
      await runDomain();
    } else if (id === "mxtoolbox") {
      scrollTo(mxRef);
      await runMxTool();
    } else if (id === "advanced_search") {
      scrollTo(searchRef);
    } else if (id === "history") {
      scrollTo(historyRef);
      await refreshHistory();
    } else if (id === "alerts") {
      scrollTo(alertsRef);
    }
  }

  async function advSearch(filters: HubSearchFilters, sort: HubSortOption) {
    setAdvBusy(true);
    try {
      const res = await fetch(withBasePath("/api/monitoring/search"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...filters, sort, limit: 80 }),
      });
      const j = (await res.json()) as { data: { results: TestResult[] } };
      await refreshSummary();
      await refreshHistory();
      return j.data.results;
    } catch {
      return [];
    } finally {
      setAdvBusy(false);
    }
  }

  const showApiWarning = staticHost || apiOk === false;

  return (
    <ToolPageLayout
      title="Automated Monitoring Hub"
      description="Server-side probes for phone paths, uptime, forms, DNS, and MXToolbox — secrets stay on the server (Vercel / Node). This module ships with in-memory demo storage and mock telephony until you connect Twilio and a database."
      isMock={null}
    >
      <PremiumToolPreviewBanner toolLabel="Automated monitoring hub" />

      {showApiWarning ? (
        <div className="mb-6 rounded-2xl border border-amber-400/35 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
          <p className="font-semibold">Deployment notice</p>
          <p className="mt-1 text-[13px] leading-6 text-amber-50/90">
            {staticHost ? (
              <>
                Static hosts such as GitHub Pages cannot execute Next.js <code className="font-mono text-xs">app/api</code> routes.
                Live API checks require the{" "}
                <strong className="font-medium">Vercel deployment</strong> (or any Node-capable Next host).
              </>
            ) : (
              <>Live API routes are unreachable from this browser session — confirm you are on a Vercel / Node deployment.</>
            )}
          </p>
        </div>
      ) : null}

      <div className="mb-8 grid gap-4 rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-5 sm:grid-cols-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">Global schedule</p>
          <p className="mt-1 text-lg font-semibold text-[var(--foreground)]">{globalSchedule}</p>
          <p className="mt-1 text-[11px] text-[var(--muted)] leading-5">
            UI placeholder only — wire Vercel Cron, GitHub Actions, Supabase schedules, n8n, Zapier, Make, or Power Automate to POST the run routes.
          </p>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">Stored rows</p>
          <p className="mt-1 text-lg font-semibold text-[var(--foreground)]">{history.length}</p>
          <p className="mt-1 text-[11px] text-[var(--muted)] leading-5">In-memory cap (500). Swap `lib/monitoring-hub/store.ts` for durable storage.</p>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">API surface</p>
          <p className="mt-1 text-lg font-semibold text-[var(--foreground)]">{apiOk ? "Online" : "Offline"}</p>
          <p className="mt-1 text-[11px] text-[var(--muted)] leading-5">
            MXToolbox key: <span className="font-mono text-cyan-200/90">MXTOOLBOX_API_KEY</span> (server only).
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((c) => (
          <MonitoringTestCard
            key={c.id}
            title={c.title}
            status={c.status}
            lastChecked={c.lastChecked}
            responseTime={c.responseTime}
            insight={c.summary}
            errorSummary={c.errorSummary}
            icon={CARD_ICONS[c.id]}
            runLoading={cardLoading === c.id}
            onRunTest={() => void handleCardRun(c.id)}
            onViewHistory={() => {
              if (c.id === "alerts") scrollTo(alertsRef);
              else if (c.id === "history") scrollTo(historyRef);
              else {
                void refreshHistory();
                scrollTo(historyRef);
              }
            }}
          />
        ))}
      </div>

      <div ref={alertsRef} className="mt-10 grid gap-6 lg:grid-cols-2">
        <section className="rounded-[28px] border border-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold text-[var(--foreground)]">Automation scheduling</h2>
          <p className="mt-2 text-[12px] leading-6 text-[var(--muted)]">
            Select a cadence for operators — execution still requires an external scheduler hitting the monitoring API routes.
          </p>
          <div className="mt-4 flex flex-col gap-3">
            <select
              value={schedChoice}
              onChange={(e) => setSchedChoice(e.target.value as HubSchedule)}
              className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:ring-2 focus:ring-cyan-500/30"
            >
              <option value="manual">Manual run</option>
              <option value="15m">Every 15 minutes</option>
              <option value="hourly">Hourly</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
            </select>
            <button
              type="button"
              disabled={busy || showApiWarning}
              onClick={() => void persistSchedule()}
              className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
            >
              Save schedule preference
            </button>
          </div>
        </section>

        <section className="rounded-[28px] border border-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold text-[var(--foreground)]">Alerts &amp; reports</h2>
          <p className="mt-2 text-[12px] leading-6 text-[var(--muted)]">
            Mock destinations only — connect SendGrid, Slack webhooks, Microsoft Teams, Twilio SMS, etc. in a future iteration.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <InputField label="Email" value={alertEmail} onChange={setAlertEmail} placeholder="alerts@company.com" />
            <InputField label="Teams webhook" value={alertTeams} onChange={setAlertTeams} placeholder="https://…" />
            <InputField label="Slack webhook" value={alertSlack} onChange={setAlertSlack} placeholder="https://hooks.slack.com/…" />
            <InputField label="Discord webhook" value={alertDiscord} onChange={setAlertDiscord} placeholder="https://discord.com/api/webhooks/…" />
            <InputField label="SMS (Twilio-style)" value={alertSms} onChange={setAlertSms} placeholder="+1555…" />
            <label className="flex items-center gap-2 text-[12px] text-[var(--foreground)]">
              <input type="checkbox" checked={dashOnly} onChange={(e) => setDashOnly(e.target.checked)} />
              Dashboard-only feed
            </label>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy || showApiWarning}
              onClick={() => void persistAlerts()}
              className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-semibold text-[var(--foreground)] disabled:opacity-40"
            >
              Save alert channels
            </button>
            <button
              type="button"
              disabled={busy || showApiWarning}
              onClick={() => void mockAlertDispatch()}
              className="rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
            >
              Simulate alert dispatch
            </button>
          </div>
        </section>
      </div>

      <div ref={phoneRef} className="mt-10 rounded-[28px] border border-[var(--border)] bg-[var(--card)] p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-[var(--foreground)]">Phone test</h2>
        <p className="mt-2 text-[12px] leading-6 text-[var(--muted)]">
          Placeholder telephony — swap for Twilio <code className="text-[11px]">calls.create</code> with server-only{" "}
          <code className="text-[11px]">TWILIO_*</code> credentials (see <code className="text-[11px]">app/api/tools/phone-test/route.ts</code>
          ).
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <InputField label="Test name" value={phoneName} onChange={setPhoneName} />
          <InputField label="Phone (E.164)" value={phoneE164} onChange={setPhoneE164} placeholder="+15551234567" />
          <InputField label="Expected result (reference)" value={phoneExpected} onChange={setPhoneExpected} />
        </div>
        <button
          type="button"
          disabled={showApiWarning}
          onClick={() => void runPhone()}
          className="mt-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-40"
        >
          Run phone test
        </button>
      </div>

      <div ref={websiteRef} className="mt-6 rounded-[28px] border border-[var(--border)] bg-[var(--card)] p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-[var(--foreground)]">Website uptime</h2>
        <p className="mt-2 text-[12px] text-[var(--muted)] leading-6">
          Server-side GET with redirect follow, latency measurement, and TLS inspection for HTTPS hosts.
        </p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <input
            value={webUrl}
            onChange={(e) => setWebUrl(e.target.value)}
            className="flex-1 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:ring-2 focus:ring-cyan-500/30"
          />
          <button
            type="button"
            disabled={showApiWarning}
            onClick={() => void runWebsite()}
            className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-40"
          >
            Run uptime test
          </button>
        </div>
      </div>

      <div ref={formRef} className="mt-6 rounded-[28px] border border-rose-400/25 bg-[var(--card)] p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-[var(--foreground)]">Form submission test</h2>
        <div className="mt-2 rounded-xl border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-[12px] leading-6 text-rose-100">
          <strong className="font-semibold">Do not spam production forms.</strong> Point tests at a dedicated staging endpoint, keep submissions disabled until you are ready, and respect the per-URL cooldown. Dummy payload: Name{" "}
          <code className="font-mono text-[11px]">Automated Test</code>, Email <code className="font-mono text-[11px]">test@example.com</code>, Phone{" "}
          <code className="font-mono text-[11px]">01234567890</code>, Message{" "}
          <code className="font-mono text-[11px]">This is an automated test submission.</code>.
        </div>
        <p className="mt-3 text-[11px] text-[var(--muted)] leading-5 font-mono whitespace-pre-wrap">
          {buildPlaywrightMonitoringSnippet("/api/monitoring/run/form")}
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <InputField label="Form POST URL" value={formUrl} onChange={setFormUrl} />
          <label className="text-[11px] font-medium text-[var(--muted)]">
            <span className="mb-1 block">Cooldown (seconds)</span>
            <input
              type="number"
              min={30}
              max={86400}
              value={formInterval}
              onChange={(e) => setFormInterval(Number(e.target.value))}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)]"
            />
          </label>
        </div>
        <label className="mt-3 flex items-center gap-2 text-[12px] text-[var(--foreground)]">
          <input type="checkbox" checked={formEnabled} onChange={(e) => setFormEnabled(e.target.checked)} />
          Enable live POST (staging only)
        </label>
        <label className="mt-2 flex items-center gap-2 text-[12px] text-[var(--foreground)]">
          <input type="checkbox" checked={formPrivate} onChange={(e) => setFormPrivate(e.target.checked)} />
          Allow private targets (requires <code className="mx-1 font-mono text-[10px]">MONITORING_ALLOW_PRIVATE_TARGETS=true</code> in non-production)
        </label>
        <button
          type="button"
          disabled={showApiWarning || !formEnabled}
          onClick={() => void runForm()}
          className="mt-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-40"
        >
          Run form test
        </button>
      </div>

      <div ref={domainRef} className="mt-6 rounded-[28px] border border-[var(--border)] bg-[var(--card)] p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-[var(--foreground)]">Domain, DNS &amp; mail health</h2>
        <p className="mt-2 text-[12px] text-[var(--muted)] leading-6">
          Node DNS resolver for A/MX/TXT/NS + DMARC host plus optional MXToolbox blacklist when <span className="font-mono">MXTOOLBOX_API_KEY</span> is set.
          DKIM requires a selector — shown as a placeholder in raw JSON until you supply <code className="font-mono text-[11px]">domain:selector</code> to MXToolbox.
        </p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <input
            value={dom}
            onChange={(e) => setDom(e.target.value)}
            className="flex-1 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:ring-2 focus:ring-cyan-500/30"
          />
          <button
            type="button"
            disabled={showApiWarning}
            onClick={() => void runDomain()}
            className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-40"
          >
            Run domain bundle
          </button>
        </div>
      </div>

      <div ref={mxRef} className="mt-6 rounded-[28px] border border-[var(--border)] bg-[var(--card)] p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-[var(--foreground)]">MXToolbox proxy</h2>
        <p className="mt-2 text-[12px] text-[var(--muted)] leading-6">
          Server routes: <code className="font-mono text-[11px]">/api/mxtoolbox/mx</code>, <code className="font-mono text-[11px]">/dns</code>,{" "}
          <code className="font-mono text-[11px]">/blacklist</code>, <code className="font-mono text-[11px]">/spf</code>,{" "}
          <code className="font-mono text-[11px]">/dmarc</code> — each stores a row when you run the bundled action below.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <select
            value={mxCommand}
            onChange={(e) => setMxCommand(e.target.value as typeof mxCommand)}
            className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)]"
          >
            <option value="dns">dns</option>
            <option value="mx">mx</option>
            <option value="spf">spf</option>
            <option value="dmarc">dmarc</option>
            <option value="blacklist">blacklist</option>
            <option value="txt">txt</option>
          </select>
          <button
            type="button"
            disabled={showApiWarning}
            onClick={() => void runMxTool()}
            className="rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-40"
          >
            Run MXToolbox lookup
          </button>
          <a
            href={`/api/mxtoolbox/${mxCommand}?${mxCommand === "blacklist" ? "target" : "domain"}=${encodeURIComponent(dom)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center rounded-xl border border-[var(--border)] px-4 py-2 text-xs font-semibold text-cyan-200 hover:border-cyan-400/40"
          >
            Open raw JSON route
          </a>
        </div>
      </div>

      <div ref={searchRef} className="mt-10">
        <MonitoringAdvancedSearch
          onSearch={advSearch}
          loading={advBusy}
          onSelectRow={(r) => setDetail(r)}
        />
      </div>

      <div ref={historyRef} className="mt-10 rounded-[28px] border border-[var(--border)] bg-[var(--card)] p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">Test history</h2>
          <button
            type="button"
            disabled={showApiWarning}
            onClick={() => void refreshHistory()}
            className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-xs font-semibold text-[var(--foreground)] disabled:opacity-40"
          >
            Refresh
          </button>
        </div>
        <div className="mt-4 overflow-x-auto rounded-2xl border border-[var(--border)]">
          <table className="min-w-full text-left text-xs">
            <thead className="bg-[var(--surface)] text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">
              <tr>
                <th className="px-3 py-2">Type</th>
                <th className="px-3 py-2">Target</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Checked</th>
                <th className="px-3 py-2">RT</th>
                <th className="px-3 py-2">Summary</th>
                <th className="px-3 py-2"> </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {history.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-3 py-8 text-center text-[var(--muted)]">
                    No history yet — run any test above.
                  </td>
                </tr>
              ) : (
                history.map((r) => (
                  <tr key={r.id} className="text-[var(--foreground)]/90">
                    <td className="px-3 py-2 font-mono text-[10px] text-cyan-200/90">{r.testType}</td>
                    <td className="max-w-[220px] truncate px-3 py-2">{r.target}</td>
                    <td className="px-3 py-2">{r.status}</td>
                    <td className="whitespace-nowrap px-3 py-2 text-[var(--muted)]">{new Date(r.checkedAt).toLocaleString()}</td>
                    <td className="px-3 py-2">{r.responseTime ?? "—"}</td>
                    <td className="max-w-xs truncate px-3 py-2 text-[var(--muted)]">{r.summary}</td>
                    <td className="px-3 py-2">
                      <button
                        type="button"
                        onClick={() => setDetail(r)}
                        className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2 py-1 text-[10px] font-semibold text-cyan-200 hover:border-cyan-400/50"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {detail ? (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 p-4 sm:items-center" role="dialog" aria-modal>
          <div className="max-h-[85vh] w-full max-w-3xl overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
              <p className="text-sm font-semibold text-[var(--foreground)]">Result details</p>
              <button
                type="button"
                onClick={() => setDetail(null)}
                className="rounded-lg p-1 text-[var(--muted)] hover:bg-white/5 hover:text-[var(--foreground)]"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <pre className="max-h-[70vh] overflow-auto p-4 text-[11px] leading-relaxed text-[var(--foreground)]/90">
              {JSON.stringify(detail, null, 2)}
            </pre>
          </div>
        </div>
      ) : null}
    </ToolPageLayout>
  );
}

function InputField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block text-[11px] font-medium text-[var(--muted)]">
      <span className="mb-1 block">{label}</span>
      <input
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:ring-2 focus:ring-cyan-500/30"
      />
    </label>
  );
}
