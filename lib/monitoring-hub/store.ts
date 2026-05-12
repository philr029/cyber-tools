/**
 * In-memory monitoring store (mock persistence).
 *
 * Swap this module for a database client when you wire Supabase / Vercel
 * Postgres / etc. Keep the same method signatures to avoid churn in API routes.
 */

import { randomUUID } from "crypto";
import type {
  AlertSettings,
  HubSchedule,
  HubSearchFilters,
  HubSortOption,
  HubStatus,
  HubTestType,
  TestConfig,
  TestResult,
} from "./types";

interface HubStoreState {
  results: TestResult[];
  configs: TestConfig[];
  globalSchedule: HubSchedule;
  alertSettings: AlertSettings;
}

function emptyAlerts(): AlertSettings {
  return {
    channels: {
      email: { enabled: false },
      teams: { enabled: false },
      slack: { enabled: false },
      discord: { enabled: false },
      sms: { enabled: false },
      dashboard: { enabled: true },
    },
    lastMockDispatchAt: null,
  };
}

declare global {
  // eslint-disable-next-line no-var -- intentional global singleton for dev HMR / serverless warm instances
  var __SECURESCOPE_MONITORING_STORE__: HubStoreState | undefined;
}

function state(): HubStoreState {
  if (!globalThis.__SECURESCOPE_MONITORING_STORE__) {
    globalThis.__SECURESCOPE_MONITORING_STORE__ = {
      results: [],
      configs: [],
      globalSchedule: "manual",
      alertSettings: emptyAlerts(),
    };
  }
  return globalThis.__SECURESCOPE_MONITORING_STORE__;
}

function statusRank(s: HubStatus): number {
  switch (s) {
    case "failed":
      return 0;
    case "warning":
      return 1;
    case "healthy":
      return 2;
    default:
      return 3;
  }
}

export function addTestResult(
  partial: Omit<TestResult, "id" | "checkedAt"> & { checkedAt?: string },
): TestResult {
  const row: TestResult = {
    ...partial,
    id: randomUUID(),
    checkedAt: partial.checkedAt ?? new Date().toISOString(),
  };
  state().results.unshift(row);
  if (state().results.length > 500) {
    state().results.length = 500;
  }
  return row;
}

export function addErrorLog(summary: string, raw: Record<string, unknown>): TestResult {
  return addTestResult({
    testType: "error_log",
    target: "system",
    status: "failed",
    responseTime: null,
    summary,
    rawResult: raw,
    errorMessage: typeof raw.message === "string" ? raw.message : summary,
    source: "api",
    label: "error_log",
  });
}

export function listResults(filters: HubSearchFilters, sort: HubSortOption): TestResult[] {
  let rows = [...state().results];

  const kw = filters.keyword?.trim().toLowerCase();
  if (kw) {
    rows = rows.filter(
      (r) =>
        r.target.toLowerCase().includes(kw) ||
        r.summary.toLowerCase().includes(kw) ||
        (r.errorMessage && r.errorMessage.toLowerCase().includes(kw)) ||
        JSON.stringify(r.rawResult).toLowerCase().includes(kw),
    );
  }

  if (filters.testType) {
    rows = rows.filter((r) => r.testType === filters.testType);
  }

  if (filters.status) {
    rows = rows.filter((r) => r.status === filters.status);
  }

  const domain = filters.domain?.trim().toLowerCase();
  if (domain) {
    rows = rows.filter((r) => r.target.toLowerCase().includes(domain));
  }

  const url = filters.url?.trim().toLowerCase();
  if (url) {
    rows = rows.filter((r) => r.target.toLowerCase().includes(url));
  }

  const phone = filters.phone?.trim();
  if (phone) {
    rows = rows.filter((r) => r.target.includes(phone));
  }

  if (filters.dateFrom) {
    const t = Date.parse(filters.dateFrom);
    rows = rows.filter((r) => Date.parse(r.checkedAt) >= t);
  }
  if (filters.dateTo) {
    const t = Date.parse(filters.dateTo);
    rows = rows.filter((r) => Date.parse(r.checkedAt) <= t);
  }

  const et = filters.errorType?.trim().toLowerCase();
  if (et) {
    rows = rows.filter(
      (r) =>
        (r.errorMessage && r.errorMessage.toLowerCase().includes(et)) ||
        r.summary.toLowerCase().includes(et),
    );
  }

  if (typeof filters.minResponseMs === "number" && !Number.isNaN(filters.minResponseMs)) {
    rows = rows.filter(
      (r) => r.responseTime !== null && r.responseTime >= (filters.minResponseMs as number),
    );
  }

  switch (sort) {
    case "oldest":
      rows.sort((a, b) => Date.parse(a.checkedAt) - Date.parse(b.checkedAt));
      break;
    case "failed_first":
      rows.sort((a, b) => statusRank(a.status) - statusRank(b.status));
      break;
    case "slowest":
      rows.sort(
        (a, b) => (b.responseTime ?? -1) - (a.responseTime ?? -1),
      );
      break;
    case "testType":
      rows.sort((a, b) => a.testType.localeCompare(b.testType));
      break;
    case "newest":
    default:
      rows.sort((a, b) => Date.parse(b.checkedAt) - Date.parse(a.checkedAt));
  }

  return rows;
}

export function getLatestByType(testType: HubTestType): TestResult | undefined {
  return state().results.find((r) => r.testType === testType);
}

export function getConfigs(): TestConfig[] {
  return [...state().configs];
}

export function replaceConfigs(configs: TestConfig[]): void {
  state().configs = configs.slice(0, 100);
}

export function getGlobalSchedule(): HubSchedule {
  return state().globalSchedule;
}

export function setGlobalSchedule(s: HubSchedule): void {
  state().globalSchedule = s;
}

export function getAlertSettings(): AlertSettings {
  return JSON.parse(JSON.stringify(state().alertSettings)) as AlertSettings;
}

export function setAlertSettings(next: AlertSettings): void {
  const prev = getAlertSettings();
  state().alertSettings = {
    ...prev,
    ...next,
    channels: { ...prev.channels, ...next.channels },
    lastMockDispatchAt:
      next.lastMockDispatchAt !== undefined ? next.lastMockDispatchAt : prev.lastMockDispatchAt,
  };
}

export function touchMockAlertDispatch(): void {
  state().alertSettings.lastMockDispatchAt = new Date().toISOString();
}
