import type {
  LookupResult,
  HistoryEntry,
  StatusLevel,
} from "./types";

// ---------------------------------------------------------------------------
// Mock lookup results keyed by query string
// ---------------------------------------------------------------------------

const MOCK_RESULTS: Record<string, LookupResult> = {
  "8.8.8.8": {
    query: "8.8.8.8",
    timestamp: new Date().toISOString(),
    ipReputation: {
      ipAddress: "8.8.8.8",
      abuseConfidenceScore: 0,
      isp: "Google LLC",
      usageType: "Data Center/Web Hosting/Transit",
      country: "United States",
      countryCode: "US",
      totalReports: 0,
      lastReportedAt: null,
      status: "safe",
    },
    domainReputation: {
      domain: "8.8.8.8",
      malicious: 0,
      suspicious: 0,
      undetected: 10,
      harmless: 72,
      categories: ["Search Engines"],
      registrar: "N/A",
      createdDate: "N/A",
      status: "safe",
    },
    blacklist: {
      target: "8.8.8.8",
      entries: [
        { source: "Spamhaus ZEN", listed: false, detail: "Not listed" },
        { source: "SURBL", listed: false, detail: "Not listed" },
        { source: "Barracuda", listed: false, detail: "Not listed" },
        { source: "SpamCop", listed: false, detail: "Not listed" },
        { source: "UCEPROTECT", listed: false, detail: "Not listed" },
      ],
      listedCount: 0,
      totalChecked: 5,
      status: "safe",
    },
    ssl: {
      domain: "dns.google",
      issuer: "Google Trust Services",
      validFrom: "2024-11-11T00:00:00Z",
      validTo: "2025-02-03T00:00:00Z",
      daysRemaining: 120,
      protocol: "TLSv1.3",
      keySize: 256,
      signatureAlgorithm: "ECDSA",
      subjectAltNames: ["dns.google", "8.8.8.8", "8.8.4.4"],
      status: "safe",
    },
    securityHeaders: {
      domain: "dns.google",
      score: 85,
      grade: "A",
      headers: [
        {
          name: "Strict-Transport-Security",
          present: true,
          value: "max-age=31536000; includeSubDomains",
          description: "Forces HTTPS connections",
        },
        {
          name: "Content-Security-Policy",
          present: true,
          value: "default-src 'self'",
          description: "Prevents XSS and injection attacks",
        },
        {
          name: "X-Frame-Options",
          present: true,
          value: "DENY",
          description: "Prevents clickjacking",
        },
        {
          name: "X-Content-Type-Options",
          present: true,
          value: "nosniff",
          description: "Prevents MIME sniffing",
        },
        {
          name: "Referrer-Policy",
          present: false,
          value: null,
          description: "Controls referrer information",
        },
        {
          name: "Permissions-Policy",
          present: false,
          value: null,
          description: "Controls browser features",
        },
      ],
      status: "safe",
    },
    openPorts: {
      target: "8.8.8.8",
      openCount: 2,
      ports: [
        {
          port: 53,
          protocol: "TCP/UDP",
          service: "DNS",
          state: "open",
          version: "BIND 9",
        },
        {
          port: 443,
          protocol: "TCP",
          service: "HTTPS",
          state: "open",
          version: "nginx/1.25",
        },
        {
          port: 80,
          protocol: "TCP",
          service: "HTTP",
          state: "filtered",
          version: "",
        },
      ],
      scanDuration: 1240,
      status: "safe",
    },
    dns: {
      domain: "dns.google",
      records: [
        { type: "A", value: "8.8.8.8", ttl: 300 },
        { type: "A", value: "8.8.4.4", ttl: 300 },
        { type: "AAAA", value: "2001:4860:4860::8888", ttl: 300 },
        {
          type: "MX",
          value: "10 smtp.google.com",
          ttl: 3600,
        },
        { type: "TXT", value: "v=spf1 include:_spf.google.com ~all", ttl: 3600 },
      ],
      nameservers: ["ns1.google.com", "ns2.google.com", "ns3.google.com", "ns4.google.com"],
      reverseDNS: "dns.google",
      status: "safe",
    },
  },

  "example.com": {
    query: "example.com",
    timestamp: new Date().toISOString(),
    ipReputation: {
      ipAddress: "93.184.216.34",
      abuseConfidenceScore: 2,
      isp: "Edgecast Inc.",
      usageType: "Data Center/Web Hosting/Transit",
      country: "United States",
      countryCode: "US",
      totalReports: 3,
      lastReportedAt: "2024-09-01T12:00:00Z",
      status: "safe",
    },
    domainReputation: {
      domain: "example.com",
      malicious: 0,
      suspicious: 1,
      undetected: 15,
      harmless: 68,
      categories: ["Information Technology"],
      registrar: "Internet Assigned Numbers Authority",
      createdDate: "1992-01-01",
      status: "warning",
    },
    blacklist: {
      target: "example.com",
      entries: [
        { source: "Spamhaus ZEN", listed: false, detail: "Not listed" },
        { source: "SURBL", listed: true, detail: "Listed in SURBL multi" },
        { source: "Barracuda", listed: false, detail: "Not listed" },
        { source: "SpamCop", listed: false, detail: "Not listed" },
        { source: "UCEPROTECT", listed: false, detail: "Not listed" },
      ],
      listedCount: 1,
      totalChecked: 5,
      status: "warning",
    },
    ssl: {
      domain: "example.com",
      issuer: "DigiCert Inc",
      validFrom: "2024-01-15T00:00:00Z",
      validTo: "2025-01-15T00:00:00Z",
      daysRemaining: 30,
      protocol: "TLSv1.2",
      keySize: 2048,
      signatureAlgorithm: "RSA",
      subjectAltNames: ["example.com", "www.example.com"],
      status: "warning",
    },
    securityHeaders: {
      domain: "example.com",
      score: 45,
      grade: "C",
      headers: [
        {
          name: "Strict-Transport-Security",
          present: false,
          value: null,
          description: "Forces HTTPS connections",
        },
        {
          name: "Content-Security-Policy",
          present: false,
          value: null,
          description: "Prevents XSS and injection attacks",
        },
        {
          name: "X-Frame-Options",
          present: true,
          value: "SAMEORIGIN",
          description: "Prevents clickjacking",
        },
        {
          name: "X-Content-Type-Options",
          present: true,
          value: "nosniff",
          description: "Prevents MIME sniffing",
        },
        {
          name: "Referrer-Policy",
          present: false,
          value: null,
          description: "Controls referrer information",
        },
        {
          name: "Permissions-Policy",
          present: false,
          value: null,
          description: "Controls browser features",
        },
      ],
      status: "warning",
    },
    openPorts: {
      target: "93.184.216.34",
      openCount: 3,
      ports: [
        {
          port: 80,
          protocol: "TCP",
          service: "HTTP",
          state: "open",
          version: "Apache/2.4",
        },
        {
          port: 443,
          protocol: "TCP",
          service: "HTTPS",
          state: "open",
          version: "Apache/2.4",
        },
        {
          port: 22,
          protocol: "TCP",
          service: "SSH",
          state: "open",
          version: "OpenSSH 8.9",
        },
      ],
      scanDuration: 2100,
      status: "warning",
    },
    dns: {
      domain: "example.com",
      records: [
        { type: "A", value: "93.184.216.34", ttl: 86400 },
        { type: "AAAA", value: "2606:2800:220:1:248:1893:25c8:1946", ttl: 86400 },
        { type: "NS", value: "a.iana-servers.net", ttl: 86400 },
        { type: "NS", value: "b.iana-servers.net", ttl: 86400 },
        { type: "MX", value: "0 .", ttl: 3600 },
      ],
      nameservers: ["a.iana-servers.net", "b.iana-servers.net"],
      reverseDNS: "93.184.216.34",
      status: "safe",
    },
  },

  "malicious-test.xyz": {
    query: "malicious-test.xyz",
    timestamp: new Date().toISOString(),
    ipReputation: {
      ipAddress: "185.220.101.47",
      abuseConfidenceScore: 96,
      isp: "Frantech Solutions",
      usageType: "Data Center/Web Hosting/Transit",
      country: "Netherlands",
      countryCode: "NL",
      totalReports: 1842,
      lastReportedAt: "2024-12-01T09:45:00Z",
      status: "risk",
    },
    domainReputation: {
      domain: "malicious-test.xyz",
      malicious: 45,
      suspicious: 8,
      undetected: 5,
      harmless: 2,
      categories: ["Malware", "Phishing"],
      registrar: "Namecheap Inc",
      createdDate: "2024-11-15",
      status: "risk",
    },
    blacklist: {
      target: "malicious-test.xyz",
      entries: [
        { source: "Spamhaus ZEN", listed: true, detail: "Listed in SBL (Spam Block List)" },
        { source: "SURBL", listed: true, detail: "Listed in SURBL multi" },
        { source: "Barracuda", listed: true, detail: "Blocked – spam source" },
        { source: "SpamCop", listed: true, detail: "Active spam source" },
        { source: "UCEPROTECT", listed: false, detail: "Not listed" },
      ],
      listedCount: 4,
      totalChecked: 5,
      status: "risk",
    },
    ssl: {
      domain: "malicious-test.xyz",
      issuer: "Let's Encrypt",
      validFrom: "2024-11-15T00:00:00Z",
      validTo: "2025-02-13T00:00:00Z",
      daysRemaining: 5,
      protocol: "TLSv1.2",
      keySize: 2048,
      signatureAlgorithm: "RSA",
      subjectAltNames: ["malicious-test.xyz"],
      status: "risk",
    },
    securityHeaders: {
      domain: "malicious-test.xyz",
      score: 10,
      grade: "F",
      headers: [
        {
          name: "Strict-Transport-Security",
          present: false,
          value: null,
          description: "Forces HTTPS connections",
        },
        {
          name: "Content-Security-Policy",
          present: false,
          value: null,
          description: "Prevents XSS and injection attacks",
        },
        {
          name: "X-Frame-Options",
          present: false,
          value: null,
          description: "Prevents clickjacking",
        },
        {
          name: "X-Content-Type-Options",
          present: false,
          value: null,
          description: "Prevents MIME sniffing",
        },
        {
          name: "Referrer-Policy",
          present: false,
          value: null,
          description: "Controls referrer information",
        },
        {
          name: "Permissions-Policy",
          present: false,
          value: null,
          description: "Controls browser features",
        },
      ],
      status: "risk",
    },
    openPorts: {
      target: "185.220.101.47",
      openCount: 6,
      ports: [
        {
          port: 22,
          protocol: "TCP",
          service: "SSH",
          state: "open",
          version: "OpenSSH 7.4",
        },
        {
          port: 80,
          protocol: "TCP",
          service: "HTTP",
          state: "open",
          version: "nginx/1.18",
        },
        {
          port: 443,
          protocol: "TCP",
          service: "HTTPS",
          state: "open",
          version: "nginx/1.18",
        },
        {
          port: 3389,
          protocol: "TCP",
          service: "RDP",
          state: "open",
          version: "Microsoft RDP",
        },
        {
          port: 4444,
          protocol: "TCP",
          service: "Metasploit",
          state: "open",
          version: "Unknown",
        },
        {
          port: 8080,
          protocol: "TCP",
          service: "HTTP-Alt",
          state: "open",
          version: "Apache/2.2",
        },
      ],
      scanDuration: 3450,
      status: "risk",
    },
    dns: {
      domain: "malicious-test.xyz",
      records: [
        { type: "A", value: "185.220.101.47", ttl: 300 },
        { type: "NS", value: "ns1.dnspod.net", ttl: 3600 },
        { type: "TXT", value: "v=spf1 +all", ttl: 300 },
      ],
      nameservers: ["ns1.dnspod.net", "ns2.dnspod.net"],
      reverseDNS: null,
      status: "risk",
    },
  },
};

