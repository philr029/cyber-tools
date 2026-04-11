/**
 * Mock data for enterprise features: workspaces, cases, playbooks,
 * notifications, and activity logs. All data is stored in-memory (localStorage
 * where available) so the UI feels interactive without a real backend.
 */

import type {
  Workspace,
  Case,
  CaseStatus,
  CaseSeverity,
  Playbook,
  PlaybookTrigger,
  PlaybookAction,
  AppNotification,
  NotificationType,
  ActivityLogEntry,
  ActivityAction,
} from "./types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

function iso(daysAgo = 0): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString();
}

// ---------------------------------------------------------------------------
// Default seed data
// ---------------------------------------------------------------------------

const DEFAULT_WORKSPACES: Workspace[] = [
  {
    id: "ws-default",
    name: "My Workspace",
    slug: "my-workspace",
    description: "Personal security workspace",
    members: [
      { id: "u1", name: "You", email: "you@example.com", role: "owner", joinedAt: iso(30) },
    ],
    createdAt: iso(30),
  },
  {
    id: "ws-client-a",
    name: "Client A",
    slug: "client-a",
    description: "Security monitoring for Client A infrastructure",
    members: [
      { id: "u1", name: "You", email: "you@example.com", role: "owner", joinedAt: iso(20) },
      { id: "u2", name: "Alice Chen", email: "alice@clienta.com", role: "admin", joinedAt: iso(18) },
      { id: "u3", name: "Bob Marsh", email: "bob@clienta.com", role: "viewer", joinedAt: iso(10) },
    ],
    createdAt: iso(20),
  },
  {
    id: "ws-internal-it",
    name: "Internal IT",
    slug: "internal-it",
    description: "Internal IT security ops",
    members: [
      { id: "u1", name: "You", email: "you@example.com", role: "owner", joinedAt: iso(60) },
      { id: "u4", name: "Sara Kim", email: "sara@corp.com", role: "admin", joinedAt: iso(55) },
    ],
    createdAt: iso(60),
  },
];

const DEFAULT_CASES: Case[] = [
  {
    id: "case-001",
    title: "Suspicious IP Activity — 185.220.101.42",
    description: "Multiple blacklist hits detected for this exit node. Possible Tor relay being used for credential stuffing.",
    severity: "high",
    status: "investigating",
    assignee: "Alice Chen",
    workspaceId: "ws-client-a",
    notes: [
      { id: uid(), author: "Alice Chen", content: "Confirmed Tor exit node. Reached out to upstream ISP.", createdAt: iso(2) },
      { id: uid(), author: "You", content: "Added to firewall block list pending further investigation.", createdAt: iso(1) },
    ],
    attachments: [
      { id: uid(), type: "scan", label: "IP Reputation Scan", query: "185.220.101.42", overallStatus: "risk", timestamp: iso(3) },
    ],
    createdAt: iso(3),
    updatedAt: iso(1),
  },
  {
    id: "case-002",
    title: "Expired SSL Certificate — staging.clienta.com",
    description: "SSL certificate expired 5 days ago. Traffic may be exposed. Renewal blocked by procurement.",
    severity: "critical",
    status: "open",
    assignee: null,
    workspaceId: "ws-client-a",
    notes: [],
    attachments: [
      { id: uid(), type: "scan", label: "SSL Check", query: "staging.clienta.com", overallStatus: "risk", timestamp: iso(5) },
    ],
    createdAt: iso(5),
    updatedAt: iso(5),
  },
  {
    id: "case-003",
    title: "Phishing Domain Detected — paypa1-secure.xyz",
    description: "Domain mimicking PayPal detected in email headers analysis. Multiple malicious vendor detections.",
    severity: "critical",
    status: "open",
    assignee: "You",
    workspaceId: "ws-default",
    notes: [
      { id: uid(), author: "You", content: "Reported to Google SafeBrowsing and PhishTank.", createdAt: iso(1) },
    ],
    attachments: [
      { id: uid(), type: "scan", label: "Domain Scan", query: "paypa1-secure.xyz", overallStatus: "risk", timestamp: iso(2) },
    ],
    createdAt: iso(2),
    updatedAt: iso(1),
  },
  {
    id: "case-004",
    title: "Internal Asset — Missing Security Headers",
    description: "Three internal services missing HSTS, CSP, and X-Frame-Options. Medium risk per policy.",
    severity: "medium",
    status: "investigating",
    assignee: "Sara Kim",
    workspaceId: "ws-internal-it",
    notes: [
      { id: uid(), author: "Sara Kim", content: "Ticket raised with web team. ETA: 2 weeks.", createdAt: iso(4) },
    ],
    attachments: [],
    createdAt: iso(7),
    updatedAt: iso(4),
  },
  {
    id: "case-005",
    title: "Port 3389 Exposed — vpn-gateway.corp.com",
    description: "RDP port exposed to the internet. Should be restricted to VPN-only access.",
    severity: "high",
    status: "resolved",
    assignee: "You",
    workspaceId: "ws-internal-it",
    notes: [
      { id: uid(), author: "You", content: "Firewall rule updated. RDP now restricted to 10.0.0.0/8.", createdAt: iso(0) },
    ],
    attachments: [
      { id: uid(), type: "scan", label: "Port Scan", query: "vpn-gateway.corp.com", overallStatus: "risk", timestamp: iso(8) },
    ],
    createdAt: iso(8),
    updatedAt: iso(0),
  },
];

