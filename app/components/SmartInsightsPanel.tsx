"use client";

import { useState } from "react";
import type { LookupResult } from "@/lib/types";

interface Insight {
  title: string;
  detail: string;
  action: string;
  severity: "info" | "warning" | "critical";
}

function deriveInsights(result: LookupResult): Insight[] {
  const insights: Insight[] = [];

  // IP reputation
  const abuse = result.ipReputation.abuseConfidenceScore;
  if (abuse >= 50) {
    insights.push({
      title: "High abuse confidence score",
      detail: `AbuseIPDB reports ${abuse}% abuse confidence — this IP has been flagged by multiple sources.`,
      action: "Block this IP in your firewall and investigate any existing connections.",
      severity: "critical",
    });
  } else if (abuse >= 10) {
    insights.push({
      title: "Moderate abuse reports",
      detail: `This IP has a ${abuse}% abuse confidence score, indicating some suspicious activity.`,
      action: "Monitor traffic from this IP and check related logs.",
      severity: "warning",
    });
  }

  // Blacklist
  const listed = result.blacklist.listedCount;
  if (listed > 2) {
    insights.push({
      title: "Listed on multiple blacklists",
      detail: `Found on ${listed} out of ${result.blacklist.totalChecked} blacklists. High risk of being blocked by email servers.`,
      action: "Investigate and delist from blacklists if legitimate. Avoid sending email from this address.",
      severity: "critical",
    });
  } else if (listed === 1 || listed === 2) {
    insights.push({
      title: "Listed on a blacklist",
      detail: `Found on ${listed} blacklist${listed > 1 ? "s" : ""}. May affect email deliverability or reputation.`,
      action: "Submit a delisting request and investigate root cause.",
      severity: "warning",
    });
  }

  // SSL certificate
  const ssl = result.ssl;
  if (ssl.daysRemaining < 0) {
    insights.push({
      title: "SSL certificate expired",
      detail: `The SSL certificate expired ${Math.abs(ssl.daysRemaining)} days ago. Users will see security warnings.`,
      action: "Renew the SSL certificate immediately. Use Let's Encrypt for free automated renewal.",
      severity: "critical",
    });
  } else if (ssl.daysRemaining < 14) {
    insights.push({
      title: "SSL certificate expiring soon",
      detail: `Certificate expires in ${ssl.daysRemaining} days.`,
      action: "Renew the certificate now to avoid interruptions.",
      severity: "warning",
    });
  } else if (ssl.daysRemaining < 30) {
    insights.push({
      title: "SSL certificate expires within 30 days",
      detail: `Certificate expires in ${ssl.daysRemaining} days.`,
      action: "Schedule a certificate renewal in the next few days.",
      severity: "info",
    });
  }

  // Security headers
  const headers = result.securityHeaders;
  if (headers.score < 40) {
    insights.push({
      title: "Critical security headers missing",
      detail: `Security header score is ${headers.score}/100 (grade ${headers.grade}). Key protections like CSP or HSTS are absent.`,
      action: "Add Content-Security-Policy, Strict-Transport-Security, and X-Frame-Options headers.",
      severity: "critical",
    });
  } else if (headers.score < 70) {
    insights.push({
      title: "Security headers can be improved",
      detail: `Security header score is ${headers.score}/100. Some recommended headers are missing.`,
      action: "Review missing headers and add them to your server or CDN configuration.",
      severity: "warning",
    });
  }

  // Domain reputation
  const domain = result.domainReputation;
  if (domain.malicious > 0) {
    insights.push({
      title: "Domain flagged as malicious",
      detail: `${domain.malicious} security vendor${domain.malicious > 1 ? "s" : ""} flagged this domain as malicious.`,
      action: "Investigate immediately. Do not interact with this domain.",
      severity: "critical",
    });
  } else if (domain.suspicious > 0) {
    insights.push({
      title: "Domain flagged as suspicious",
      detail: `${domain.suspicious} vendor${domain.suspicious > 1 ? "s" : ""} flagged this domain as suspicious.`,
      action: "Exercise caution. Investigate before proceeding.",
      severity: "warning",
    });
  }

  // Open ports
  const openPorts = result.openPorts.ports.filter((p) => p.state === "open");
  const riskyPorts = openPorts.filter((p) =>
    [21, 23, 25, 139, 445, 3389, 1433, 3306].includes(p.port),
  );
  if (riskyPorts.length > 0) {
    insights.push({
      title: "Potentially dangerous ports open",
      detail: `Ports ${riskyPorts.map((p) => p.port).join(", ")} are open. These may expose sensitive services.`,
      action: "Close or firewall unused ports. Use VPN for remote access instead of exposing RDP/SSH.",
      severity: "warning",
    });
  }

  // All clear
  if (insights.length === 0) {
    insights.push({
      title: "No significant threats detected",
      detail: "This target appears clean across all checked categories.",
      action: "Continue monitoring periodically and re-scan if behaviour changes.",
      severity: "info",
    });
  }

  return insights;
}

