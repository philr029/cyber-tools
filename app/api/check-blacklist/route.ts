import { NextRequest, NextResponse } from "next/server";
import { resolve4 } from "node:dns/promises";

interface MxToolboxBlacklistResponse {
  Failed: { Name: string; Info: string }[];
  Passed: { Name: string; Info: string }[];
  // Additional fields omitted — only Failed/Passed are needed.
}

interface MonitoredTarget {
  domain: string;
  campaignId?: string;
  emailAccountId?: string;
}

interface TargetResult {
  domain: string;
  ip?: string;
  passed: number;
  failed: number;
  total: number;
  criticalHits: string[];
  warningHits: string[];
  health: "Excellent" | "Warning" | "Critical" | "Error";
  summary: string;
  action?: {
    pausedCampaign?: boolean;
    pauseDetails?: string;
    disabledEmailAccount?: boolean;
    disableDetails?: string;
  };
  error?: string;
}

const INSTANTLY_API_BASE = "https://api.instantly.ai/api/v2";
const CRITICAL_RBL_PATTERNS = [/spamhaus/i, /barracuda/i, /spamcop/i];

function parseJson<T>(value: string | undefined): T | null {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

function parseMonitoredTargets(): MonitoredTarget[] {
  const explicitTargets = parseJson<MonitoredTarget[]>(process.env.MONITORED_TARGETS);
  if (Array.isArray(explicitTargets) && explicitTargets.length > 0) {
    return explicitTargets.filter((t) => t?.domain?.trim());
  }

  const domainCsv = process.env.MONITORED_DOMAINS || process.env.MONITORED_DOMAIN || "";
  const domains = domainCsv
    .split(",")
    .map((domain) => domain.trim())
    .filter(Boolean);

  const sharedCampaignId = process.env.CAMPAIGN_ID;
  const emailAccountMap = parseJson<Record<string, string>>(process.env.INSTANTLY_EMAIL_ACCOUNT_MAP) || {};

  return domains.map((domain) => ({
    domain,
    campaignId: sharedCampaignId,
    emailAccountId: emailAccountMap[domain],
  }));
}

function classifyBlacklistHits(failed: { Name: string; Info: string }[]) {
  const criticalHits: string[] = [];
  const warningHits: string[] = [];

  for (const hit of failed) {
    const haystack = `${hit.Name} ${hit.Info}`;
    if (CRITICAL_RBL_PATTERNS.some((pattern) => pattern.test(haystack))) {
      criticalHits.push(hit.Name);
    } else {
      warningHits.push(hit.Name);
    }
  }

  return { criticalHits, warningHits };
}

async function sendSlackAlert(text: string) {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  if (!webhookUrl) {
    return;
  }

  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
  } catch (err) {
    console.error("Failed to send Slack alert:", err);
  }
}

async function sendEmailAlert(subject: string, body: string) {
  const alertWebhookUrl = process.env.ALERT_EMAIL_WEBHOOK_URL;
  if (alertWebhookUrl) {
    try {
      await fetch(alertWebhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, body }),
      });
    } catch (err) {
      console.error("Failed to send alert email via webhook:", err);
    }
    return;
  }

  const resendApiKey = process.env.RESEND_API_KEY;
  const alertFrom = process.env.ALERT_EMAIL_FROM;
  const alertTo = process.env.ALERT_EMAIL_TO;
  if (!resendApiKey || !alertFrom || !alertTo) {
    return;
  }

  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: alertFrom,
        to: [alertTo],
        subject,
        text: body,
      }),
    });
  } catch (err) {
    console.error("Failed to send alert email via Resend:", err);
  }
}

async function sendOpsAlert({
  severity,
  domain,
  ip,
  failed,
}: {
  severity: "CRITICAL" | "WARNING";
  domain: string;
  ip: string;
  failed: string[];
}) {
  const title = severity === "CRITICAL" ? "URGENT: Deliverability Circuit Breaker Triggered" : "Monitor & Warm Up Advisory";
  const message =
    severity === "CRITICAL"
      ? `Critical blacklist hit detected for ${domain} (${ip}): ${failed.join(", ")}. Campaign paused and sender disabled.`
      : `Warning blacklist hit detected for ${domain} (${ip}): ${failed.join(", ")}. Monitor and warm up recommended.`;

  await Promise.allSettled([sendSlackAlert(`*${title}*\n${message}`), sendEmailAlert(title, message)]);
}

