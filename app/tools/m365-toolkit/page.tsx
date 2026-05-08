"use client";

import { useState, useEffect, useCallback } from "react";
import ToolPageLayout from "@/app/components/tools/ToolPageLayout";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ChecklistItem {
  id: string;
  label: string;
  detail?: string;
  status: "pending" | "done" | "na";
}

interface Checklist {
  id: string;
  title: string;
  description: string;
  icon: string;
  items: ChecklistItem[];
}

// ---------------------------------------------------------------------------
// Checklist definitions
// ---------------------------------------------------------------------------

const CHECKLISTS: Checklist[] = [
  {
    id: "new-starter",
    title: "New Starter",
    description: "Complete onboarding tasks for a new employee joining Microsoft 365.",
    icon: "👤",
    items: [
      { id: "ns-1",  label: "Create Microsoft 365 user account", detail: "Microsoft 365 admin centre → Users → Active users → Add user", status: "pending" },
      { id: "ns-2",  label: "Assign appropriate licences", detail: "Assign Microsoft 365 Business / E3 / E5 based on role", status: "pending" },
      { id: "ns-3",  label: "Set up work email and display name", detail: "Verify UPN matches naming convention (firstname.lastname@domain.com)", status: "pending" },
      { id: "ns-4",  label: "Add to correct Azure AD security groups", detail: "Department group, distribution list, and any application access groups", status: "pending" },
      { id: "ns-5",  label: "Configure MFA registration", detail: "Enable per-user MFA or Conditional Access policy; send registration link", status: "pending" },
      { id: "ns-6",  label: "Enrol device in Intune (if applicable)", detail: "Provide Intune enrolment guide to new starter; confirm device appears in portal", status: "pending" },
      { id: "ns-7",  label: "Add to Teams and SharePoint sites", detail: "Add to relevant Teams channels and SharePoint team sites", status: "pending" },
      { id: "ns-8",  label: "Set up OneDrive and verify storage quota", detail: "Confirm OneDrive is provisioned; set quota as per company policy", status: "pending" },
      { id: "ns-9",  label: "Configure email signature", detail: "Apply company email signature template via Exchange / Exclaimer", status: "pending" },
      { id: "ns-10", label: "Send welcome email with login instructions", detail: "Include temp password, MFA setup guide, and IT helpdesk contact", status: "pending" },
      { id: "ns-11", label: "Test login and confirm access", detail: "Verify user can sign in, receive email, and access Teams", status: "pending" },
    ],
  },
  {
    id: "leaver",
    title: "Leaver",
    description: "Offboarding tasks to securely remove a departing employee from Microsoft 365.",
    icon: "🚪",
    items: [
      { id: "lv-1",  label: "Block user sign-in immediately", detail: "Microsoft 365 admin centre → Users → Block sign-in", status: "pending" },
      { id: "lv-2",  label: "Revoke all active sessions", detail: "Azure AD → Users → Revoke sessions to force sign-out on all devices", status: "pending" },
      { id: "lv-3",  label: "Reset the user account password", detail: "Prevent re-entry while account is being processed", status: "pending" },
      { id: "lv-4",  label: "Remove MFA methods", detail: "Azure AD → Authentication methods → Remove all registered methods", status: "pending" },
      { id: "lv-5",  label: "Convert mailbox to shared mailbox", detail: "Allows manager/team to access email without consuming a licence", status: "pending" },
      { id: "lv-6",  label: "Set up email auto-reply / forwarding", detail: "Configure auto-reply or forward to line manager for defined period", status: "pending" },
      { id: "lv-7",  label: "Export or transfer OneDrive files", detail: "Grant manager access to OneDrive → transfer/migrate required files", status: "pending" },
      { id: "lv-8",  label: "Remove from all Teams and groups", detail: "Remove from Teams channels, distribution lists, and security groups", status: "pending" },
      { id: "lv-9",  label: "Reassign Microsoft 365 licences", detail: "Unassign licence to reduce costs; reassign if needed for new starter", status: "pending" },
      { id: "lv-10", label: "Remove from Intune / wipe corporate device", detail: "Intune → Devices → Retire or wipe the device if company-owned", status: "pending" },
      { id: "lv-11", label: "Disable Exchange ActiveSync partnerships", detail: "Remove mobile device partnerships from Exchange admin centre", status: "pending" },
      { id: "lv-12", label: "Delete or archive user account (after hold period)", detail: "Wait for any litigation hold period before permanent deletion", status: "pending" },
    ],
  },
  {
    id: "mfa-status",
    title: "MFA Status",
    description: "Audit and enforce Multi-Factor Authentication across the tenant.",
    icon: "🔐",
    items: [
      { id: "mfa-1",  label: "Enable Security Defaults or Conditional Access MFA", detail: "Azure AD → Properties → Security Defaults (or Conditional Access for more control)", status: "pending" },
      { id: "mfa-2",  label: "Audit users without MFA registered", detail: "Azure AD → Users → Multi-Factor Authentication → Review registration status", status: "pending" },
      { id: "mfa-3",  label: "Enforce MFA for admin accounts", detail: "All global admins, Exchange admins, and SharePoint admins must use MFA", status: "pending" },
      { id: "mfa-4",  label: "Configure trusted locations (named locations)", detail: "Conditional Access → Named Locations → Exclude trusted IP ranges where appropriate", status: "pending" },
      { id: "mfa-5",  label: "Enable Microsoft Authenticator app push notifications", detail: "Preferred over SMS; configure via Authentication Methods policy", status: "pending" },
      { id: "mfa-6",  label: "Enable number matching for MFA push", detail: "Mitigates MFA fatigue attacks; Azure AD → Authentication Methods → Microsoft Authenticator", status: "pending" },
      { id: "mfa-7",  label: "Review and limit legacy authentication protocols", detail: "Block Basic Auth via Conditional Access or Exchange Online policies", status: "pending" },
      { id: "mfa-8",  label: "Test MFA registration flow for new users", detail: "Confirm MyAccount portal prompts MFA registration on first login", status: "pending" },
      { id: "mfa-9",  label: "Set up MFA self-service reset", detail: "Enable SSPR so users can manage their own authentication methods", status: "pending" },
      { id: "mfa-10", label: "Review Conditional Access sign-in risk policies", detail: "Entra ID Protection → Sign-in risk policy → Require MFA for medium/high risk", status: "pending" },
    ],
  },
  {
    id: "shared-mailbox",
    title: "Shared Mailbox",
    description: "Create and configure a shared mailbox for a team or department.",
    icon: "📬",
    items: [
      { id: "sm-1",  label: "Create shared mailbox in Exchange admin centre", detail: "Exchange admin centre → Recipients → Shared → Add shared mailbox", status: "pending" },
      { id: "sm-2",  label: "Add members and set Full Access permissions", detail: "Add users who need to send/receive on behalf of the mailbox", status: "pending" },
      { id: "sm-3",  label: "Enable Send As permission for members", detail: "Allows members to send email appearing to come from the shared mailbox", status: "pending" },
      { id: "sm-4",  label: "Configure email aliases if required", detail: "Add alternative email addresses in Exchange admin centre", status: "pending" },
      { id: "sm-5",  label: "Set up Outlook auto-mapping (if needed)", detail: "Users must remove and re-add their Outlook profile for auto-mapping to work", status: "pending" },
      { id: "sm-6",  label: "Configure out-of-office / auto-reply message", detail: "Set via OWA logged in as the shared mailbox or via PowerShell", status: "pending" },
      { id: "sm-7",  label: "Verify shared mailbox does not consume a licence", detail: "Shared mailboxes under 50 GB do not need a licence (check Microsoft policy)", status: "pending" },
      { id: "sm-8",  label: "Set mailbox storage limits and alert thresholds", detail: "Exchange admin → Mailbox → Storage quotas", status: "pending" },
      { id: "sm-9",  label: "Test send and receive from shared mailbox", detail: "Send test emails in both directions; confirm delivery and reply", status: "pending" },
    ],
  },
  {
    id: "teams-phone",
    title: "Teams Phone",
    description: "Set up Microsoft Teams Phone (Direct Routing or Calling Plans) for a user.",
    icon: "📞",
    items: [
      { id: "tp-1",  label: "Assign Teams Phone licence to user", detail: "Microsoft 365 admin centre → Assign Teams Phone Standard or Teams Essentials licence", status: "pending" },
      { id: "tp-2",  label: "Assign a phone number (Calling Plan or Direct Routing)", detail: "Teams admin centre → Users → Assign a phone number to the user", status: "pending" },
      { id: "tp-3",  label: "Enable Enterprise Voice for the user", detail: "Set via PowerShell: Grant-CsPhoneNumberAssignment or Teams admin portal", status: "pending" },
      { id: "tp-4",  label: "Configure voicemail", detail: "Teams → Settings → Calls → Configure voicemail greeting", status: "pending" },
      { id: "tp-5",  label: "Set up call forwarding rules", detail: "Teams admin → Calling policies → Configure forwarding and simultaneous ring", status: "pending" },
      { id: "tp-6",  label: "Test inbound and outbound PSTN calls", detail: "Call the assigned DDI from an external number; make outbound call", status: "pending" },
      { id: "tp-7",  label: "Configure Emergency Location (E911/E999)", detail: "Assign an emergency address for regulatory compliance", status: "pending" },
      { id: "tp-8",  label: "Check Dial Plan and PSTN usage policies", detail: "Teams admin centre → Voice → Dial plans; verify correct plan is assigned", status: "pending" },
      { id: "tp-9",  label: "Test call queue or auto attendant routing (if applicable)", detail: "Verify calls route correctly through call queues or auto attendants", status: "pending" },
      { id: "tp-10", label: "Confirm Direct Routing SBC connectivity (if applicable)", detail: "Check SBC health in Teams admin → Direct Routing → SBC health", status: "pending" },
    ],
  },
  {
    id: "intune",
    title: "Intune Enrolment",
    description: "Enrol and configure a device in Microsoft Intune for endpoint management.",
    icon: "💻",
    items: [
      { id: "in-1",  label: "Assign Intune licence to user", detail: "Microsoft 365 admin centre → Licences → Assign Intune plan to user", status: "pending" },
      { id: "in-2",  label: "Configure MDM authority in Intune", detail: "Intune admin centre → Tenant admin → Confirm MDM authority is set to Intune", status: "pending" },
      { id: "in-3",  label: "Create enrolment profile (Autopilot / BYOD / Corporate)", detail: "Intune → Devices → Enrolment → Configure appropriate profile", status: "pending" },
      { id: "in-4",  label: "Enrol device via Company Portal or Autopilot", detail: "User installs Company Portal app or device is provisioned via Autopilot", status: "pending" },
      { id: "in-5",  label: "Verify device appears in Intune portal", detail: "Intune → Devices → All devices → Confirm device is listed and compliant", status: "pending" },
      { id: "in-6",  label: "Assign device compliance policy", detail: "Intune → Devices → Compliance policies → Assign appropriate policy", status: "pending" },
      { id: "in-7",  label: "Deploy required apps via Intune", detail: "Intune → Apps → Assign required business apps to user/device group", status: "pending" },
      { id: "in-8",  label: "Configure device configuration profiles", detail: "Assign Wi-Fi, VPN, email, and security configuration profiles", status: "pending" },
      { id: "in-9",  label: "Enable BitLocker / FileVault encryption", detail: "Intune → Endpoint Security → Disk Encryption → Assign encryption policy", status: "pending" },
      { id: "in-10", label: "Test Conditional Access compliance gate", detail: "Verify that only enrolled, compliant devices can access company resources", status: "pending" },
    ],
  },
  {
    id: "defender",
    title: "Defender Security",
    description: "Configure and validate Microsoft Defender for Microsoft 365 tenant security.",
    icon: "🛡️",
    items: [
      { id: "def-1",  label: "Enable Microsoft Defender for Office 365 (Plan 1 or 2)", detail: "Microsoft 365 Defender portal → Settings → Email & Collaboration → Verify Defender is active", status: "pending" },
      { id: "def-2",  label: "Configure Safe Links policy", detail: "Defender portal → Policies → Safe Links → Enable and configure for all email", status: "pending" },
      { id: "def-3",  label: "Configure Safe Attachments policy", detail: "Defender portal → Policies → Safe Attachments → Enable dynamic delivery", status: "pending" },
      { id: "def-4",  label: "Enable Anti-Phishing policy", detail: "Defender portal → Policies → Anti-phishing → Configure impersonation protection", status: "pending" },
      { id: "def-5",  label: "Configure Anti-Spam policies", detail: "Verify inbound and outbound spam filter policies are active", status: "pending" },
      { id: "def-6",  label: "Enable Defender for Endpoint on devices", detail: "Intune → Endpoint Security → Microsoft Defender → Onboard devices", status: "pending" },
      { id: "def-7",  label: "Review Secure Score and action recommendations", detail: "Microsoft Defender portal → Secure Score → Review and implement improvements", status: "pending" },
      { id: "def-8",  label: "Enable DMARC / DKIM / SPF for sending domain", detail: "Publish DMARC, DKIM, and SPF DNS records; verify in Defender portal", status: "pending" },
      { id: "def-9",  label: "Configure alerting and incident notifications", detail: "Defender portal → Settings → Alert policies → Set up critical alerts", status: "pending" },
      { id: "def-10", label: "Run Attack Simulator to test phishing awareness", detail: "Defender portal → Attack simulation training → Launch phishing campaign", status: "pending" },
      { id: "def-11", label: "Enable Microsoft Secure Score monitoring", detail: "Review weekly and assign improvement actions to responsible team members", status: "pending" },
    ],
  },
];

