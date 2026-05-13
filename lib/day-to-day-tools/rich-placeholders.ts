// =============================================================================
// Rich API placeholders — copy for Route Handlers; never ship secrets client-side.
// =============================================================================

export interface RichPlaceholderConfig {
  id: string;
  title: string;
  summary: string;
  requiredEnv: string[];
  suggestedRoute: string;
  exampleRequest: unknown;
  exampleResponse: unknown;
  securityNote: string;
}

export const RICH_PLACEHOLDERS: Record<string, RichPlaceholderConfig> = {
  form_automation: {
    id: "form_automation",
    title: "Website form automation",
    summary: "Headless submissions against staging forms with schema validation and screenshot diffs.",
    requiredEnv: ["PLAYWRIGHT_BASE_URL", "FORM_AUTOMATION_SECRET"],
    suggestedRoute: "app/api/cron/form-smoke/route.ts",
    exampleRequest: { formId: "contact", environment: "staging", cases: ["happy", "validation", "spam"] },
    exampleResponse: { passed: 3, failed: 0, artifacts: ["s3://…/trace.zip"] },
    securityNote: "Never drive production forms without allow-lists; keep auth for the runner in server env only.",
  },
  mxtoolbox: {
    id: "mxtoolbox",
    title: "MXToolbox API checks",
    summary: "Automate DNS / mail path checks from a server route with provider keys in env only.",
    requiredEnv: ["MXTOOLBOX_API_KEY"],
    suggestedRoute: "app/api/integrations/mxtoolbox/route.ts",
    exampleRequest: { host: "example.com", checks: ["mx", "spf", "dmarc"] },
    exampleResponse: { ok: true, results: [{ type: "mx", status: "pass", detail: "…" }] },
    securityNote: "Do not expose MXToolbox keys in the browser. Proxy via an authenticated API route with rate limits.",
  },
  hetrixtools: {
    id: "hetrixtools",
    title: "HetrixTools blacklist monitoring",
    summary: "Poll HetrixTools for listed IPs/domains and fan out alerts.",
    requiredEnv: ["HETRIXTOOLS_API_TOKEN"],
    suggestedRoute: "app/api/integrations/hetrixtools/route.ts",
    exampleRequest: { target: "203.0.113.10", listTypes: ["zen", "spamhaus"] },
    exampleResponse: { listed: false, sources: [] },
    securityNote: "Keep tokens server-side; schedule with Vercel Cron or GitHub Actions calling your backend only.",
  },
  virustotal: {
    id: "virustotal",
    title: "VirusTotal file / URL lookup",
    summary: "Delegate hashes and URLs to a server function with VT v3 API.",
    requiredEnv: ["VIRUSTOTAL_API_KEY"],
    suggestedRoute: "app/api/integrations/virustotal/route.ts",
    exampleRequest: { resource: "url", value: "https://example.com/path" },
    exampleResponse: { data: { attributes: { last_analysis_stats: { malicious: 0, suspicious: 0 } } } },
    securityNote: "Never embed VT keys in client bundles. Log minimally and redact submitted URLs if sensitive.",
  },
  abuseipdb: {
    id: "abuseipdb",
    title: "AbuseIPDB reputation lookup",
    summary: "Score client IPs seen in forms or admin surfaces.",
    requiredEnv: ["ABUSEIPDB_API_KEY"],
    suggestedRoute: "app/api/integrations/abuseipdb/route.ts",
    exampleRequest: { ipAddress: "198.51.100.2", maxAgeInDays: 30 },
    exampleResponse: { data: { abuseConfidenceScore: 12, totalReports: 1 } },
    securityNote: "Keys must remain on the server; throttle per IP to control cost.",
  },
  twilio: {
    id: "twilio",
    title: "Twilio programmable voice / SMS tests",
    summary: "Place test calls or fetch queue metrics from a protected route.",
    requiredEnv: ["TWILIO_ACCOUNT_SID", "TWILIO_AUTH_TOKEN"],
    suggestedRoute: "app/api/integrations/twilio/route.ts",
    exampleRequest: { action: "enqueueTestCall", to: "+15551234567", from: "+15559876543" },
    exampleResponse: { sid: "CAxxxxxxxx", status: "queued" },
    securityNote: "Auth tokens are equivalent to passwords — store only in server env and rotate regularly.",
  },
  msgraph: {
    id: "msgraph",
    title: "Microsoft Graph checks",
    summary: "Delegated or app-only reads for sign-in health, licences, Teams presence.",
    requiredEnv: ["AZURE_TENANT_ID", "AZURE_CLIENT_ID", "AZURE_CLIENT_SECRET"],
    suggestedRoute: "app/api/integrations/microsoft-graph/route.ts",
    exampleRequest: { query: "/reports/getOffice365ActiveUserDetail", period: "D7" },
    exampleResponse: { value: [{ userPrincipalName: "user@contoso.com", lastActivityDate: "2026-05-01" }] },
    securityNote: "Use certificate-based auth where possible; never ship client secrets to the browser.",
  },
  github_actions: {
    id: "github_actions",
    title: "GitHub Actions scheduled tests",
    summary: "Dispatch workflows that hit Playwright or smoke APIs on a cadence.",
    requiredEnv: ["GITHUB_TOKEN"],
    suggestedRoute: ".github/workflows/scheduled-smoke.yml",
    exampleRequest: { event_type: "smoke", client_payload: { env: "staging" } },
    exampleResponse: { id: 123456789, status: "queued" },
    securityNote: "Fine-scoped PATs or GitHub Apps with least privilege; store tokens as encrypted secrets.",
  },
  playwright_remote: {
    id: "playwright_remote",
    title: "Playwright browser tests (remote runner)",
    summary: "Trigger @playwright/test from CI against preview URLs.",
    requiredEnv: ["PLAYWRIGHT_BASE_URL", "CI"],
    suggestedRoute: "scripts/playwright-ci.sh",
    exampleRequest: { command: "npx playwright test --grep @smoke" },
    exampleResponse: { passed: 12, failed: 0, flaky: 1 },
    securityNote: "Run against ephemeral previews; never print secrets in traces.",
  },
  csv_email_reports: {
    id: "csv_email_reports",
    title: "CSV email reports",
    summary: "Nightly job builds CSV from logs and mails via transactional provider.",
    requiredEnv: ["REPORT_SMTP_URL", "REPORT_FROM", "REPORT_TO"],
    suggestedRoute: "app/api/cron/daily-csv-report/route.ts",
    exampleRequest: { dataset: "lead_checks", date: "2026-05-13" },
    exampleResponse: { bytes: 20480, filename: "lead_checks_2026-05-13.csv" },
    securityNote: "Encrypt attachments at rest and sign download links with short TTLs.",
  },
  dashboard_alerts: {
    id: "dashboard_alerts",
    title: "Dashboard alert notifications",
    summary: "Fan-out alert webhooks to Slack / Teams when checks fail.",
    requiredEnv: ["ALERT_WEBHOOK_URL"],
    suggestedRoute: "app/api/alerts/fanout/route.ts",
    exampleRequest: { severity: "high", title: "Form submit failing", url: "https://status…" },
    exampleResponse: { delivered: ["slack"], skipped: [] },
    securityNote: "Validate webhook signatures; do not echo raw PII into chat systems.",
  },
  secure_api_proxy: {
    id: "secure_api_proxy",
    title: "Secure backend API proxy",
    summary: "Single BFF that signs outbound calls and strips sensitive headers.",
    requiredEnv: ["INTERNAL_SERVICE_JWT"],
    suggestedRoute: "app/api/proxy/[...path]/route.ts",
    exampleRequest: { path: "checks/dns", body: { host: "example.com" } },
    exampleResponse: { ok: true, data: {} },
    securityNote: "Authenticate callers, enforce allow-lists, and never forward arbitrary upstream headers.",
  },
  vercel_serverless: {
    id: "vercel_serverless",
    title: "Vercel serverless function notes",
    summary: "Short-lived Node/Edge routes for integrations with Fluid Compute limits.",
    requiredEnv: ["VERCEL_CRON_SECRET"],
    suggestedRoute: "app/api/cron/integration-tick/route.ts",
    exampleRequest: { tick: true },
    exampleResponse: { processed: 5 },
    securityNote: "Protect cron routes with `VERCEL_CRON_SECRET` header checks.",
  },
  netlify_functions: {
    id: "netlify_functions",
    title: "Netlify function notes",
    summary: "Background tasks via Netlify scheduled functions hitting internal APIs.",
    requiredEnv: ["NETLIFY_AUTH_TOKEN"],
    suggestedRoute: "netlify/functions/scheduled-check.ts",
    exampleRequest: { siteId: "abc", function: "scheduled-check" },
    exampleResponse: { statusCode: 200, body: "ok" },
    securityNote: "Scope tokens to single site; rotate on staff changes.",
  },
  api_key_hygiene: {
    id: "api_key_hygiene",
    title: "API key security checklist (automation)",
    summary: "Pair with your CMDB — this entry documents automation-facing secrets hygiene.",
    requiredEnv: ["N/A — process checklist"],
    suggestedRoute: "docs/security/api-keys.md",
    exampleRequest: { reviewQuarter: "2026-Q2" },
    exampleResponse: { openRisks: 2, mitigated: 14 },
    securityNote: "Never commit `.env`; prefer Doppler / Vercel env / OIDC for CI.",
  },
};

export function getRichPlaceholder(id: string): RichPlaceholderConfig | undefined {
  return RICH_PLACEHOLDERS[id];
}
