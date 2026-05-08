"use client";

import { useState } from "react";
import { validateURL, normaliseURL } from "@/lib/validators";
import { sanitizeSingleLineInput } from "@/lib/input-sanitization";
import ToolPageLayout from "@/app/components/tools/ToolPageLayout";
import ToolInput from "@/app/components/tools/ToolInput";
import LoadingSpinner from "@/app/components/ui/LoadingSpinner";
import ToolEmptyState from "@/app/components/ui/ToolEmptyState";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type CheckStatus = "pass" | "warning" | "fail";

interface CheckItem {
  name: string;
  present: boolean;
  value: string | null;
  status: CheckStatus;
  hint?: string;
}

interface WebsiteHealthResult {
  url: string;
  finalUrl: string;
  statusCode: number;
  statusText: string;
  durationMs: number;
  contentType: string;
  redirected: boolean;
  isHtml: boolean;
  seoChecks: CheckItem[];
  headerChecks: CheckItem[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const STATUS_STYLES: Record<CheckStatus, { bg: string; text: string; badge: string; dot: string }> = {
  pass:    { bg: "bg-emerald-500/8 border-emerald-500/20",  text: "text-emerald-400", badge: "Pass",    dot: "bg-emerald-400" },
  warning: { bg: "bg-amber-500/8 border-amber-500/20",      text: "text-amber-400",   badge: "Warning", dot: "bg-amber-400"   },
  fail:    { bg: "bg-red-500/8 border-red-500/20",          text: "text-red-400",     badge: "Fail",    dot: "bg-red-400"     },
};

function statusCodeColor(code: number): string {
  if (code >= 500) return "text-red-400";
  if (code >= 400) return "text-orange-400";
  if (code >= 300) return "text-yellow-400";
  if (code >= 200) return "text-emerald-400";
  return "text-slate-400";
}

function responseTimeStatus(ms: number): CheckStatus {
  if (ms < 800) return "pass";
  if (ms < 2500) return "warning";
  return "fail";
}

function statusCodeStatus(code: number): CheckStatus {
  if (code >= 200 && code < 300) return "pass";
  if (code >= 300 && code < 400) return "warning";
  return "fail";
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function CheckRow({ item }: { item: CheckItem }) {
  const style = STATUS_STYLES[item.status];
  return (
    <div className={`flex items-start gap-3 rounded-xl border p-3.5 ${style.bg}`}>
      <span className={`mt-1 h-2 w-2 rounded-full shrink-0 ${style.dot}`} aria-hidden="true" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-slate-200 capitalize">{item.name}</span>
          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full border ${style.bg} ${style.text}`}>
            {style.badge}
          </span>
        </div>
        {item.value && (
          <p className="text-xs text-slate-400 mt-0.5 break-all font-mono">{item.value}</p>
        )}
        {item.hint && (
          <p className={`text-xs mt-0.5 ${style.text}`}>{item.hint}</p>
        )}
        {!item.present && !item.hint && (
          <p className="text-xs text-slate-600 mt-0.5">Not found</p>
        )}
      </div>
    </div>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-[#0d1321] border border-[#1e2d4a] overflow-hidden">
      <div className="px-5 py-3.5 border-b border-[#1e2d4a] bg-[#0b0f1a]">
        <h2 className="text-sm font-semibold text-slate-200">{title}</h2>
      </div>
      <div className="p-5 space-y-2.5">{children}</div>
    </div>
  );
}

const EmptyIcon = (
  <svg className="w-10 h-10 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
  </svg>
);

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function WebsiteHealthPage() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<WebsiteHealthResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(url: string) {
    const safe = sanitizeSingleLineInput(normaliseURL(url), { maxLength: 2048 });
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const res = await fetch(`/api/tools/website-health?url=${encodeURIComponent(safe)}`);
      const json = await res.json() as WebsiteHealthResult & { error?: string };
      if (!res.ok || json.error) {
        setError(json.error ?? "Failed to check website health.");
      } else {
        setData(json);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // Derived scores for summary
  const passCount = data
    ? [...data.seoChecks, ...data.headerChecks].filter((c) => c.status === "pass").length
    : 0;
  const warnCount = data
    ? [...data.seoChecks, ...data.headerChecks].filter((c) => c.status === "warning").length
    : 0;
  const failCount = data
    ? [...data.seoChecks, ...data.headerChecks].filter((c) => c.status === "fail").length
    : 0;

  return (
    <ToolPageLayout
      title="Website Health Checker"
      description="Check HTTP status, response time, page title, SEO metadata, and security headers for any public URL."
    >
      <ToolInput
        placeholder="Enter a URL (e.g. https://example.com)"
        buttonLabel="Check Health"
        validate={validateURL}
        onSubmit={handleSubmit}
        loading={loading}
        hint="https:// is added automatically if omitted."
        examples={["https://google.com", "https://github.com", "https://example.com"]}
      />

      {loading && (
        <LoadingSpinner
          label="Checking website health…"
          sublabel="Fetching URL, measuring response time, and parsing page content…"
        />
      )}

      {error && (
        <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      {!loading && !error && data && (
        <div className="space-y-4 mt-2">
          {/* Summary strip */}
          <div className="rounded-2xl bg-[#0d1321] border border-[#1e2d4a] p-5">
            <div className="flex flex-wrap gap-6 items-center">
              {/* HTTP status */}
              <div className="text-center">
                <p className={`text-3xl font-bold font-mono ${statusCodeColor(data.statusCode)}`}>
                  {data.statusCode}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">{data.statusText || "HTTP Status"}</p>
              </div>
              {/* Response time */}
              <div className="text-center">
                <p className={`text-3xl font-bold ${responseTimeStatus(data.durationMs) === "pass" ? "text-emerald-400" : responseTimeStatus(data.durationMs) === "warning" ? "text-amber-400" : "text-red-400"}`}>
                  {data.durationMs} <span className="text-lg font-normal text-slate-500">ms</span>
                </p>
                <p className="text-xs text-slate-500 mt-0.5">Response time</p>
              </div>
              {/* Score summary */}
              <div className="flex gap-4 ml-auto">
                <div className="text-center">
                  <p className="text-2xl font-bold text-emerald-400">{passCount}</p>
                  <p className="text-xs text-slate-500 mt-0.5">Passed</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-amber-400">{warnCount}</p>
                  <p className="text-xs text-slate-500 mt-0.5">Warnings</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-400">{failCount}</p>
                  <p className="text-xs text-slate-500 mt-0.5">Failed</p>
                </div>
              </div>
            </div>

            {/* URL info */}
            <div className="mt-4 pt-4 border-t border-[#1e2d4a] flex flex-wrap gap-x-6 gap-y-1 text-xs text-slate-500">
              <span>
                <span className="text-slate-400">URL: </span>
                <span className="font-mono text-cyan-400 break-all">{data.url}</span>
              </span>
              {data.redirected && data.finalUrl !== data.url && (
                <span>
                  <span className="text-slate-400">Final URL: </span>
                  <span className="font-mono text-amber-400 break-all">{data.finalUrl}</span>
                </span>
              )}
              <span>
                <span className="text-slate-400">Content-Type: </span>
                {data.contentType || "—"}
              </span>
              {data.redirected && (
                <span className="text-amber-400">↳ Redirected</span>
              )}
            </div>
          </div>

          {/* Status check */}
          <SectionCard title="HTTP Response">
            <CheckRow item={{
              name: "HTTP status code",
              present: true,
              value: `${data.statusCode} ${data.statusText}`,
              status: statusCodeStatus(data.statusCode),
              hint: data.statusCode >= 400 ? `Server returned ${data.statusCode} — the page may not be accessible.` : undefined,
            }} />
            <CheckRow item={{
              name: "Response time",
              present: true,
              value: `${data.durationMs} ms`,
              status: responseTimeStatus(data.durationMs),
              hint: data.durationMs >= 2500 ? "Response time is slow (>2.5s). Consider performance optimisation." : data.durationMs >= 800 ? "Response time is moderate (0.8–2.5s)." : undefined,
            }} />
            <CheckRow item={{
              name: "Redirect",
              present: true,
              value: data.redirected ? `Redirected to ${data.finalUrl}` : "No redirect",
              status: data.redirected ? "warning" : "pass",
              hint: data.redirected ? "Request was redirected. Check the final URL is correct." : undefined,
            }} />
          </SectionCard>

          {/* SEO checks */}
          {data.isHtml && (
            <SectionCard title="SEO &amp; Page Metadata">
              {data.seoChecks.map((c) => (
                <CheckRow key={c.name} item={c} />
              ))}
            </SectionCard>
          )}

          {!data.isHtml && (
            <div className="rounded-xl bg-slate-500/8 border border-slate-500/20 p-4 text-sm text-slate-400">
              SEO checks are only available for HTML responses. This URL returned <span className="font-mono">{data.contentType || "a non-HTML content type"}</span>.
            </div>
          )}

          {/* Security headers */}
          <SectionCard title="Security Headers">
            {data.headerChecks.map((c) => (
              <CheckRow key={c.name} item={c} />
            ))}
          </SectionCard>
        </div>
      )}

      {!loading && !error && !data && (
        <ToolEmptyState
          icon={EmptyIcon}
          title="Enter a URL to check"
          description="Submit any public URL to inspect its HTTP status, response time, SEO metadata, and security headers."
        />
      )}
    </ToolPageLayout>
  );
}