// ---------------------------------------------------------------------------
// LocalStorage key
// ---------------------------------------------------------------------------

const LS_KEY = "m365-checklists-v1";

function loadState(): Record<string, Record<string, ChecklistItem["status"]>> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as Record<string, Record<string, ChecklistItem["status"]>>) : {};
  } catch {
    return {};
  }
}

function saveState(state: Record<string, Record<string, ChecklistItem["status"]>>) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(state));
  } catch {
    // Storage might be full or blocked — fail silently
  }
}

// ---------------------------------------------------------------------------
// Status badge styles
// ---------------------------------------------------------------------------

const STATUS_STYLES = {
  done:    { bg: "bg-emerald-500/15 border-emerald-500/30 hover:bg-emerald-500/20", dot: "bg-emerald-400", text: "text-emerald-400", label: "Done" },
  na:      { bg: "bg-slate-500/15 border-slate-500/30 hover:bg-slate-500/20",       dot: "bg-slate-500",   text: "text-slate-400",   label: "N/A"  },
  pending: { bg: "bg-[#0d1321] border-[#1e2d4a] hover:bg-[#111827]",               dot: "bg-slate-600",   text: "text-slate-500",   label: "—"    },
};

// ---------------------------------------------------------------------------
// Progress bar
// ---------------------------------------------------------------------------

