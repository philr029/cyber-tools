// =============================================================================
// Day-to-Day Tools — category metadata (single source for filters + cards).
// =============================================================================

import type { DayToDayCategory } from "./types";

export const DAY_TO_DAY_CATEGORIES: DayToDayCategory[] = [
  { id: "productivity", label: "Productivity Tools", description: "Plan, focus, capture notes, and keep lightweight logs." },
  { id: "work", label: "Work / Office Tools", description: "Email helpers, agendas, logs, and office templates." },
  { id: "it-admin", label: "IT Admin Tools", description: "Checklists, trackers, and placeholders for infra lookups." },
  { id: "it-support", label: "IT Support Toolkit", description: "Helpdesk notes, triage checklists, handovers, and quick references." },
  { id: "m365-admin", label: "Microsoft 365 Admin", description: "Identity lifecycle, Exchange, Teams, Intune, and audit templates." },
  { id: "cyber", label: "Cybersecurity Toolkit", description: "IR notes, phishing review, vuln tracking, and hygiene checklists." },
  { id: "marketing", label: "Marketing Tools", description: "Campaign scaffolding, captions, UTMs, and QA lists." },
  { id: "marketing-ops", label: "Marketing Operations", description: "Daily checks, QA, planning, and attribution utilities." },
  { id: "website-testing", label: "Website Testing", description: "Forms, accessibility, performance notes, and regression logs." },
  { id: "phone-leads", label: "Phone / Lead Testing", description: "Call logs, SLA timers, escalation notes, and exports." },
  { id: "finance", label: "Finance / Personal Tools", description: "Calculators and simple trackers for personal finance." },
  { id: "finance-life", label: "Finance & Life Admin", description: "Budgets, pots, bills, subscriptions, and long-term goals." },
  { id: "web", label: "Web / Developer Tools", description: "Encoders, formatters, previews, and quick utilities." },
  { id: "developer", label: "Developer Utilities", description: "Text tools, previews, snippets, and API integration notes." },
  { id: "dashboard", label: "Daily Work Dashboard", description: "Personal hub for priorities, notes, and end-of-day reporting." },
  { id: "automation", label: "Automation Ideas Hub", description: "Backend-ready sketches for scheduled checks and integrations." },
];
