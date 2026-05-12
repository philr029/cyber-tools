import type { Metadata } from "next";
import CategoryIndex from "@/app/components/tools/CategoryIndex";
import { categoryCardsWhere } from "@/lib/tools/site-catalog";

export const metadata: Metadata = {
  title: "Microsoft 365 Tools — SecureScope Toolkit",
  description: "Microsoft 365 lifecycle, MFA, Conditional Access, Teams Phone, Intune, and Defender checklists.",
};

export default function M365ToolsPage() {
  return (
    <CategoryIndex
      eyebrow="Microsoft 365"
      title="Microsoft 365 Tools"
      intro="Practical checklists and generators for the workflows that fill an IT engineer's day — onboarding, offboarding, licensing, MFA, Conditional Access, Teams Phone, Intune and Defender."
      tools={categoryCardsWhere((t) => t.href === "/m365-tools" || t.href.startsWith("/tools/m365/"))}
    />
  );
}
