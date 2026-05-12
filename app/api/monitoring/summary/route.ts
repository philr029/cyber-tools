import { getAlertSettings, getGlobalSchedule, listResults } from "@/lib/monitoring-hub/store";
import type { HubStatus, HubTestType } from "@/lib/monitoring-hub/types";

export const runtime = "nodejs";

interface CardPayload {
  id: string;
  title: string;
  testType: HubTestType | "meta";
  status: HubStatus;
  lastChecked: string | null;
  responseTime: number | null;
  summary: string;
  errorSummary: string | null;
}

function fromLatest(testType: HubTestType, emptyLabel: string): CardPayload {
  const r = listResults({ testType }, "newest")[0];
  if (!r) {
    return {
      id: testType,
      title: "",
      testType,
      status: "not_tested",
      lastChecked: null,
      responseTime: null,
      summary: emptyLabel,
      errorSummary: null,
    };
  }
  return {
    id: testType,
    title: "",
    testType,
    status: r.status,
    lastChecked: r.checkedAt,
    responseTime: r.responseTime,
    summary: r.summary,
    errorSummary: r.errorMessage,
  };
}

export async function GET() {
  const rows = listResults({}, "newest");
  const alerts = getAlertSettings();
  const activeChannels = Object.entries(alerts.channels).filter(([, c]) => c?.enabled);
  const alertSummary =
    activeChannels.length === 0
      ? "Dashboard-only alerts (no external channels enabled)."
      : `Enabled channels: ${activeChannels.map(([k]) => k).join(", ")}.`;

  const cards: CardPayload[] = [
    {
      ...fromLatest("phone", "No phone probes yet — run a test from the Phone panel."),
      id: "phone",
      title: "Phone Tests",
      testType: "phone",
    },
    {
      ...fromLatest("website", "No uptime probes yet — run a server-side check."),
      id: "website",
      title: "Website Uptime Tests",
      testType: "website",
    },
    {
      ...fromLatest("form", "No form submissions recorded — configure a staging endpoint first."),
      id: "form",
      title: "Form Submission Tests",
      testType: "form",
    },
    {
      ...fromLatest("domain", "No domain health bundles yet."),
      id: "domain",
      title: "Domain & DNS Tests",
      testType: "domain",
    },
    {
      ...fromLatest("mxtoolbox", "No MXToolbox proxy results stored yet."),
      id: "mxtoolbox",
      title: "MXToolbox Checks",
      testType: "mxtoolbox",
    },
    {
      ...fromLatest("advanced_search", "Run an advanced search to populate this card."),
      id: "advanced_search",
      title: "Advanced Search",
      testType: "advanced_search",
    },
    {
      id: "history",
      title: "Test History",
      testType: "meta",
      status: rows.length > 0 ? "healthy" : "not_tested",
      lastChecked: rows[0]?.checkedAt ?? null,
      responseTime: null,
      summary: rows.length === 0 ? "No rows in the in-memory history store." : `${rows.length} result rows stored (demo cap: 500).`,
      errorSummary: null,
    },
    {
      id: "alerts",
      title: "Alerts & Reports",
      testType: "meta",
      status: "healthy",
      lastChecked: alerts.lastMockDispatchAt,
      responseTime: null,
      summary: alertSummary,
      errorSummary: null,
    },
  ];

  return Response.json({
    data: {
      cards,
      globalSchedule: getGlobalSchedule(),
    },
  });
}
