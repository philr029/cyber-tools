import type { Metadata } from "next";
import CategoryIndex from "@/app/components/tools/CategoryIndex";
import { categoryIndexTools } from "@/lib/tools/site-catalog";

export const metadata: Metadata = {
  title: "Cyber Tools — SecureScope Toolkit",
  description: "IP reputation, domain reputation, security headers, SSL, DNS, and phishing inspection tools.",
};

export default function CyberToolsPage() {
  return (
    <CategoryIndex
      eyebrow="Cyber tools"
      title="Cyber & Security Tools"
      intro="Reputation lookups, transport hardening checks, and lightweight phishing triage — designed to plug straight into VirusTotal, AbuseIPDB, and Microsoft 365 security data."
      tools={categoryIndexTools("Security Tools")}
    />
  );
}
