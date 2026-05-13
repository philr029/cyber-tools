import { DAY_TO_DAY_TOOLS, dayToDayToolSearchUrl } from "./catalog";

/** One search row per mini-tool (unique `?t=` URLs so the global index does not dedupe them). */
export function dayToDaySearchEntries() {
  return DAY_TO_DAY_TOOLS.map((t) => ({
    title: t.title,
    description: t.description,
    category: "Day-to-Day Tools",
    tags: [...t.keywords, t.id, t.categoryId, "day to day", "daily tools"],
    url: dayToDayToolSearchUrl(t.id),
    toolType: "page" as const,
    toolkitAreas: [],
  }));
}

export function dayToDayHubSearchEntry() {
  return {
    title: "Day-to-Day Tools",
    description:
      "Practical planners, timers, office templates, finance helpers, and dev utilities — all in one hub.",
    category: "Day-to-Day Tools",
    tags: ["planner", "notes", "checklist", "timer", "utm", "json", "personal", "office"],
    url: "/day-to-day-tools",
    toolType: "page" as const,
    toolkitAreas: [],
  };
}
