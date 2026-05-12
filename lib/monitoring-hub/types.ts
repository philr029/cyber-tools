/**
 * Automated Monitoring Hub — shared types.
 *
 * Persistence: replace the in-memory store (`lib/monitoring-hub/store.ts`) with
 * Supabase, Firebase, Vercel Postgres, Notion, Airtable, or CI artifact
 * uploads when you promote this module beyond demos.
 */

export type HubTestType =
  | "phone"
  | "website"
  | "form"
  | "domain"
  | "mxtoolbox"
  | "advanced_search"
  | "error_log";

export type HubStatus = "healthy" | "warning" | "failed" | "not_tested";

export type HubResultSource = "manual" | "scheduled" | "mock" | "api";

export interface TestResult {
  id: string;
  testType: HubTestType;
  /** Human-readable target: URL, domain, E.164 phone, or search query */
  target: string;
  status: HubStatus;
  responseTime: number | null;
  checkedAt: string;
  summary: string;
  rawResult: Record<string, unknown>;
  errorMessage: string | null;
  source: HubResultSource;
  /** Optional subtype for MXToolbox command, form test name, etc. */
  label?: string;
}

export type HubSchedule = "manual" | "15m" | "hourly" | "daily" | "weekly";

export interface TestConfig {
  id: string;
  name: string;
  testType: HubTestType;
  target: string;
  enabled: boolean;
  schedule: HubSchedule;
  createdAt: string;
  updatedAt: string;
  meta?: Record<string, unknown>;
}

export type AlertChannel = "email" | "teams" | "slack" | "discord" | "sms" | "dashboard";

export interface AlertSettings {
  channels: Partial<Record<AlertChannel, { enabled: boolean; destination?: string }>>;
  /** Mock: last simulated dispatch */
  lastMockDispatchAt: string | null;
}

export interface HubSearchFilters {
  keyword?: string;
  testType?: HubTestType | "";
  status?: HubStatus | "";
  domain?: string;
  url?: string;
  phone?: string;
  dateFrom?: string;
  dateTo?: string;
  errorType?: string;
  minResponseMs?: number;
}

export type HubSortOption = "newest" | "oldest" | "failed_first" | "slowest" | "testType";
