"use client";

import {
  Briefcase,
  Browser,
  Code,
  GearSix,
  Megaphone,
  Package,
  ShieldCheck,
  Sparkle,
  TreeStructure,
  type IconProps,
} from "@phosphor-icons/react";
import type { ComponentType } from "react";
import UniversalToolCard from "@/app/components/UniversalToolCard";
import SectionReveal from "@/app/components/ui/SectionReveal";
import { DASHBOARD_SECTION_META, featuredToolsList, mostUsefulToolsList, type SiteTool } from "@/lib/tools/site-catalog";

const TAG_ICONS: Record<string, ComponentType<IconProps>> = {
  "Web QA": Browser,
  DNS: TreeStructure,
  Security: ShieldCheck,
  Marketing: Megaphone,
  Automation: GearSix,
  Developer: Code,
  AI: Sparkle,
  Productivity: Briefcase,
};

function iconForTool(t: SiteTool) {
  return TAG_ICONS[t.categoryTag] ?? Package;
}

function mergeUnique(a: SiteTool[], b: SiteTool[]) {
  const m = new Map<string, SiteTool>();
  for (const t of [...a, ...b]) {
    if (!m.has(t.href)) m.set(t.href, t);
  }
  return [...m.values()];
}

export default function ToolCards() {
  const items = mergeUnique(featuredToolsList(8), mostUsefulToolsList(8)).slice(0, 12);

  return (
    <SectionReveal>
      <div className="space-y-3">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest px-1">Spotlight tools</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-2.5">
          {items.map((tool) => (
            <UniversalToolCard
              key={tool.href}
              href={tool.href}
              title={tool.label}
              description={tool.description}
              categoryTag={tool.categoryTag}
              dashboardLabel={DASHBOARD_SECTION_META[tool.dashboardSection].label}
              icon={iconForTool(tool)}
              status={tool.status}
              tags={tool.displayTags}
              comingSoon={tool.comingSoon}
            />
          ))}
        </div>
      </div>
    </SectionReveal>
  );
}
