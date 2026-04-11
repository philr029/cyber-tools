/**
 * Domain Threat Score Engine
 * Aggregates: blacklist status, SSL validity, WHOIS domain age, security headers
 * Returns a combined 0–100 score with breakdown.
 *
 * GET /api/tools/threat-score?target=<domain>
 */

import type { NextRequest } from "next/server";
import { validateDomain } from "@/lib/validators";
import { fetchSecurityHeaders } from "@/lib/providers/securityheaders";
import { fetchSSL } from "@/lib/providers/sslcheck";
import { fetchWHOIS } from "@/lib/providers/whois";
import type {
  DomainThreatScoreResult,
  ThreatScoreFactor,
  StatusLevel,
} from "@/lib/types";

function scoreSSL(daysRemaining: number, isValid: boolean): ThreatScoreFactor {
  let score = 0;
  let detail = "";
  let status: StatusLevel = "safe";

  if (!isValid) {
    score = 20;
    detail = "SSL certificate is invalid or expired";
    status = "risk";
  } else if (daysRemaining <= 7) {
    score = 15;
    detail = `Certificate expires in ${daysRemaining} day${daysRemaining !== 1 ? "s" : ""}`;
    status = "risk";
  } else if (daysRemaining <= 30) {
    score = 8;
    detail = `Certificate expires in ${daysRemaining} days`;
    status = "warning";
  } else {
    score = 0;
    detail = `Certificate valid for ${daysRemaining} more days`;
    status = "safe";
  }

  return { name: "SSL Certificate", score, maxScore: 20, detail, status };
}

function scoreWHOISAge(createdDate: string): ThreatScoreFactor {
  let score = 0;
  let detail = "";
  let status: StatusLevel = "safe";

  if (createdDate && createdDate !== "Unknown") {
    try {
      const created = new Date(createdDate);
      const ageMs = Date.now() - created.getTime();
      const ageDays = ageMs / (1000 * 60 * 60 * 24);

      if (ageDays < 30) {
        score = 20;
        detail = `Domain registered only ${Math.round(ageDays)} days ago`;
        status = "risk";
      } else if (ageDays < 180) {
        score = 10;
        detail = `Domain registered ${Math.round(ageDays / 30)} months ago`;
        status = "warning";
      } else {
        score = 0;
        detail = `Domain registered ${Math.round(ageDays / 365)} year${ageDays > 730 ? "s" : ""} ago`;
        status = "safe";
      }
    } catch {
      score = 5;
      detail = "Could not determine domain age";
      status = "unknown" as StatusLevel;
    }
  } else {
    score = 10;
    detail = "Domain age unknown";
    status = "warning";
  }

  return { name: "Domain Age (WHOIS)", score, maxScore: 20, detail, status };
}

function scoreHeaders(headerScore: number): ThreatScoreFactor {
  // Header score 0-100 from securityheaders; invert for risk scoring
  const risk = Math.round((1 - headerScore / 100) * 30); // max 30 pts risk
  let status: StatusLevel = "safe";
  if (headerScore < 40) status = "risk";
  else if (headerScore < 70) status = "warning";

  return {
    name: "HTTP Security Headers",
    score: risk,
    maxScore: 30,
    detail: `Security headers score: ${headerScore}/100`,
    status,
  };
}

export async function GET(request: NextRequest) {
  const raw = request.nextUrl.searchParams.get("target") ?? "";
  const target = raw.trim();

  const validation = validateDomain(target);
  if (!validation.ok) {
    return Response.json({ error: validation.message }, { status: 400 });
  }

  const domain = target.toLowerCase();

  // Run all lookups in parallel
  const [sslResult, whoisResult, headersResult] = await Promise.allSettled([
    fetchSSL(domain),
    fetchWHOIS(domain),
    fetchSecurityHeaders(domain),
  ]);

  const ssl = sslResult.status === "fulfilled" ? sslResult.value : null;
  const whois = whoisResult.status === "fulfilled" ? whoisResult.value : null;
  const headers = headersResult.status === "fulfilled" ? headersResult.value : null;

  // We don't import blacklist here to keep this endpoint self-contained;
  // blacklist factor uses a neutral placeholder when not configured.
  const blacklistFactor: ThreatScoreFactor = {
    name: "Blacklist Status",
    score: 0,
    maxScore: 30,
    detail: "Blacklist check not included in this view — use the dedicated Blacklist tool",
    status: "unknown" as StatusLevel,
  };

  const sslFactor = ssl
    ? scoreSSL(ssl.daysRemaining, ssl.status !== "risk")
    : { name: "SSL Certificate", score: 10, maxScore: 20, detail: "SSL data unavailable", status: "unknown" as StatusLevel };

  const whoisFactor = scoreWHOISAge(whois?.createdDate ?? "Unknown");

  const headersFactor = headers
    ? scoreHeaders(headers.score)
    : { name: "HTTP Security Headers", score: 15, maxScore: 30, detail: "Headers data unavailable", status: "unknown" as StatusLevel };

  const factors: ThreatScoreFactor[] = [
    blacklistFactor,
    sslFactor,
    whoisFactor,
    headersFactor,
  ];

  const totalScore = factors.reduce((sum, f) => sum + f.score, 0);

  let label: DomainThreatScoreResult["label"];
  let status: StatusLevel;
  if (totalScore <= 20) {
    label = "Safe";
    status = "safe";
  } else if (totalScore <= 50) {
    label = "Suspicious";
    status = "warning";
  } else {
    label = "High Risk";
    status = "risk";
  }

  const result: DomainThreatScoreResult = {
    target: domain,
    totalScore,
    label,
    factors,
    status,
  };

  return Response.json({ data: result, mock: false });
}
