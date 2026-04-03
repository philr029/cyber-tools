/**
 * Unified lookup client used by all tool pages.
 *
 * When NEXT_PUBLIC_USE_MOCK_API=true (GitHub Pages static build) every
 * function returns mock data immediately instead of calling a server-side
 * API route. This keeps the static export fully functional as a live demo.
 *
 * When the env var is unset (Vercel / local dev) the functions call the
 * corresponding /api/lookup/* route, which in turn uses a real API provider
 * or falls back to mock data server-side.
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
} from "@/lib/types";
import { MOCK_RESULTS } from "@/lib/mockData";
import { MOCK_WHOIS, MOCK_URL_ANALYSIS, createDefaultWHOIS, createDefaultURLAnalysis } from "@/lib/mockExtras";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_API === "true";

function delay(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

function getMock(query: string) {
  return MOCK_RESULTS[query.trim().toLowerCase()];
}

// Default mock result shapes used when a query isn't in MOCK_RESULTS

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

// ---------------------------------------------------------------------------
// Mock lookup implementations
// ---------------------------------------------------------------------------

async function mockIP(ip: string): Promise<{ data: IPReputationResult; mock: true }> {
  await delay(600);
  const data = getMock(ip)?.ipReputation ?? defaultIP(ip);
  return { data, mock: true };
}

async function mockDomain(domain: string): Promise<{ data: DomainReputationResult; mock: true }> {
  await delay(600);
  const data = getMock(domain)?.domainReputation ?? defaultDomain(domain);
  return { data, mock: true };
}

async function mockBlacklist(target: string): Promise<{ data: BlacklistResult; mock: true }> {
  await delay(600);
  const data = getMock(target)?.blacklist ?? defaultBlacklist(target);
  return { data, mock: true };
}

async function mockSSL(domain: string): Promise<{ data: SSLCertificateResult; mock: true }> {
  await delay(600);
  const data = getMock(domain)?.ssl ?? defaultSSL(domain);
  return { data, mock: true };
}

async function mockHeaders(domain: string): Promise<{ data: SecurityHeadersResult; mock: true }> {
  await delay(600);
  const data = getMock(domain)?.securityHeaders ?? defaultHeaders(domain);
  return { data, mock: true };
}

async function mockDNS(domain: string): Promise<{ data: DNSResult; mock: true }> {
  await delay(600);
  const data = getMock(domain)?.dns ?? defaultDNS(domain);
  return { data, mock: true };
}

async function mockWHOIS(domain: string): Promise<{ data: WHOISResult; mock: true }> {
  await delay(600);
  const data = MOCK_WHOIS[domain.toLowerCase()] ?? createDefaultWHOIS(domain);
  return { data, mock: true };
}

async function mockURL(url: string): Promise<{ data: URLAnalysisResult; mock: true }> {
  await delay(600);
  let normalised = url;
  if (!normalised.startsWith("http://") && !normalised.startsWith("https://")) {
    normalised = `https://${normalised}`;
  }
  const data =
    MOCK_URL_ANALYSIS[normalised] ??
    MOCK_URL_ANALYSIS[normalised.replace("https://", "http://")] ??
    createDefaultURLAnalysis(url);
  return { data, mock: true };
}

// ---------------------------------------------------------------------------
// API-backed lookup implementations
// ---------------------------------------------------------------------------

async function apiLookup<T>(url: string): Promise<{ data: T; mock: boolean }> {
  const res = await fetch(url);
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? "Lookup failed.");
  return json as { data: T; mock: boolean };
}

// ---------------------------------------------------------------------------
// Public exports
// ---------------------------------------------------------------------------

export function lookupIP(ip: string): Promise<{ data: IPReputationResult; mock: boolean }> {
  if (USE_MOCK) return mockIP(ip);
  return apiLookup<IPReputationResult>(`/api/lookup/ip?ip=${encodeURIComponent(ip)}`);
}

export function lookupDomain(domain: string): Promise<{ data: DomainReputationResult; mock: boolean }> {
  if (USE_MOCK) return mockDomain(domain);
  return apiLookup<DomainReputationResult>(`/api/lookup/domain?domain=${encodeURIComponent(domain)}`);
}

export function lookupBlacklist(target: string): Promise<{ data: BlacklistResult; mock: boolean }> {
  if (USE_MOCK) return mockBlacklist(target);
  return apiLookup<BlacklistResult>(`/api/lookup/blacklist?target=${encodeURIComponent(target)}`);
}

export function lookupSSL(domain: string): Promise<{ data: SSLCertificateResult; mock: boolean }> {
  if (USE_MOCK) return mockSSL(domain);
  return apiLookup<SSLCertificateResult>(`/api/lookup/ssl?domain=${encodeURIComponent(domain)}`);
}

export function lookupHeaders(domain: string): Promise<{ data: SecurityHeadersResult; mock: boolean }> {
  if (USE_MOCK) return mockHeaders(domain);
  return apiLookup<SecurityHeadersResult>(`/api/lookup/headers?domain=${encodeURIComponent(domain)}`);
}

export function lookupDNS(domain: string): Promise<{ data: DNSResult; mock: boolean }> {
  if (USE_MOCK) return mockDNS(domain);
  return apiLookup<DNSResult>(`/api/lookup/dns?domain=${encodeURIComponent(domain)}`);
}

export function lookupWHOIS(domain: string): Promise<{ data: WHOISResult; mock: boolean }> {
  if (USE_MOCK) return mockWHOIS(domain);
  return apiLookup<WHOISResult>(`/api/lookup/whois?domain=${encodeURIComponent(domain)}`);
}

export function lookupURL(url: string): Promise<{ data: URLAnalysisResult; mock: boolean }> {
  if (USE_MOCK) return mockURL(url);
  return apiLookup<URLAnalysisResult>(`/api/lookup/url?url=${encodeURIComponent(url)}`);
}
