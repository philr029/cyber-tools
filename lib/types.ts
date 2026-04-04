export type StatusLevel = "safe" | "warning" | "risk" | "unknown";

export interface IPReputationResult {
  ipAddress: string;
  abuseConfidenceScore: number;
  isp: string;
  usageType: string;
  country: string;
  countryCode: string;
  totalReports: number;
  lastReportedAt: string | null;
  status: StatusLevel;
}

export interface DomainReputationResult {
  domain: string;
  malicious: number;
  suspicious: number;
  undetected: number;
  harmless: number;
  categories: string[];
  registrar: string;
  createdDate: string;
  status: StatusLevel;
}

export interface BlacklistEntry {
  source: string;
  listed: boolean;
  detail: string;
}

export interface BlacklistResult {
  target: string;
  entries: BlacklistEntry[];
  listedCount: number;
  totalChecked: number;
  status: StatusLevel;
}

export interface SSLCertificateResult {
  domain: string;
  issuer: string;
  validFrom: string;
  validTo: string;
  daysRemaining: number;
  protocol: string;
  keySize: number;
  signatureAlgorithm: string;
  subjectAltNames: string[];
  status: StatusLevel;
}

export interface SecurityHeader {
  name: string;
  present: boolean;
  value: string | null;
  description: string;
}

export interface SecurityHeadersResult {
  domain: string;
  score: number;
  grade: string;
  headers: SecurityHeader[];
  status: StatusLevel;
}

export interface PortEntry {
  port: number;
  protocol: string;
  service: string;
  state: "open" | "closed" | "filtered";
  version: string;
}

export interface OpenPortsResult {
  target: string;
  openCount: number;
  ports: PortEntry[];
  scanDuration: number;
  status: StatusLevel;
}

export interface DNSRecord {
  type: string;
  value: string;
  ttl: number;
}

export interface DNSResult {
  domain: string;
  records: DNSRecord[];
  nameservers: string[];
  reverseDNS: string | null;
  status: StatusLevel;
}

export interface LookupResult {
  query: string;
  timestamp: string;
  ipReputation: IPReputationResult;
  domainReputation: DomainReputationResult;
  blacklist: BlacklistResult;
  ssl: SSLCertificateResult;
  securityHeaders: SecurityHeadersResult;
  openPorts: OpenPortsResult;
  dns: DNSResult;
}

export interface WHOISResult {
  domain: string;
  registrar: string;
  registrarUrl: string | null;
  registrantOrg: string | null;
  registrantCountry: string | null;
  createdDate: string;
  updatedDate: string;
  expiryDate: string;
  nameservers: string[];
  status: string[];
  dnssec: boolean;
  lookupStatus: StatusLevel;
}

export interface URLAnalysisResult {
  url: string;
  finalUrl: string;
  statusCode: number | null;
  ipAddress: string | null;
  domain: string;
  redirectChain: string[];
  contentType: string | null;
  malicious: number;
  suspicious: number;
  harmless: number;
  undetected: number;
  categories: string[];
  threatNames: string[];
  status: StatusLevel;
}

export interface VTIPResult {
  ip: string;
  harmless: number;
  malicious: number;
  suspicious: number;
  undetected: number;
  reputation: number;
  country: string;
  asn: number | null;
  asOwner: string;
  network: string;
  status: StatusLevel;
}

export interface VTDomainResult {
  domain: string;
  harmless: number;
  malicious: number;
  suspicious: number;
  undetected: number;
  reputation: number;
  registrar: string;
  createdDate: string;
  status: StatusLevel;
}

export interface VTURLResult {
  url: string;
  harmless: number;
  malicious: number;
  suspicious: number;
  undetected: number;
  status: StatusLevel;
}

// ---------------------------------------------------------------------------
// Unified Threat Intelligence (AbuseIPDB + VirusTotal combined)
// ---------------------------------------------------------------------------

export type ThreatVerdict = "Safe" | "Suspicious" | "Malicious";

export interface ThreatIPAbuseIPDB {
  abuseConfidenceScore: number;
  countryCode: string;
  isp: string;
  domain: string;
  totalReports: number;
  lastReportedAt: string | null;
}

export interface ThreatIPVirusTotal {
  harmless: number;
  malicious: number;
  suspicious: number;
  reputation: number;
  country: string;
  as_owner: string;
}

export interface ThreatIPResult {
  ip: string;
  sources: {
    abuseipdb: ThreatIPAbuseIPDB | null;
    virustotal: ThreatIPVirusTotal | null;
  };
  threatScore: number;
  verdict: ThreatVerdict;
  warnings: string[];
}

export interface HistoryEntry {
  id: string;
  query: string;
  timestamp: string;
  overallStatus: StatusLevel;
  resultSnapshot: {
    ipStatus: StatusLevel;
    domainStatus: StatusLevel;
    blacklistStatus: StatusLevel;
    sslStatus: StatusLevel;
  };
}
