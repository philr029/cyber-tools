/**
 * Unified lookup client used by all tool pages.
 *
 * All functions call the corresponding /api/lookup/* server-side route, which
 * runs as a Vercel serverless function. API keys are configured as environment
 * variables in the Vercel project dashboard (never exposed to the browser).
 *
 * When an API key is not configured, the server route returns the result with
 * mock: true and safe default values. The UI reflects this with a "Not
 * configured" badge so users can clearly see which lookups are live.
 */

import type {
  IPReputationResult,
  DomainReputationResult,
  BlacklistResult,
  SSLCertificateResult,
  SecurityHeadersResult,
  DNSResult,
  WHOISResult,
  URLAnalysisResult,
  OpenPortsResult,
  LookupResult,
} from "@/lib/types";
import { isValidIP } from "@/lib/validators";

// ---------------------------------------------------------------------------
// Default result shapes used as fallbacks inside lookupAll when a promise
// rejects (e.g. network error). These are NOT used for the mock path — that
// fallback happens server-side in the API routes.
// ---------------------------------------------------------------------------

function defaultIP(ip: string): IPReputationResult {
  return {
    ipAddress: ip,
    abuseConfidenceScore: 0,
    isp: "Unknown",
    usageType: "Unknown",
    country: "Unknown",
    countryCode: "--",
    totalReports: 0,
    lastReportedAt: null,
    status: "unknown",
  };
}

function defaultDomain(domain: string): DomainReputationResult {
  return {
    domain,
    malicious: 0,
    suspicious: 0,
    undetected: 0,
    harmless: 0,
    categories: [],
    registrar: "Unknown",
    createdDate: "Unknown",
    status: "unknown",
  };
}

function defaultBlacklist(target: string): BlacklistResult {
  return {
    target,
    entries: [
      { source: "Spamhaus ZEN", listed: false, detail: "Not listed" },
      { source: "SURBL", listed: false, detail: "Not listed" },
      { source: "Barracuda", listed: false, detail: "Not listed" },
      { source: "SpamCop", listed: false, detail: "Not listed" },
      { source: "UCEPROTECT", listed: false, detail: "Not listed" },
    ],
    listedCount: 0,
    totalChecked: 5,
    status: "unknown",
  };
}

function defaultSSL(domain: string): SSLCertificateResult {
  return {
    domain,
    issuer: "Unknown",
    validFrom: "Unknown",
    validTo: "Unknown",
    daysRemaining: 0,
    protocol: "Unknown",
    keySize: 0,
    signatureAlgorithm: "Unknown",
    subjectAltNames: [],
    status: "unknown",
  };
}

const DEFAULT_HEADER_NAMES = [
  { name: "Strict-Transport-Security", description: "Forces HTTPS connections" },
  { name: "Content-Security-Policy", description: "Prevents XSS and injection attacks" },
  { name: "X-Frame-Options", description: "Prevents clickjacking" },
  { name: "X-Content-Type-Options", description: "Prevents MIME sniffing" },
  { name: "Referrer-Policy", description: "Controls referrer information" },
  { name: "Permissions-Policy", description: "Controls browser features" },
  { name: "Cross-Origin-Opener-Policy", description: "Prevents cross-origin documents from sharing browsing context" },
  { name: "Cross-Origin-Resource-Policy", description: "Controls which origins can embed this resource" },
];

function defaultHeaders(domain: string): SecurityHeadersResult {
  return {
    domain,
    score: 0,
    grade: "N/A",
    headers: DEFAULT_HEADER_NAMES.map((h) => ({
      ...h,
      present: false,
      value: null,
    })),
    status: "unknown",
  };
}

function defaultDNS(domain: string): DNSResult {
  return {
    domain,
    records: [],
    nameservers: [],
    reverseDNS: null,
    status: "unknown",
  };
}

function defaultPorts(target: string): OpenPortsResult {
  return {
    target,
    openCount: 0,
    ports: [],
    scanDuration: 0,
    status: "unknown",
  };
}

// ---------------------------------------------------------------------------
// Generic API fetch helper
// ---------------------------------------------------------------------------

async function apiLookup<T>(url: string): Promise<{ data: T; mock: boolean }> {
  const res = await fetch(url);
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error ?? `Lookup failed (${url}).`);
  }
  return json as { data: T; mock: boolean };
}

// ---------------------------------------------------------------------------
// Public lookup functions — each calls the corresponding server route
// ---------------------------------------------------------------------------

// lookupIP uses a dedicated fetch rather than apiLookup because the /api/lookup/ip
// route returns a flat response object (not the standard { data, mock } envelope)
// and requires score-based status computation on the client side.
export async function lookupIP(ip: string): Promise<{ data: IPReputationResult; mock: boolean }> {
  const url = `/api/lookup/ip?ip=${encodeURIComponent(ip)}`;
  const res = await fetch(url);
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error ?? `Lookup failed (${url}).`);
  }
  const isMock: boolean = json.mock === true;
  const score: number = json.abuseConfidenceScore ?? 0;
  const data: IPReputationResult = {
    ipAddress: json.ip ?? ip,
    abuseConfidenceScore: score,
    isp: json.isp ?? "Unknown",
    usageType: json.usageType ?? "Unknown",
    country: json.countryCode ?? "--",
    countryCode: json.countryCode ?? "--",
    totalReports: json.totalReports ?? 0,
    lastReportedAt: null,
    status: score >= 50 ? "risk" : score >= 20 ? "warning" : "safe",
  };
  return { data, mock: isMock };
}