// ---------------------------------------------------------------------------
// Plain-language client-mode text
// ---------------------------------------------------------------------------

function toClientLanguage(insight: Insight): { headline: string; body: string } {
  switch (insight.severity) {
    case "critical":
      return {
        headline: "⚠️ Action needed",
        body: `This could cause real problems. ${insight.action}`,
      };
    case "warning":
      return {
        headline: "📋 Worth reviewing",
        body: `Nothing urgent, but it's worth looking at. ${insight.action}`,
      };
    default:
      return {
        headline: "✅ Looks good",
        body: insight.detail,
      };
  }
}

const SEVERITY_STYLES: Record<Insight["severity"], { border: string; icon: string; badge: string }> = {
  critical: {
    border: "border-red-500/30 bg-red-500/5",
    icon: "text-red-400",
    badge: "bg-red-500/15 text-red-400",
  },
  warning: {
    border: "border-amber-500/30 bg-amber-500/5",
    icon: "text-amber-400",
    badge: "bg-amber-500/15 text-amber-400",
  },
  info: {
    border: "border-cyan-500/20 bg-cyan-500/5",
    icon: "text-cyan-400",
    badge: "bg-cyan-500/15 text-cyan-400",
  },
};

function SeverityIcon({ severity }: { severity: Insight["severity"] }) {
  if (severity === "critical") {
    return (
      <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
      </svg>
    );
  }
  if (severity === "warning") {
    return (
      <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
      </svg>
    );
  }
  return (
    <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
    </svg>
  );
}

export function SmartInsightsPanel({ result }: { result: LookupResult }) {
  const insights = deriveInsights(result);
  const [clientMode, setClientMode] = useState(false);

  return (
    <div className="rounded-2xl bg-[#0d1321] border border-[#1e2d4a] p-5 animate-fade-in">
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <svg className="w-4 h-4 text-cyan-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
        </svg>
        <h3 className="text-sm font-semibold text-slate-200">Smart Insights</h3>
        <span className="text-xs text-slate-500">{insights.length} finding{insights.length !== 1 ? "s" : ""}</span>

        {/* Client-mode toggle */}
        <button
          type="button"
          onClick={() => setClientMode((v) => !v)}
          className={`ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-200 btn-micro ${
            clientMode
              ? "bg-purple-500/15 border-purple-500/30 text-purple-300"
              : "bg-slate-700/40 border-[#1e2d4a] text-slate-400 hover:text-slate-200 hover:bg-slate-700/60"
          }`}
          title="Toggle plain-language client view"
        >
          <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
          </svg>
          {clientMode ? "Client view" : "Explain like a client"}
        </button>
      </div>

      <div className="space-y-3">
        {insights.map((insight, i) => {
          const styles = SEVERITY_STYLES[insight.severity];
          if (clientMode) {
            const plain = toClientLanguage(insight);
            return (
              <div key={i} className={`rounded-xl border p-3.5 ${styles.border} animate-scale-in`}>
                <p className="text-sm font-semibold text-slate-200 mb-1">{plain.headline}</p>
                <p className="text-xs text-slate-400 leading-relaxed">{plain.body}</p>
              </div>
            );
          }
          return (
            <div key={i} className={`rounded-xl border p-3.5 ${styles.border}`}>
              <div className="flex items-start gap-2.5">
                <span className={`mt-0.5 shrink-0 ${styles.icon}`}>
                  <SeverityIcon severity={insight.severity} />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium text-slate-200">{insight.title}</p>
                    <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${styles.badge}`}>
                      {insight.severity}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{insight.detail}</p>
                  <div className="mt-2 flex items-start gap-1.5">
                    <svg className="w-3.5 h-3.5 text-slate-500 mt-0.5 shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
                    </svg>
                    <p className="text-xs text-slate-500">{insight.action}</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
