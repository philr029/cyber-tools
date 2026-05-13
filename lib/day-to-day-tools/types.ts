// =============================================================================
// Day-to-Day Tools — shared types for the hub catalog and panel renderer.
// Add new tools in `catalog.ts` by extending `DayToDayPanel` and handling the
// new `kind` inside `PanelRouter` (see app/components/day-to-day/PanelRouter.tsx).
// =============================================================================

export type DayToDayCategoryId =
  | "productivity"
  | "work"
  | "it-admin"
  | "marketing"
  | "finance"
  | "web";

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
      /** Maps to copy blocks + future server route hints — never store API keys client-side. */
      scenario: "dns" | "ip" | "mx" | "m365" | "phone" | "website" | "pension";
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
  | { kind: "utmBuilder" };

export interface DayToDayToolDefinition {
  id: string;
  title: string;
  description: string;
  categoryId: DayToDayCategoryId;
  keywords: string[];
  panel: DayToDayPanel;
}
