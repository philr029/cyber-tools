import type { Metadata } from "next";
import CategoryIndex from "@/app/components/tools/CategoryIndex";
import { categoryIndexTools } from "@/lib/tools/site-catalog";

export const metadata: Metadata = {
  title: "Domain & IP Tools — SecureScope Toolkit",
  description: "WHOIS, DNS, MX, geolocation, blacklist, deliverability, and email header tools.",
};

export default function DomainIpToolsPage() {
  return (
    <CategoryIndex
      eyebrow="Domain & DNS"
      title="Domain, DNS & Mail Path Tools"
      intro="Everything you need to reason about a hostname or IP — registration context, authoritative DNS, mail exchangers, reputation, and header-level forensics."
      tools={categoryIndexTools("Domain & DNS Tools")}
    />
  );
}
