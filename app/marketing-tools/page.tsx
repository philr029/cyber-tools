import type { Metadata } from "next";
import MarketingToolsHub from "@/app/components/marketing/MarketingToolsHub";

export const metadata: Metadata = {
  title: "Marketing Tools — SecureScope",
  description:
    "SEO, content, social, email, paid media, analytics and campaign utilities — with search, filters and live generators.",
};

export default function MarketingToolsPage() {
  return <MarketingToolsHub />;
}