const DEFAULT_PLAYBOOKS: Playbook[] = [
  {
    id: "pb-001",
    name: "Auto-case on High Risk Scan",
    description: "Automatically creates a case whenever a scan returns High Risk status.",
    trigger: "scan_high_risk",
    action: "create_case",
    enabled: true,
    workspaceId: "ws-default",
    runCount: 7,
    lastRunAt: iso(1),
    createdAt: iso(14),
  },
  {
    id: "pb-002",
    name: "Slack Alert on Blacklist Hit",
    description: "Sends a Slack webhook notification when any target is found on a blacklist.",
    trigger: "blacklist_hit",
    action: "webhook_slack",
    enabled: true,
    workspaceId: "ws-client-a",
    runCount: 3,
    lastRunAt: iso(3),
    createdAt: iso(20),
  },
  {
    id: "pb-003",
    name: "Email on SSL Expiry (7 days)",
    description: "Sends an email alert when an SSL certificate will expire within 7 days.",
    trigger: "ssl_expiry_7d",
    action: "email_alert",
    enabled: false,
    workspaceId: "ws-client-a",
    runCount: 0,
    lastRunAt: null,
    createdAt: iso(10),
  },
  {
    id: "pb-004",
    name: "Notify Team on Warning Scan",
    description: "Sends an in-app notification to all workspace members on a warning-level scan.",
    trigger: "scan_warning",
    action: "send_notification",
    enabled: true,
    workspaceId: "ws-default",
    runCount: 12,
    lastRunAt: iso(0),
    createdAt: iso(21),
  },
];

const DEFAULT_NOTIFICATIONS: AppNotification[] = [
  {
    id: "notif-001",
    type: "alert",
    title: "New Alert: Blacklist Hit",
    message: "185.220.101.42 was found on Spamhaus ZEN.",
    read: false,
    href: "/dashboard/alerts",
    createdAt: iso(0),
  },
  {
    id: "notif-002",
    type: "case_created",
    title: "Case Created",
    message: "Playbook auto-created a case for paypa1-secure.xyz",
    read: false,
    href: "/dashboard/cases",
    createdAt: iso(1),
  },
  {
    id: "notif-003",
    type: "risk_changed",
    title: "Risk Level Changed",
    message: "staging.clienta.com escalated to CRITICAL (SSL expired).",
    read: false,
    href: "/dashboard/cases",
    createdAt: iso(2),
  },
  {
    id: "notif-004",
    type: "playbook_fired",
    title: "Playbook Fired",
    message: "Auto-case playbook triggered for 185.220.101.42",
    read: true,
    href: "/dashboard/playbooks",
    createdAt: iso(3),
  },
  {
    id: "notif-005",
    type: "member_invited",
    title: "Member Joined",
    message: "Bob Marsh joined Client A workspace.",
    read: true,
    href: "/dashboard",
    createdAt: iso(10),
  },
];

