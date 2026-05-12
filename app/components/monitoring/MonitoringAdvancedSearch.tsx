"use client";

import { useMemo, useState } from "react";
import { Funnel, MagnifyingGlass, SortAscending } from "@phosphor-icons/react";
import type { HubSearchFilters, HubSortOption, HubStatus, HubTestType, TestResult } from "@/lib/monitoring-hub/types";

export interface MonitoringAdvancedSearchProps {
  onSearch: (filters: HubSearchFilters, sort: HubSortOption) => Promise<TestResult[]>;
  loading?: boolean;
  onSelectRow?: (row: TestResult) => void;
}

const TEST_TYPES: Array<{ value: HubTestType | ""; label: string }> = [
  { value: "", label: "All types" },
  { value: "phone", label: "Phone" },
  { value: "website", label: "Website" },
  { value: "form", label: "Form" },
  { value: "domain", label: "Domain" },
  { value: "mxtoolbox", label: "MXToolbox" },
  { value: "advanced_search", label: "Search" },
  { value: "error_log", label: "Error logs" },
];

const STATUSES: Array<{ value: HubStatus | ""; label: string }> = [
  { value: "", label: "Any status" },
  { value: "healthy", label: "Healthy" },
  { value: "warning", label: "Warning" },
  { value: "failed", label: "Failed" },
  { value: "not_tested", label: "Not tested" },
];

const SORTS: Array<{ value: HubSortOption; label: string }> = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "failed_first", label: "Failed first" },
  { value: "slowest", label: "Slowest response" },
  { value: "testType", label: "Test type" },
];

export default function MonitoringAdvancedSearch({ onSearch, loading, onSelectRow }: MonitoringAdvancedSearchProps) {
  const [keyword, setKeyword] = useState("");
  const [testType, setTestType] = useState<HubTestType | "">("");
  const [status, setStatus] = useState<HubStatus | "">("");
  const [domain, setDomain] = useState("");
  const [url, setUrl] = useState("");
  const [phone, setPhone] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [errorType, setErrorType] = useState("");
  const [minResponseMs, setMinResponseMs] = useState("");
  const [sort, setSort] = useState<HubSortOption>("newest");
  const [rows, setRows] = useState<TestResult[]>([]);

  const filters = useMemo(
    (): HubSearchFilters => ({
      keyword: keyword || undefined,
      testType: testType || undefined,
      status: status || undefined,
      domain: domain || undefined,
      url: url || undefined,
      phone: phone || undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      errorType: errorType || undefined,
      minResponseMs: minResponseMs ? Number(minResponseMs) : undefined,
    }),
    [keyword, testType, status, domain, url, phone, dateFrom, dateTo, errorType, minResponseMs],
  );

  async function run() {
    const data = await onSearch(filters, sort);
    setRows(data);
  }

  return (
    <section className="rounded-[28px] border border-[var(--border)] bg-[var(--card)] p-5 sm:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">Advanced search</p>
          <h2 className="mt-1 text-lg font-semibold text-[var(--foreground)]">Cross-cut monitoring results</h2>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1 text-[11px] text-[var(--muted)]">
          <Funnel className="h-3.5 w-3.5" aria-hidden />
          Filters apply to stored demo history
        </span>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Field label="Keyword">
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:ring-2 focus:ring-cyan-500/30"
            placeholder="Search summaries, JSON…"
          />
        </Field>
        <Field label="Test type">
          <select
            value={testType}
            onChange={(e) => setTestType(e.target.value as HubTestType | "")}
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:ring-2 focus:ring-cyan-500/30"
          >
            {TEST_TYPES.map((t) => (
              <option key={t.label} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Status">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as HubStatus | "")}
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:ring-2 focus:ring-cyan-500/30"
          >
            {STATUSES.map((t) => (
              <option key={t.label} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Domain contains">
          <input
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:ring-2 focus:ring-cyan-500/30"
            placeholder="example.com"
          />
        </Field>
        <Field label="URL contains">
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:ring-2 focus:ring-cyan-500/30"
            placeholder="https://"
          />
        </Field>
        <Field label="Phone contains">
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:ring-2 focus:ring-cyan-500/30"
            placeholder="+44…"
          />
        </Field>
        <Field label="Date from">
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:ring-2 focus:ring-cyan-500/30"
          />
        </Field>
        <Field label="Date to">
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:ring-2 focus:ring-cyan-500/30"
          />
        </Field>
        <Field label="Error type contains">
          <input
            value={errorType}
            onChange={(e) => setErrorType(e.target.value)}
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:ring-2 focus:ring-cyan-500/30"
            placeholder="timeout, TLS, HTTP…"
          />
        </Field>
        <Field label="Response time ≥ (ms)">
          <input
            value={minResponseMs}
            onChange={(e) => setMinResponseMs(e.target.value.replace(/[^\d]/g, ""))}
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:ring-2 focus:ring-cyan-500/30"
            placeholder="3000"
          />
        </Field>
        <Field label="Sort">
          <div className="flex gap-2">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as HubSortOption)}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:ring-2 focus:ring-cyan-500/30"
            >
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </Field>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={loading}
          onClick={() => void run()}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_0_18px_rgba(6,182,212,0.25)] disabled:opacity-45"
        >
          <MagnifyingGlass className="h-4 w-4" weight="bold" aria-hidden />
          {loading ? "Searching…" : "Run search"}
        </button>
        <span className="inline-flex items-center gap-1 text-[11px] text-[var(--muted)]">
          <SortAscending className="h-3.5 w-3.5" aria-hidden />
          Results also persist as an `advanced_search` audit row.
        </span>
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-[var(--border)]">
        <table className="min-w-full text-left text-xs">
          <thead className="bg-[var(--surface)] text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">
            <tr>
              <th className="px-3 py-2">Type</th>
              <th className="px-3 py-2">Target</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Checked</th>
              <th className="px-3 py-2">RT</th>
              <th className="px-3 py-2">Summary</th>
              <th className="px-3 py-2 w-24">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-subtle)] text-[var(--foreground)]/90">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-3 py-8 text-center text-[var(--muted)]">
                  No rows yet. Run a search or execute tests above.
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id} className="bg-[var(--card)]">
                  <td className="px-3 py-2 font-mono text-[10px] text-cyan-200/90">{r.testType}</td>
                  <td className="max-w-[200px] truncate px-3 py-2 text-[11px]">{r.target}</td>
                  <td className="px-3 py-2 text-[11px]">{r.status}</td>
                  <td className="whitespace-nowrap px-3 py-2 text-[11px] text-[var(--muted)]">
                    {new Date(r.checkedAt).toLocaleString()}
                  </td>
                  <td className="px-3 py-2 text-[11px]">{r.responseTime ?? "—"}</td>
                  <td className="max-w-xs truncate px-3 py-2 text-[11px] text-[var(--muted)]">{r.summary}</td>
                  <td className="px-3 py-2">
                    <button
                      type="button"
                      disabled={!onSelectRow}
                      onClick={() => onSelectRow?.(r)}
                      className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2 py-1 text-[10px] font-semibold text-cyan-200 hover:border-cyan-400/50 disabled:opacity-40"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-[11px] font-medium text-[var(--muted)]">
      <span className="mb-1 block">{label}</span>
      {children}
    </label>
  );
}