// Default/fallback result for unknown queries
function createDefaultResult(query: string): LookupResult {
  return {
    query,
    timestamp: new Date().toISOString(),
    ipReputation: {
      ipAddress: query,
      abuseConfidenceScore: 0,
      isp: "Unknown",
      usageType: "Unknown",
      country: "Unknown",
      countryCode: "--",
      totalReports: 0,
      lastReportedAt: null,
      status: "unknown",
    },
    domainReputation: {
      domain: query,
      malicious: 0,
      suspicious: 0,
      undetected: 0,
      harmless: 0,
      categories: [],
      registrar: "Unknown",
      createdDate: "Unknown",
      status: "unknown",
    },
    blacklist: {
      target: query,
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
    },
    ssl: {
      domain: query,
      issuer: "Unknown",
      validFrom: "Unknown",
      validTo: "Unknown",
      daysRemaining: 0,
      protocol: "Unknown",
      keySize: 0,
      signatureAlgorithm: "Unknown",
      subjectAltNames: [],
      status: "unknown",
    },
    securityHeaders: {
      domain: query,
      score: 0,
      grade: "N/A",
      headers: [
        {
          name: "Strict-Transport-Security",
          present: false,
          value: null,
          description: "Forces HTTPS connections",
        },
        {
          name: "Content-Security-Policy",
          present: false,
          value: null,
          description: "Prevents XSS and injection attacks",
        },
        {
          name: "X-Frame-Options",
          present: false,
          value: null,
          description: "Prevents clickjacking",
        },
        {
          name: "X-Content-Type-Options",
          present: false,
          value: null,
          description: "Prevents MIME sniffing",
        },
        {
          name: "Referrer-Policy",
          present: false,
          value: null,
          description: "Controls referrer information",
        },
        {
          name: "Permissions-Policy",
          present: false,
          value: null,
          description: "Controls browser features",
        },
      ],
      status: "unknown",
    },
    openPorts: {
      target: query,
      openCount: 0,
      ports: [],
      scanDuration: 0,
      status: "unknown",
    },
    dns: {
      domain: query,
      records: [],
      nameservers: [],
      reverseDNS: null,
      status: "unknown",
    },
  };
}

