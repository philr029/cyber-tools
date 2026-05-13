// =============================================================================
// Day-to-Day Tools — merged catalog (legacy + expanded).
// Add tools in `catalog-expanded-*.ts` or `catalog-legacy.ts`, then handle new
// `panel.kind` values inside `PanelRouter`.
// =============================================================================

import type { DayToDayToolDefinition } from "./types";
import { DAY_TO_DAY_CATEGORIES } from "./day-to-day-categories";
import { LEGACY_DAY_TO_DAY_TOOLS } from "./catalog-legacy";
import { EXPANDED_DAY_TO_DAY_TOOLS } from "./catalog-expanded";

export { DAY_TO_DAY_CATEGORIES };

export const DAY_TO_DAY_TOOLS: DayToDayToolDefinition[] = [...LEGACY_DAY_TO_DAY_TOOLS, ...EXPANDED_DAY_TO_DAY_TOOLS];

export function getDayToDayToolById(id: string): DayToDayToolDefinition | undefined {
  return DAY_TO_DAY_TOOLS.find((t) => t.id === id);
}

export function dayToDayToolSearchUrl(toolId: string): string {
  return `/day-to-day-tools?t=${encodeURIComponent(toolId)}`;
}
