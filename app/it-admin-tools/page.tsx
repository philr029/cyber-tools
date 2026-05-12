import type { Metadata } from "next";
import CategoryIndex from "@/app/components/tools/CategoryIndex";
import { categoryCardsWhere } from "@/lib/tools/site-catalog";

export const metadata: Metadata = {
  title: "IT Admin Tools — SecureScope Toolkit",
  description: "Service desk, device builds, access reviews, licence planning, and software install workflows.",
};

export default function ItAdminToolsPage() {
  return (
    <CategoryIndex
      eyebrow="IT admin"
      title="IT Admin Automation"
      intro="Turn common service-desk and field-engineer tasks into repeatable checklists — mailbox requests, licence planning, access reviews, triage, golden builds and software installs."
      tools={categoryCardsWhere((t) => t.href === "/it-admin-tools" || t.href.startsWith("/tools/it-admin/"))}
    />
  );
}