async function pauseCampaign(campaignId: string, instantlyApiKey: string) {
  const response = await fetch(`${INSTANTLY_API_BASE}/campaigns/${encodeURIComponent(campaignId)}/pause`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${instantlyApiKey}`,
      "Content-Type": "application/json",
    },
  });

  if (response.status === 409) {
    return { ok: true, details: "already_paused" };
  }

  if (!response.ok) {
    const details = await response.text();
    return { ok: false, details: `pause_failed_${response.status}: ${details}` };
  }

  return { ok: true, details: "paused" };
}

async function disableEmailAccount(campaignId: string, emailAccountId: string, instantlyApiKey: string) {
  const candidateEndpoints = [
    `${INSTANTLY_API_BASE}/campaigns/${encodeURIComponent(campaignId)}/accounts/${encodeURIComponent(emailAccountId)}/disable`,
    `${INSTANTLY_API_BASE}/campaigns/${encodeURIComponent(campaignId)}/email-accounts/${encodeURIComponent(emailAccountId)}/disable`,
    `${INSTANTLY_API_BASE}/email-accounts/${encodeURIComponent(emailAccountId)}/disable`,
  ];

  for (const endpoint of candidateEndpoints) {
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${instantlyApiKey}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok || response.status === 409) {
        return {
          ok: true,
          details: response.status === 409 ? "already_disabled" : `disabled_via_${endpoint}`,
        };
      }
    } catch (err) {
      console.error(`Failed to call Instantly disable endpoint "${endpoint}":`, err);
    }
  }

  return { ok: false, details: "disable_failed_all_v2_endpoints" };
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const mxToolboxApiKey = process.env.MX_TOOLBOX_API_KEY;
  const instantlyApiKey = process.env.INSTANTLY_API_KEY;
  const targets = parseMonitoredTargets();

  if (!mxToolboxApiKey || !instantlyApiKey || targets.length === 0) {
    return NextResponse.json(
      {
        error:
          "Missing required environment variables. Required: MX_TOOLBOX_API_KEY, INSTANTLY_API_KEY, and MONITORED_TARGETS or MONITORED_DOMAINS.",
      },
      { status: 500 },
    );
  }

  const results: TargetResult[] = [];

  for (const target of targets) {
    const domain = target.domain;

    let sendingIp: string | undefined;
    try {
      const addresses = await resolve4(domain);
      sendingIp = addresses[0];
      console.log(`Resolved "${domain}" → ${sendingIp}`);
  } catch (err) {
    console.error(`DNS A-record lookup failed for "${domain}":`, err);
    results.push({
      domain,
      passed: 0,
      failed: 0,
      total: 0,
      criticalHits: [],
      warningHits: [],
      health: "Error",
      summary: `Target: ${domain} | Status: DNS Lookup Failed | Health: Error.`,
      error: `DNS A-record lookup failed for "${domain}".`,
    });
    continue;
  }

    if (!sendingIp) {
      results.push({
        domain,
        passed: 0,
        failed: 0,
        total: 0,
        criticalHits: [],
        warningHits: [],
        health: "Error",
        summary: `Target: ${domain} | Status: DNS Lookup Failed | Health: Error.`,
        error: `No IPv4 address resolved for "${domain}".`,
      });
      continue;
    }

    let blacklistData: MxToolboxBlacklistResponse;
    try {
      const mxRes = await fetch(`https://api.mxtoolbox.com/api/v1/lookup/blacklist/${encodeURIComponent(sendingIp)}`, {
        headers: { Authorization: mxToolboxApiKey },
      });

      if (!mxRes.ok) {
        const errorText = await mxRes.text();
        console.error(`MX Toolbox API error for "${domain}" (${mxRes.status}): ${errorText}`);
        results.push({
          domain,
          ip: sendingIp,
          passed: 0,
          failed: 0,
          total: 0,
          criticalHits: [],
          warningHits: [],
          health: "Error",
          summary: `Target: ${domain} | Status: MX Lookup Failed | Health: Error.`,
          error: `MX Toolbox API request failed (${mxRes.status}).`,
        });
        continue;
      }

      blacklistData = (await mxRes.json()) as MxToolboxBlacklistResponse;
    } catch (err) {
      console.error(`Failed to reach MX Toolbox API for "${domain}":`, err);
      results.push({
        domain,
        ip: sendingIp,
        passed: 0,
        failed: 0,
        total: 0,
        criticalHits: [],
        warningHits: [],
        health: "Error",
        summary: `Target: ${domain} | Status: MX Lookup Failed | Health: Error.`,
        error: "Failed to reach MX Toolbox API.",
      });
      continue;
    }

    const failedCount = blacklistData.Failed?.length ?? 0;
    const passedCount = blacklistData.Passed?.length ?? 0;
    const totalCount = passedCount + failedCount;
    const { criticalHits, warningHits } = classifyBlacklistHits(blacklistData.Failed ?? []);

    if (criticalHits.length > 0) {
      console.warn(
        `Critical blacklist hit for "${domain}" (${sendingIp}): ${criticalHits.join(", ")}`,
      );

      const action: TargetResult["action"] = {};
      const campaignId = target.campaignId;

      if (!campaignId) {
        action.pausedCampaign = false;
        action.pauseDetails = "missing_campaign_id";
      } else {
        const pauseResult = await pauseCampaign(campaignId, instantlyApiKey);
        action.pausedCampaign = pauseResult.ok;
        action.pauseDetails = pauseResult.details;
      }

      if (!target.emailAccountId || !campaignId) {
        action.disabledEmailAccount = false;
        action.disableDetails = !target.emailAccountId ? "missing_email_account_id" : "missing_campaign_id";
      } else {
        const disableResult = await disableEmailAccount(campaignId, target.emailAccountId, instantlyApiKey);
        action.disabledEmailAccount = disableResult.ok;
        action.disableDetails = disableResult.details;
      }

      await sendOpsAlert({
        severity: "CRITICAL",
        domain,
        ip: sendingIp,
        failed: criticalHits,
      });

      results.push({
        domain,
        ip: sendingIp,
        passed: passedCount,
        failed: failedCount,
        total: totalCount,
        criticalHits,
        warningHits,
        health: "Critical",
        summary: `Target: ${domain} | Status: ${passedCount}/${totalCount} Clean | Health: Critical (${criticalHits.length} critical hit(s)).`,
        action,
      });
      continue;
    }

    if (warningHits.length > 0) {
      console.warn(
        `Warning blacklist hit for "${domain}" (${sendingIp}): ${warningHits.join(", ")}`,
      );
      await sendOpsAlert({
        severity: "WARNING",
        domain,
        ip: sendingIp,
        failed: warningHits,
      });

      results.push({
        domain,
        ip: sendingIp,
        passed: passedCount,
        failed: failedCount,
        total: totalCount,
        criticalHits,
        warningHits,
        health: "Warning",
        summary: `Target: ${domain} | Status: ${passedCount}/${totalCount} Clean | Health: Warning (${warningHits.length} warning hit(s)).`,
      });
      continue;
    }

    results.push({
      domain,
      ip: sendingIp,
      passed: passedCount,
      failed: failedCount,
      total: totalCount,
      criticalHits,
      warningHits,
      health: "Excellent",
      summary: `Target: ${domain} | Status: ${passedCount}/${totalCount} Clean | Health: Excellent.`,
    });
  }

  console.log("=== Daily Blacklist Summary ===");
  for (const result of results) {
    console.log(result.summary);
  }
  console.log("=== End Daily Blacklist Summary ===");

  const criticalTargets = results.filter((r) => r.health === "Critical").length;
  const warningTargets = results.filter((r) => r.health === "Warning").length;
  const errorTargets = results.filter((r) => r.health === "Error").length;

  return NextResponse.json({
    status: criticalTargets > 0 ? "critical" : warningTargets > 0 ? "warning" : "clean",
    totals: {
      targets: results.length,
      critical: criticalTargets,
      warning: warningTargets,
      errors: errorTargets,
    },
    results,
  });
}
