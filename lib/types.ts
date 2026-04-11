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

// ---------------------------------------------------------------------------
// Geolocation + ASN
// ---------------------------------------------------------------------------

export interface GeoResult {
  ip: string;
  country: string;
  countryCode: string;
  region: string;
  city: string;
  lat: number;
  lon: number;
  timezone: string;
  isp: string;
  org: string;
  asn: string;
  status: StatusLevel;
}

// ---------------------------------------------------------------------------
// Domain Threat Score Engine (aggregates blacklist + SSL + WHOIS + headers)
// ---------------------------------------------------------------------------

export interface ThreatScoreFactor {
  name: string;
  score: number;
  maxScore: number;
  detail: string;
  status: StatusLevel;
}

export interface DomainThreatScoreResult {
  target: string;
  totalScore: number;
  label: "Safe" | "Suspicious" | "High Risk";
  factors: ThreatScoreFactor[];
  status: StatusLevel;
}

// ---------------------------------------------------------------------------
// Email Header Analyzer
// ---------------------------------------------------------------------------

export interface EmailHeaderField {
  name: string;
  value: string;
}

export interface SPFResult {
  present: boolean;
  result: string | null;
  pass: boolean;
}

export interface DKIMResult {
  present: boolean;
  domain: string | null;
  result: string | null;
  pass: boolean;
}

export interface DMARCResult {
  present: boolean;
  policy: string | null;
  result: string | null;
  pass: boolean;
}

export interface EmailHeaderResult {
  senderIP: string | null;
  fromAddress: string | null;
  replyTo: string | null;
  subject: string | null;
  date: string | null;
  receivedChain: string[];
  spf: SPFResult;
  dkim: DKIMResult;
  dmarc: DMARCResult;
  suspiciousIndicators: string[];
  status: StatusLevel;
}

// ---------------------------------------------------------------------------
// Redirect Trace
// ---------------------------------------------------------------------------

export interface RedirectHop {
  url: string;
  statusCode: number;
  isSuspicious: boolean;
  reason?: string;
}

export interface RedirectTraceResult {
  originalUrl: string;
  finalUrl: string;
  hopCount: number;
  hops: RedirectHop[];
  isSuspicious: boolean;
  suspiciousReasons: string[];
  status: StatusLevel;
}

// ---------------------------------------------------------------------------
// Subdomain Enumeration
// ---------------------------------------------------------------------------

export interface SubdomainEntry {
  subdomain: string;
  isWildcard: boolean;
}

export interface SubdomainResult {
  domain: string;
  subdomains: SubdomainEntry[];
  totalFound: number;
  source: string;
  status: StatusLevel;
}

// ---------------------------------------------------------------------------
// Saved Scans
// ---------------------------------------------------------------------------

export interface SavedScan {
  id: string;
  label: string;
  query: string;
  timestamp: string;
  overallStatus: StatusLevel;
  result: LookupResult;
}

// ---------------------------------------------------------------------------
// Workspaces
// ---------------------------------------------------------------------------

export type WorkspaceRole = "owner" | "admin" | "viewer";

export interface WorkspaceMember {
  id: string;
  name: string;
  email: string;
  role: WorkspaceRole;
  joinedAt: string;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  description: string;
  members: WorkspaceMember[];
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Cases
// ---------------------------------------------------------------------------

export type CaseStatus = "open" | "investigating" | "resolved";
export type CaseSeverity = "low" | "medium" | "high" | "critical";

export interface CaseNote {
  id: string;
  author: string;
  content: string;
  createdAt: string;
}

export interface CaseAttachment {
  id: string;
  type: "scan" | "note";
  label: string;
  query?: string;
  overallStatus?: StatusLevel;
  timestamp: string;
}

export interface Case {
  id: string;
  title: string;
  description: string;
  severity: CaseSeverity;
  status: CaseStatus;
  assignee: string | null;
  workspaceId: string;
  notes: CaseNote[];
  attachments: CaseAttachment[];
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Playbooks / Automation
// ---------------------------------------------------------------------------

export type PlaybookTrigger =
  | "scan_high_risk"
  | "scan_warning"
  | "blacklist_hit"
  | "ssl_expiry_7d"
  | "new_alert";

export type PlaybookAction =
  | "create_case"
  | "send_notification"
  | "webhook_slack"
  | "webhook_teams"
  | "email_alert";

export interface Playbook {
  id: string;
  name: string;
  description: string;
  trigger: PlaybookTrigger;
  action: PlaybookAction;
  enabled: boolean;
  workspaceId: string;
  runCount: number;
  lastRunAt: string | null;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Notifications
// ---------------------------------------------------------------------------

export type NotificationType = "alert" | "case_created" | "risk_changed" | "playbook_fired" | "member_invited";

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  href?: string;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Activity Logs
// ---------------------------------------------------------------------------

export type ActivityAction =
  | "scan_run"
  | "case_created"
  | "case_updated"
  | "case_resolved"
  | "playbook_fired"
  | "alert_triggered"
  | "member_invited"
  | "workspace_created";

export interface ActivityLogEntry {
  id: string;
  action: ActivityAction;
  actor: string;
  target: string;
  detail: string;
  workspaceId: string;
  timestamp: string;
}

