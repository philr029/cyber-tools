import { uniqueSiteTools, type SiteTool } from "@/lib/tools/site-catalog";
import { getRecentToolNav, getPinnedToolHrefs } from "@/lib/platform/tool-nav-memory";

const D2D_PIN = "ss_d2d_prefs_pinned";
const D2D_RECENT = "ss_d2d_prefs_recent";

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function countMegaGroup(tools: SiteTool[], label: string) {
  return tools.filter((t) => t.megaGroup === label).length;
}

function countToolkit(tools: SiteTool[], id: SiteTool["toolkitFilters"][number]) {
  return tools.filter((t) => t.toolkitFilters.includes(id)).length;
}

/** Optional activity counters — incremented by forms / flows when you wire them. */
const KEY_CHECKS = "ss_platform_completed_checks";
const KEY_WEB_TESTS = "ss_platform_website_tests";
const KEY_PHONE_TESTS = "ss_platform_phone_tests";
const KEY_SEC_TASKS = "ss_platform_security_tasks";
const KEY_NOTES = "ss_platform_notes_count";

function readCounter(key: string) {
  if (typeof window === "undefined") return 0;
  const v = window.localStorage.getItem(key);
  const n = v ? Number(v) : 0;
  return Number.isFinite(n) && n >= 0 ? Math.min(n, 999999) : 0;
}

export type WorkspaceStat = {
  id: string;
  label: string;
  value: number;
  hint?: string;
};

/** Aggregates for homepage / dashboard command centre (client-only reads). */
export function buildWorkspaceStats(): WorkspaceStat[] {
  const tools = uniqueSiteTools();
  const total = tools.length;
  const it = countToolkit(tools, "IT tools") + countMegaGroup(tools, "Domain & DNS Tools");
  const marketing = countToolkit(tools, "Marketing") + countMegaGroup(tools, "Marketing Tools");
  const cyber = countToolkit(tools, "Cybersecurity") + countMegaGroup(tools, "Security Tools");
  const automation = countToolkit(tools, "Automation") + countMegaGroup(tools, "Automation Tools");

  let d2dPinned = 0;
  let d2dRecent = 0;
  if (typeof window !== "undefined") {
    const pins = readJson<string[]>(D2D_PIN, []);
    const recent = readJson<{ id?: string }[]>(D2D_RECENT, []);
    d2dPinned = Array.isArray(pins) ? pins.length : 0;
    d2dRecent = Array.isArray(recent) ? recent.length : 0;
  }

  const navRecent = typeof window !== "undefined" ? getRecentToolNav().length : 0;
  const navPinned = typeof window !== "undefined" ? getPinnedToolHrefs().length : 0;

  const webTests = readCounter(KEY_WEB_TESTS);
  const phoneTests = readCounter(KEY_PHONE_TESTS);
  const testsAuto = webTests + phoneTests;

  return [
    { id: "total", label: "Tools available", value: total, hint: "Catalogued routes in this deployment" },
    { id: "testsAuto", label: "Tests automated", value: testsAuto, hint: "Website and phone test runs logged locally" },
    { id: "secTasks", label: "Security checks", value: readCounter(KEY_SEC_TASKS), hint: "Security tasks recorded in this browser" },
    { id: "checks", label: "Reports generated", value: readCounter(KEY_CHECKS), hint: "Completed checklists and rollups" },
    { id: "it", label: "IT & DNS", value: it, hint: "Toolkit filters + DNS group" },
    { id: "marketing", label: "Marketing", value: marketing },
    { id: "cyber", label: "Cyber", value: cyber },
    { id: "automation", label: "Automation-ready", value: automation },
    { id: "pinned", label: "Pinned (day-to-day)", value: d2dPinned, hint: "Day-to-day hub" },
    { id: "recentD2d", label: "Recently opened (day-to-day)", value: d2dRecent },
    { id: "recentNav", label: "Recently viewed (tools)", value: navRecent, hint: "This browser" },
    { id: "navPins", label: "Pinned routes (nav)", value: navPinned },
    { id: "notes", label: "Saved notes (placeholder)", value: readCounter(KEY_NOTES), hint: "Increment when you add a notes tool" },
    { id: "webTests", label: "Website tests logged", value: webTests },
    { id: "phoneTests", label: "Phone tests logged", value: phoneTests },
  ];
}

export const WORKSPACE_COUNTER_KEYS = {
  notes: KEY_NOTES,
  checks: KEY_CHECKS,
  webTests: KEY_WEB_TESTS,
  phoneTests: KEY_PHONE_TESTS,
  secTasks: KEY_SEC_TASKS,
} as const;
