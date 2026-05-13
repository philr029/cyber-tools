// =============================================================================
// Day-to-Day Tools — shared types for the hub catalog and panel renderer.
// =============================================================================

export type DayToDayToolLabel = "most-used" | "recently-added" | "automation-ready";

export type DayToDayCategoryId =
  | "productivity"
  | "work"
  | "it-admin"
  | "it-support"
  | "m365-admin"
  | "cyber"
  | "marketing"
  | "marketing-ops"
  | "website-testing"
  | "phone-leads"
  | "finance"
  | "finance-life"
  | "web"
  | "developer"
  | "dashboard"
  | "automation";

export interface DayToDayCategory {
  id: DayToDayCategoryId;
  label: string;
  description: string;
}

/** Discriminated panel definitions — each `kind` is routed in PanelRouter. */
export type DayToDayPanel =
  | { kind: "notes"; storageKey: string; placeholder?: string }
  | { kind: "checklist"; storageKey: string; seedItems?: string[] }
  | { kind: "staticChecklist"; items: string[] }
  | { kind: "priorityMatrix"; storageKey: string }
  | { kind: "reminders"; storageKey: string }
  | { kind: "timer"; variant: "pomodoro" | "focus" }
  | { kind: "hourlyPlanner"; storageKey: string }
  | { kind: "snippetLibrary"; storageKey: string }
  | { kind: "generator"; templateId: string }
  | { kind: "rowLog"; storageKey: string; columns: { id: string; label: string; width?: string }[] }
  | { kind: "timeTracker"; storageKey: string }
  | { kind: "passwordGen" }
  | { kind: "licenseTable"; storageKey: string }
  | {
      kind: "apiPlaceholder";
      scenario: "dns" | "ip" | "mx" | "m365" | "phone" | "website" | "pension" | "broken-links" | "seo-meta" | "regex-safe";
    }
  | { kind: "portsReference" }
  | { kind: "savingsCalculator" }
  | { kind: "emergencyFund"; storageKey: string }
  | { kind: "subscriptionTable"; storageKey: string }
  | { kind: "debtPlanner"; storageKey: string }
  | { kind: "budgetSplit" }
  | { kind: "payRise" }
  | { kind: "jsonTool" }
  | { kind: "base64Tool" }
  | { kind: "urlTool" }
  | { kind: "slugTool" }
  | { kind: "caseTool" }
  | { kind: "countTool" }
  | { kind: "regexPlaceholder" }
  | { kind: "markdownPreview" }
  | { kind: "htmlPreview" }
  | { kind: "colorPalette" }
  | { kind: "utmBuilder" }
  | { kind: "dailyDashboard"; storageKey: string }
  | { kind: "richPlaceholder"; placeholderId: string }
  | { kind: "textDiff" }
  | { kind: "csvCleaner" }
  | { kind: "cssShadow" }
  | { kind: "cssGradient" }
  | { kind: "queryStringBuilder" }
  | { kind: "urlParser" }
  | { kind: "commandReference"; variant: "windows" | "mac" | "playwright" }
  | { kind: "amountTracker"; storageKey: string; headline: string }
  | { kind: "leadResponseCalculator" };

export interface DayToDayToolDefinition {
  id: string;
  title: string;
  description: string;
  categoryId: DayToDayCategoryId;
  keywords: string[];
  /** UI badges for discovery and automation readiness. */
  labels?: DayToDayToolLabel[];
  panel: DayToDayPanel;
}
