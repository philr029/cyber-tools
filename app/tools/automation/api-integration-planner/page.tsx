"use client";

import GeneratorTool from "@/app/components/tools/GeneratorTool";

const AUTH_TYPES = [
  { value: "none", label: "None (public)" },
  { value: "api-key", label: "API key (header)" },
  { value: "bearer", label: "Bearer token (OAuth client credentials)" },
  { value: "oauth-user", label: "OAuth 2.0 — authorization code (per-user)" },
  { value: "basic", label: "HTTP Basic" },
  { value: "mtls", label: "Mutual TLS (mTLS)" },
];

function envVarFor(api: string) {
  return api ? api.toUpperCase().replace(/[^A-Z0-9]+/g, "_").replace(/^_|_$/g, "") + "_API_KEY" : "API_KEY";
}

export default function ApiIntegrationPlannerPage() {
  return (
    <GeneratorTool
      title="API Integration Planner"
      description="Plan a clean, secure third-party API integration — auth, scopes, env vars, error handling, rate limits, observability and rollback."
      skill="Integration design, secrets management, API consumption patterns."
      why="Avoids the most common integration disasters: hard-coded secrets, no retries, no monitoring, no rollback path."
      futureApi="Pair with /tools/api-tester to validate the endpoint before writing application code."
      outputBadge="Demo plan · adapt to your stack"
      inputs={[
        { id: "api", label: "API / service name", placeholder: "VirusTotal, HubSpot, Stripe", required: true },
        { id: "endpoint", label: "Endpoint URL", placeholder: "https://api.example.com/v1/lookup", required: true, span: "full" },
        { id: "auth", label: "Authentication type", type: "select", options: AUTH_TYPES, defaultValue: "api-key" },
        { id: "scope", label: "Required scope(s) / permissions", placeholder: "read:contacts, write:tickets" },
        { id: "rate", label: "Documented rate limit", placeholder: "e.g. 60 req/min" },
      ]}
      generate={(v) => {
        if (!v.api || !v.endpoint) return "";
        const envVar = envVarFor(v.api);
        const lines: string[] = [];
        lines.push(`# API Integration Plan — ${v.api}`);
        lines.push("");
        lines.push(`**Endpoint:** \`${v.endpoint}\``);
        lines.push(`**Auth:** ${AUTH_TYPES.find((a) => a.value === v.auth)?.label ?? "Unknown"}`);
        if (v.scope) lines.push(`**Scopes:** ${v.scope}`);
        if (v.rate) lines.push(`**Rate limit:** ${v.rate}`);
        lines.push("");
        lines.push("## Pre-integration checklist");
        lines.push("- [ ] Read official API docs end-to-end (auth, pagination, errors, deprecations).");
        lines.push("- [ ] Confirm vendor SLA and incident comms channel.");
        lines.push("- [ ] Confirm data-residency / GDPR implications for any PII sent.");
        lines.push("- [ ] Sandbox / test environment available and used first.");
        lines.push("");
        lines.push("## Security");
        lines.push(`- [ ] Secret stored as env var \`${envVar}\` — never committed to git.`);
        lines.push("- [ ] Secret scope minimised to the smallest set of permissions required.");
        lines.push("- [ ] Rotation cadence documented (90 days max for high-risk keys).");
        lines.push("- [ ] Allow-list outbound destination IPs in the egress firewall where applicable.");
        if (v.auth === "oauth-user") {
          lines.push("- [ ] Refresh-token storage encrypted at rest; never logged.");
          lines.push("- [ ] Consent UX explains exactly which scopes are requested.");
        }
        if (v.auth === "mtls") {
          lines.push("- [ ] Client certificate stored in HSM / secret manager; not in source control.");
          lines.push("- [ ] Certificate expiry monitored ≥ 30 days in advance.");
        }
        lines.push("");
        lines.push("## Implementation");
        lines.push(`- [ ] Wrap all calls in a single client module with typed inputs/outputs.`);
        lines.push(`- [ ] Apply 3-retry exponential backoff for 429 / 5xx responses.`);
        lines.push(`- [ ] Respect documented rate limit (${v.rate || "see docs"}) with a request budget.`);
        lines.push("- [ ] Idempotency key on every write (avoid duplicate side-effects on retry).");
        lines.push("- [ ] Centralised error mapping (vendor codes → app-friendly errors).");
        lines.push("");
        lines.push("## Observability");
        lines.push("- [ ] Log requests with correlation id (no secrets, no PII).");
        lines.push("- [ ] Emit metrics: request count, latency p95, error rate, retry count.");
        lines.push("- [ ] Alert on error rate > 1% over 5 minutes.");
        lines.push("- [ ] Dashboard linked from runbook.");
        lines.push("");
        lines.push("## Environment variables");
        lines.push("```env");
        lines.push(`${envVar}=`);
        lines.push(`${envVar.replace("_API_KEY", "_BASE_URL")}=${new URL(v.endpoint).origin}`);
        if (v.auth === "oauth-user") {
          lines.push(`${envVar.replace("_API_KEY", "_CLIENT_ID")}=`);
          lines.push(`${envVar.replace("_API_KEY", "_CLIENT_SECRET")}=`);
        }
        lines.push("```");
        lines.push("");
        lines.push("## Rollback / kill-switch");
        lines.push("- [ ] Feature flag wraps the integration — can disable without redeploy.");
        lines.push("- [ ] Graceful degradation if the vendor is down (cached / queued / skipped).");
        lines.push("- [ ] Documented runbook for: revoke secret, rotate secret, restore from backup.");
        lines.push("");
        lines.push("---");
        lines.push("_Generated plan — adapt to your tech stack and security review process._");
        return lines.join("\n");
      }}
    />
  );
}