const DEFAULT_ACTIVITY: ActivityLogEntry[] = [
  { id: uid(), action: "scan_run", actor: "You", target: "185.220.101.42", detail: "IP reputation scan", workspaceId: "ws-client-a", timestamp: iso(0) },
  { id: uid(), action: "case_created", actor: "Playbook", target: "case-001", detail: "Auto-case from high-risk scan", workspaceId: "ws-client-a", timestamp: iso(0) },
  { id: uid(), action: "playbook_fired", actor: "System", target: "pb-001", detail: "Auto-case on High Risk Scan triggered", workspaceId: "ws-default", timestamp: iso(1) },
  { id: uid(), action: "scan_run", actor: "Alice Chen", target: "staging.clienta.com", detail: "SSL certificate check", workspaceId: "ws-client-a", timestamp: iso(1) },
  { id: uid(), action: "alert_triggered", actor: "System", target: "185.220.101.42", detail: "Blacklist hit: Spamhaus ZEN", workspaceId: "ws-client-a", timestamp: iso(2) },
  { id: uid(), action: "case_updated", actor: "You", target: "case-003", detail: "Added note: Reported to PhishTank", workspaceId: "ws-default", timestamp: iso(2) },
  { id: uid(), action: "scan_run", actor: "You", target: "paypa1-secure.xyz", detail: "Domain reputation scan", workspaceId: "ws-default", timestamp: iso(2) },
  { id: uid(), action: "member_invited", actor: "You", target: "bob@clienta.com", detail: "Invited as viewer to Client A", workspaceId: "ws-client-a", timestamp: iso(10) },
  { id: uid(), action: "case_resolved", actor: "You", target: "case-005", detail: "RDP exposure resolved via firewall rule", workspaceId: "ws-internal-it", timestamp: iso(0) },
  { id: uid(), action: "scan_run", actor: "Sara Kim", target: "vpn-gateway.corp.com", detail: "Port scanner", workspaceId: "ws-internal-it", timestamp: iso(8) },
  { id: uid(), action: "workspace_created", actor: "You", target: "ws-internal-it", detail: "Created Internal IT workspace", workspaceId: "ws-internal-it", timestamp: iso(60) },
];

// ---------------------------------------------------------------------------
// Storage helpers
// ---------------------------------------------------------------------------

function readLS<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeLS<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage full or unavailable
  }
}

// ---------------------------------------------------------------------------
// Workspace CRUD
// ---------------------------------------------------------------------------

const WS_KEY = "ss_workspaces";

export function loadWorkspaces(): Workspace[] {
  return readLS(WS_KEY, DEFAULT_WORKSPACES);
}

export function saveWorkspaces(ws: Workspace[]): void {
  writeLS(WS_KEY, ws);
}

export function addWorkspace(name: string, description: string): Workspace {
  const ws = loadWorkspaces();
  const newWs: Workspace = {
    id: `ws-${uid()}`,
    name,
    slug: name.toLowerCase().replace(/\s+/g, "-"),
    description,
    members: [{ id: "u1", name: "You", email: "you@example.com", role: "owner", joinedAt: new Date().toISOString() }],
    createdAt: new Date().toISOString(),
  };
  saveWorkspaces([newWs, ...ws]);
  return newWs;
}

export function inviteMember(workspaceId: string, email: string, role: "admin" | "viewer"): void {
  const ws = loadWorkspaces();
  const updated = ws.map((w) => {
    if (w.id !== workspaceId) return w;
    const existing = w.members.find((m) => m.email === email);
    if (existing) return w;
    return {
      ...w,
      members: [
        ...w.members,
        { id: uid(), name: email.split("@")[0], email, role, joinedAt: new Date().toISOString() },
      ],
    };
  });
  saveWorkspaces(updated);
}

// ---------------------------------------------------------------------------
// Case CRUD
// ---------------------------------------------------------------------------

const CASES_KEY = "ss_cases";

export function loadCases(): Case[] {
  return readLS(CASES_KEY, DEFAULT_CASES);
}

export function saveCases(cases: Case[]): void {
  writeLS(CASES_KEY, cases);
}

