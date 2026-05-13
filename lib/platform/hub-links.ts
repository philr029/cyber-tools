import { withBasePath } from "@/lib/base-path";

export type HubLink = {
  href: string;
  label: string;
  description?: string;
  /** Lucide-style single char or short tag */
  tag?: string;
};

/** Primary internal destinations — use with `withBasePath` for fetch; Link accepts paths. */
export const PLATFORM_HUB_LINKS: HubLink[] = [
  { href: "/dashboard", label: "Dashboard", description: "Signed-in workspace", tag: "Hub" },
  { href: "/tools/browse", label: "Tools", description: "Full catalog", tag: "All" },
  { href: "/domain-ip-tools", label: "IT toolkit", description: "DNS, mail, SSL", tag: "IT" },
  { href: "/marketing-tools", label: "Marketing toolkit", description: "Campaign QA", tag: "Mkt" },
  { href: "/cyber-tools", label: "Cyber toolkit", description: "Hardening & IR", tag: "Sec" },
  { href: "/web-tools", label: "Website testing", description: "Launch QA", tag: "Web" },
  { href: "/lead-tools", label: "Phone testing", description: "Lines & IVR", tag: "Tel" },
  { href: "/projects/finance-dashboard", label: "Finance toolkit", description: "Controls-aware flows", tag: "Fin" },
  { href: "/coding-tools", label: "Developer tools", description: "Snippets & APIs", tag: "Dev" },
  { href: "/automation-tools", label: "Automation hub", description: "Schedules & monitors", tag: "Auto" },
  { href: "/pricing", label: "Pricing", description: "Plans (placeholders)", tag: "Pro" },
  { href: "/security", label: "Security", description: "Principles & checklist", tag: "Trust" },
  { href: "/docs", label: "Help & docs", description: "Getting started", tag: "Docs" },
  { href: "/forms", label: "Forms centre", description: "Requests & exports", tag: "Forms" },
  { href: "/contact", label: "Contact", description: "Access & sales", tag: "Mail" },
  { href: "/credentials", label: "Credentials", description: "Learning placeholders", tag: "Certs" },
];

export const EXTERNAL_LINKS = {
  githubRepo: "https://github.com/philr029/cyber-tools",
  portfolio: "https://github.com/philr029",
} as const;

export function hubHref(path: string) {
  return withBasePath(path);
}
