import type { Metadata } from "next";
import CategoryIndex from "@/app/components/tools/CategoryIndex";
import { categoryIndexTools } from "@/lib/tools/site-catalog";

export const metadata: Metadata = {
  title: "Web Tools — SecureScope Toolkit",
  description: "Website testing, status, redirect, broken link, meta, page speed and form QA tools.",
};

export default function WebToolsPage() {
  return (
    <CategoryIndex
      eyebrow="Web tools"
      title="Website Testing & QA"
      intro="A focused set of tools and checklists for verifying any website end-to-end — uptime, redirects, broken links, metadata, mobile, performance, and forms."
      tools={categoryIndexTools("Website Testing Tools")}
    />
  );
}