function ProgressBar({ done, total }: { done: number; total: number }) {
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  const color =
    pct === 100 ? "bg-emerald-500" : pct >= 60 ? "bg-cyan-500" : pct >= 30 ? "bg-amber-500" : "bg-slate-600";
  return (
    <div className="mt-3 space-y-1">
      <div className="flex justify-between text-xs text-slate-500">
        <span>{done} / {total} complete</span>
        <span>{pct}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-[#1e2d4a] overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Single checklist panel
// ---------------------------------------------------------------------------

function ChecklistPanel({
  checklist,
  statuses,
  onToggle,
  onReset,
}: {
  checklist: Checklist;
  statuses: Record<string, ChecklistItem["status"]>;
  onToggle: (itemId: string) => void;
  onReset: () => void;
}) {
  const doneCount = checklist.items.filter((i) => (statuses[i.id] ?? "pending") === "done").length;

  return (
    <div className="rounded-2xl bg-[#0d1321] border border-[#1e2d4a] overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-[#1e2d4a] bg-[#0b0f1a] flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-white">{checklist.title} Checklist</h3>
          <p className="text-xs text-slate-500 mt-0.5">{checklist.description}</p>
          <ProgressBar done={doneCount} total={checklist.items.length} />
        </div>
        <button
          type="button"
          onClick={onReset}
          className="ml-4 text-xs text-slate-600 hover:text-slate-300 transition-colors shrink-0"
          aria-label="Reset checklist"
        >
          Reset
        </button>
      </div>

      {/* Items */}
      <div className="divide-y divide-[#1e2d4a]">
        {checklist.items.map((item) => {
          const status = statuses[item.id] ?? "pending";
          const style = STATUS_STYLES[status];
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onToggle(item.id)}
              className={`w-full text-left px-5 py-3.5 flex items-start gap-3 transition-colors ${style.bg} border-0`}
              aria-pressed={status === "done"}
              title={`Click to cycle status (pending → done → N/A → pending)`}
            >
              {/* Dot */}
              <span className={`mt-1 h-2.5 w-2.5 rounded-full shrink-0 ${style.dot}`} aria-hidden="true" />
              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${status === "done" ? "line-through text-slate-500" : "text-slate-200"}`}>
                  {item.label}
                </p>
                {item.detail && (
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{item.detail}</p>
                )}
              </div>
              {/* Status badge */}
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${style.bg} ${style.text} shrink-0 mt-0.5`}>
                {style.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Export */}
      <div className="px-5 py-3 border-t border-[#1e2d4a] bg-[#0b0f1a] flex justify-end">
        <button
          type="button"
          onClick={() => {
            const lines = [
              `# ${checklist.title} Checklist`,
              `Exported: ${new Date().toLocaleString()}`,
              "",
              ...checklist.items.map((i) => {
                const s = statuses[i.id] ?? "pending";
                const tick = s === "done" ? "[x]" : s === "na" ? "[~]" : "[ ]";
                return `${tick} ${i.label}`;
              }),
            ];
            navigator.clipboard.writeText(lines.join("\n")).catch(() => null);
          }}
          className="text-xs text-slate-500 hover:text-cyan-400 transition-colors flex items-center gap-1.5"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path d="M7 3.5A1.5 1.5 0 018.5 2h3.879a1.5 1.5 0 011.06.44l3.122 3.12A1.5 1.5 0 0117 6.622V12.5a1.5 1.5 0 01-1.5 1.5h-1v-3.379a3 3 0 00-.879-2.121L10.5 5.379A3 3 0 008.379 4.5H7v-1z" />
            <path d="M4.5 6A1.5 1.5 0 003 7.5v9A1.5 1.5 0 004.5 18h7a1.5 1.5 0 001.5-1.5v-5.879a1.5 1.5 0 00-.44-1.06L9.44 6.439A1.5 1.5 0 008.378 6H4.5z" />
          </svg>
          Copy checklist
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function M365ToolkitPage() {
  const [activeTab, setActiveTab] = useState(CHECKLISTS[0].id);
  // Map: checklistId → itemId → status
  // Initialize state from localStorage (lazy initializer avoids setState-in-effect lint warning)
  const [allStatuses, setAllStatuses] = useState<Record<string, Record<string, ChecklistItem["status"]>>>(loadState);

  // Persist on change
  useEffect(() => {
    if (Object.keys(allStatuses).length > 0) {
      saveState(allStatuses);
    }
  }, [allStatuses]);

  const toggleItem = useCallback((checklistId: string, itemId: string) => {
    setAllStatuses((prev) => {
      const current = prev[checklistId]?.[itemId] ?? "pending";
      // Cycle: pending → done → na → pending
      const next: ChecklistItem["status"] =
        current === "pending" ? "done" : current === "done" ? "na" : "pending";
      return {
        ...prev,
        [checklistId]: {
          ...(prev[checklistId] ?? {}),
          [itemId]: next,
        },
      };
    });
  }, []);

  const resetChecklist = useCallback((checklistId: string) => {
    setAllStatuses((prev) => ({ ...prev, [checklistId]: {} }));
  }, []);

  const activeChecklist = CHECKLISTS.find((c) => c.id === activeTab)!;
  const activeStatuses = allStatuses[activeTab] ?? {};

  // Summary stats across all checklists
  const totalItems = CHECKLISTS.reduce((s, c) => s + c.items.length, 0);
  const doneItems = CHECKLISTS.reduce((s, c) => {
    const st = allStatuses[c.id] ?? {};
    return s + c.items.filter((i) => st[i.id] === "done").length;
  }, 0);

  return (
    <ToolPageLayout
      title="Microsoft 365 Admin Toolkit"
      description="Interactive onboarding, offboarding, and configuration checklists for Microsoft 365 administration. Progress is saved in your browser."
    >
      {/* Summary strip */}
      <div className="mb-6 rounded-2xl bg-[#0d1321] border border-[#1e2d4a] p-4 flex flex-wrap gap-4 items-center">
        <div className="text-center min-w-[70px]">
          <p className="text-2xl font-bold text-white">{doneItems}</p>
          <p className="text-xs text-slate-500 mt-0.5">Completed</p>
        </div>
        <div className="text-center min-w-[70px]">
          <p className="text-2xl font-bold text-slate-300">{totalItems - doneItems}</p>
          <p className="text-xs text-slate-500 mt-0.5">Remaining</p>
        </div>
        <div className="text-center min-w-[70px]">
          <p className="text-2xl font-bold text-cyan-400">{totalItems}</p>
          <p className="text-xs text-slate-500 mt-0.5">Total checks</p>
        </div>
        <div className="flex-1 min-w-[160px]">
          <div className="flex justify-between text-xs text-slate-500 mb-1">
            <span>Overall progress</span>
            <span>{totalItems === 0 ? 0 : Math.round((doneItems / totalItems) * 100)}%</span>
          </div>
          <div className="h-2 rounded-full bg-[#1e2d4a] overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500"
              style={{ width: `${totalItems === 0 ? 0 : Math.round((doneItems / totalItems) * 100)}%` }}
            />
          </div>
        </div>
        <p className="text-xs text-slate-600 ml-auto">Progress saved in browser</p>
      </div>

      {/* Tab bar */}
      <div className="mb-5 flex flex-wrap gap-2" role="tablist">
        {CHECKLISTS.map((cl) => {
          const st = allStatuses[cl.id] ?? {};
          const done = cl.items.filter((i) => st[i.id] === "done").length;
          const isActive = activeTab === cl.id;
          return (
            <button
              key={cl.id}
              role="tab"
              aria-selected={isActive}
              type="button"
              onClick={() => setActiveTab(cl.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium border transition-all ${
                isActive
                  ? "bg-gradient-to-r from-cyan-500/20 to-blue-600/20 text-cyan-300 border-cyan-500/30 shadow-[0_0_8px_rgba(6,182,212,0.1)]"
                  : "bg-[#0d1321] text-slate-400 border-[#1e2d4a] hover:text-slate-200 hover:border-slate-600"
              }`}
            >
              <span aria-hidden="true">{cl.icon}</span>
              {cl.title}
              {done > 0 && (
                <span className="bg-emerald-500/20 text-emerald-400 text-[10px] px-1.5 py-0.5 rounded-full border border-emerald-500/30">
                  {done}/{cl.items.length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Active checklist */}
      <ChecklistPanel
        checklist={activeChecklist}
        statuses={activeStatuses}
        onToggle={(itemId) => toggleItem(activeChecklist.id, itemId)}
        onReset={() => resetChecklist(activeChecklist.id)}
      />

      {/* Help note */}
      <p className="mt-4 text-xs text-slate-600 text-center">
        Click any item to cycle its status: <span className="text-slate-500">Pending → Done → N/A → Pending</span>. Use &ldquo;Copy checklist&rdquo; to export to clipboard.
      </p>
    </ToolPageLayout>
  );
}