export function lookupDomain(domain: string): Promise<{ data: DomainReputationResult; mock: boolean }> {
  return apiLookup<DomainReputationResult>(`/api/lookup/domain?domain=${encodeURIComponent(domain)}`);
}

export function lookupBlacklist(target: string): Promise<{ data: BlacklistResult; mock: boolean }> {
  return apiLookup<BlacklistResult>(`/api/lookup/blacklist?target=${encodeURIComponent(target)}`);
}

export function lookupSSL(domain: string): Promise<{ data: SSLCertificateResult; mock: boolean }> {
  return apiLookup<SSLCertificateResult>(`/api/lookup/ssl?domain=${encodeURIComponent(domain)}`);
}

export function lookupHeaders(domain: string): Promise<{ data: SecurityHeadersResult; mock: boolean }> {
  return apiLookup<SecurityHeadersResult>(`/api/lookup/headers?domain=${encodeURIComponent(domain)}`);
}

export function lookupDNS(domain: string): Promise<{ data: DNSResult; mock: boolean }> {
  return apiLookup<DNSResult>(`/api/lookup/dns?domain=${encodeURIComponent(domain)}`);
}

export function lookupWHOIS(domain: string): Promise<{ data: WHOISResult; mock: boolean }> {
  return apiLookup<WHOISResult>(`/api/lookup/whois?domain=${encodeURIComponent(domain)}`);
}

export function lookupURL(url: string): Promise<{ data: URLAnalysisResult; mock: boolean }> {
  return apiLookup<URLAnalysisResult>(`/api/lookup/url?url=${encodeURIComponent(url)}`);
}

export function lookupPorts(target: string): Promise<{ data: OpenPortsResult; mock: boolean }> {
  return apiLookup<OpenPortsResult>(`/api/lookup/ports?target=${encodeURIComponent(target)}`);
}

// ---------------------------------------------------------------------------
// Unified lookup: runs all relevant lookups in parallel for the dashboard
// ---------------------------------------------------------------------------

function settled<T>(
  result: PromiseSettledResult<{ data: T; mock: boolean }>,
  fallback: T,
): { data: T; mock: boolean } {
  return result.status === "fulfilled" ? result.value : { data: fallback, mock: true };
}

export async function lookupAll(
  query: string,
): Promise<{ result: LookupResult; isMock: boolean }> {
  const target = query.trim();
  const ipQuery = isValidIP(target);

  // Run relevant lookups in parallel; return defaults for inapplicable ones.
  const [ipRes, domainRes, blacklistRes, sslRes, headersRes, dnsRes, portsRes] =
    await Promise.allSettled([
      ipQuery
        ? lookupIP(target)
        : Promise.resolve({ data: defaultIP(target), mock: true }),
      !ipQuery
        ? lookupDomain(target)
        : Promise.resolve({ data: defaultDomain(target), mock: true }),
      lookupBlacklist(target),
      !ipQuery
        ? lookupSSL(target)
        : Promise.resolve({ data: defaultSSL(target), mock: true }),
      !ipQuery
        ? lookupHeaders(target)
        : Promise.resolve({ data: defaultHeaders(target), mock: true }),
      !ipQuery
        ? lookupDNS(target)
        : Promise.resolve({ data: defaultDNS(target), mock: true }),
      ipQuery
        ? lookupPorts(target)
        : Promise.resolve({ data: defaultPorts(target), mock: true }),
    ]);

  const ip = settled(ipRes, defaultIP(target));
  const domain = settled(domainRes, defaultDomain(target));
  const blacklist = settled(blacklistRes, defaultBlacklist(target));
  const ssl = settled(sslRes, defaultSSL(target));
  const headers = settled(headersRes, defaultHeaders(target));
  const dns = settled(dnsRes, defaultDNS(target));
  const ports = settled(portsRes, defaultPorts(target));

  // Only consider lookups that actually ran for this query type.
  // Domain/SSL/headers/DNS are intentionally skipped for IP queries (they
  // resolve to default values with mock:true), so including them would force
  // isMock=true even when the IP reputation itself came from a live API call.
  const relevantResults = ipQuery
    ? [ip]
    : [domain, blacklist, ssl, headers, dns];
  const isMock = relevantResults.some((r) => r.mock);

  const result: LookupResult = {
    query: target,
    timestamp: new Date().toISOString(),
    ipReputation: ip.data,
    domainReputation: domain.data,
    blacklist: blacklist.data,
    ssl: ssl.data,
    securityHeaders: headers.data,
    openPorts: ports.data,
    dns: dns.data,
  };

  return { result, isMock };
}