// ---------------------------------------------------------------------------
// Public helpers
// ---------------------------------------------------------------------------

/**
 * Simulates an API call to look up a query.
 * In the future, replace this function body with real API calls.
 */
export async function lookupQuery(query: string): Promise<LookupResult> {
  // Simulate network latency
  await new Promise((resolve) => setTimeout(resolve, 800));

  const normalised = query.trim().toLowerCase();
  const result = MOCK_RESULTS[normalised] ?? createDefaultResult(query.trim());
  // Stamp with the current time
  return { ...result, timestamp: new Date().toISOString() };
}

// ---------------------------------------------------------------------------
// History helpers (in-memory; replace with persistence layer later)
// ---------------------------------------------------------------------------

const HISTORY_KEY = "securescope_history";
const MAX_HISTORY = 20;

export function saveToHistory(result: LookupResult): void {
  if (typeof window === "undefined") return;

  const entry: HistoryEntry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    query: result.query,
    timestamp: result.timestamp,
    overallStatus: deriveOverallStatus([
      result.ipReputation.status,
      result.domainReputation.status,
      result.blacklist.status,
      result.ssl.status,
    ]),
    resultSnapshot: {
      ipStatus: result.ipReputation.status,
      domainStatus: result.domainReputation.status,
      blacklistStatus: result.blacklist.status,
      sslStatus: result.ssl.status,
    },
  };

  const existing = loadHistory();
  const updated = [entry, ...existing.filter((h) => h.query !== result.query)].slice(
    0,
    MAX_HISTORY,
  );
  localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
}

export function loadHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? (JSON.parse(raw) as HistoryEntry[]) : [];
  } catch {
    return [];
  }
}

export function clearHistory(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(HISTORY_KEY);
}

function deriveOverallStatus(statuses: StatusLevel[]): StatusLevel {
  if (statuses.includes("risk")) return "risk";
  if (statuses.includes("warning")) return "warning";
  if (statuses.includes("unknown")) return "unknown";
  return "safe";
}