export function createCase(
  title: string,
  description: string,
  severity: CaseSeverity,
  workspaceId: string,
): Case {
  const cases = loadCases();
  const newCase: Case = {
    id: `case-${uid()}`,
    title,
    description,
    severity,
    status: "open",
    assignee: null,
    workspaceId,
    notes: [],
    attachments: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  saveCases([newCase, ...cases]);
  return newCase;
}

export function updateCaseStatus(id: string, status: CaseStatus): void {
  const cases = loadCases();
  saveCases(cases.map((c) => (c.id === id ? { ...c, status, updatedAt: new Date().toISOString() } : c)));
}

export function addCaseNote(id: string, author: string, content: string): void {
  const cases = loadCases();
  saveCases(
    cases.map((c) =>
      c.id === id
        ? {
            ...c,
            notes: [...c.notes, { id: uid(), author, content, createdAt: new Date().toISOString() }],
            updatedAt: new Date().toISOString(),
          }
        : c,
    ),
  );
}

// ---------------------------------------------------------------------------
// Playbook CRUD
// ---------------------------------------------------------------------------

const PB_KEY = "ss_playbooks";

export function loadPlaybooks(): Playbook[] {
  return readLS(PB_KEY, DEFAULT_PLAYBOOKS);
}

export function savePlaybooks(pbs: Playbook[]): void {
  writeLS(PB_KEY, pbs);
}

export function createPlaybook(
  name: string,
  description: string,
  trigger: PlaybookTrigger,
  action: PlaybookAction,
  workspaceId: string,
): Playbook {
  const pbs = loadPlaybooks();
  const pb: Playbook = {
    id: `pb-${uid()}`,
    name,
    description,
    trigger,
    action,
    enabled: true,
    workspaceId,
    runCount: 0,
    lastRunAt: null,
    createdAt: new Date().toISOString(),
  };
  savePlaybooks([pb, ...pbs]);
  return pb;
}

export function togglePlaybook(id: string): void {
  const pbs = loadPlaybooks();
  savePlaybooks(pbs.map((p) => (p.id === id ? { ...p, enabled: !p.enabled } : p)));
}

export function deletePlaybook(id: string): void {
  const pbs = loadPlaybooks();
  savePlaybooks(pbs.filter((p) => p.id !== id));
}

// ---------------------------------------------------------------------------
// Notifications
// ---------------------------------------------------------------------------

const NOTIF_KEY = "ss_notifications";

export function loadNotifications(): AppNotification[] {
  return readLS(NOTIF_KEY, DEFAULT_NOTIFICATIONS);
}

export function saveNotifications(notifs: AppNotification[]): void {
  writeLS(NOTIF_KEY, notifs);
}

export function markAllRead(): void {
  const notifs = loadNotifications();
  saveNotifications(notifs.map((n) => ({ ...n, read: true })));
}

export function addNotification(
  type: NotificationType,
  title: string,
  message: string,
  href?: string,
): AppNotification {
  const notifs = loadNotifications();
  const n: AppNotification = {
    id: `notif-${uid()}`,
    type,
    title,
    message,
    read: false,
    href,
    createdAt: new Date().toISOString(),
  };
  saveNotifications([n, ...notifs]);
  return n;
}

// ---------------------------------------------------------------------------
// Activity Logs
// ---------------------------------------------------------------------------

const ACTIVITY_KEY = "ss_activity";

export function loadActivity(): ActivityLogEntry[] {
  return readLS(ACTIVITY_KEY, DEFAULT_ACTIVITY);
}

export function logActivity(
  action: ActivityAction,
  actor: string,
  target: string,
  detail: string,
  workspaceId: string,
): ActivityLogEntry {
  const logs = loadActivity();
  const entry: ActivityLogEntry = {
    id: uid(),
    action,
    actor,
    target,
    detail,
    workspaceId,
    timestamp: new Date().toISOString(),
  };
  const trimmed = [entry, ...logs].slice(0, 200);
  writeLS(ACTIVITY_KEY, trimmed);
  return entry;
}

// ---------------------------------------------------------------------------
// Label helpers
// ---------------------------------------------------------------------------

export const TRIGGER_LABELS: Record<PlaybookTrigger, string> = {
  scan_high_risk: "Scan returns High Risk",
  scan_warning: "Scan returns Warning",
  blacklist_hit: "Blacklist hit detected",
  ssl_expiry_7d: "SSL expires within 7 days",
  new_alert: "New alert triggered",
};

export const ACTION_LABELS: Record<PlaybookAction, string> = {
  create_case: "Create case automatically",
  send_notification: "Send in-app notification",
  webhook_slack: "Send Slack webhook",
  webhook_teams: "Send Teams webhook",
  email_alert: "Send email alert",
};

export const SEVERITY_COLORS: Record<CaseSeverity, string> = {
  low: "text-emerald-400 bg-emerald-500/10",
  medium: "text-amber-400 bg-amber-500/10",
  high: "text-orange-400 bg-orange-500/10",
  critical: "text-red-400 bg-red-500/10",
};

export const STATUS_COLORS: Record<CaseStatus, string> = {
  open: "text-slate-300 bg-slate-500/10",
  investigating: "text-blue-400 bg-blue-500/10",
  resolved: "text-emerald-400 bg-emerald-500/10",
};

export const ACTIVITY_ICONS: Record<ActivityAction, string> = {
  scan_run: "🔍",
  case_created: "📁",
  case_updated: "✏️",
  case_resolved: "✅",
  playbook_fired: "⚡",
  alert_triggered: "🚨",
  member_invited: "👤",
  workspace_created: "🏢",
};
