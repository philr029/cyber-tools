import type { ToolkitSearchFilter } from "@/lib/tools/site-catalog";

/** Curated entries merged into the global search index (icons + keywords). */
export interface SearchIndexIconEntry {
  title: string;
  category: string;
  description: string;
  url: string;
  keywords: string[];
  icon: string;
  toolkitAreas?: ToolkitSearchFilter[];
}

export const SEARCH_INDEX_ICON_ENTRIES: SearchIndexIconEntry[] = [
  {
    title: "Resources hub",
    category: "Resources",
    description: "Documentation, exam maps, runbooks, and GitHub study notes.",
    url: "/resources",
    keywords: ["docs", "learn", "certification", "comptia", "microsoft", "study"],
    icon: "BookOpen",
    toolkitAreas: ["IT tools"],
  },
  {
    title: "MS-102 study map",
    category: "Resources",
    description: "Microsoft 365 Administrator track — topics aligned to SecureScope tools.",
    url: "/resources/ms-102",
    keywords: ["m365", "entra", "exchange", "exam", "administrator", "ms102"],
    icon: "Certificate",
    toolkitAreas: ["Microsoft 365"],
  },
  {
    title: "Security+ study map",
    category: "Resources",
    description: "Security+ concepts cross-linked to checklists and labs in the toolkit.",
    url: "/resources/security-plus",
    keywords: ["comptia", "sy0", "risk", "cryptography", "network security"],
    icon: "ShieldCheck",
    toolkitAreas: ["Cybersecurity"],
  },
  {
    title: "GitHub notes",
    category: "Resources",
    description: "Actions, branch protection, and repo hygiene references.",
    url: "/resources/github-notes",
    keywords: ["git", "actions", "cicd", "pull request", "repository"],
    icon: "GithubLogo",
    toolkitAreas: ["Coding"],
  },
  {
    title: "Portfolio",
    category: "Projects",
    description: "Selected builds and how SecureScope tools supported delivery.",
    url: "/projects/portfolio",
    keywords: ["philip", "case study", "work samples"],
    icon: "Briefcase",
    toolkitAreas: ["IT tools"],
  },
  {
    title: "TutorCare tests",
    category: "Projects",
    description: "Structured QA notes for the TutorCare engagement.",
    url: "/projects/tutorcare-tests",
    keywords: ["qa", "tutor", "education", "regression"],
    icon: "Student",
    toolkitAreas: ["Website testing"],
  },
  {
    title: "BitLocker checklist",
    category: "Security",
    description: "Disk encryption, escrow, and recovery validation.",
    url: "/tools/security/bitlocker-checklist",
    keywords: ["encryption", "intune", "windows", "recovery key"],
    icon: "Lock",
    toolkitAreas: ["Microsoft 365", "Cybersecurity"],
  },
  {
    title: "Malwarebytes checklist",
    category: "Security",
    description: "MBAM deployment tests and escalation-friendly findings log.",
    url: "/tools/security/malwarebytes-checklist",
    keywords: ["antimalware", "endpoint", "scan", "remediation"],
    icon: "Bug",
    toolkitAreas: ["Cybersecurity"],
  },
  {
    title: "Admin hardening checklist",
    category: "Security",
    description: "Privileged roles, break-glass, and tenant-wide guardrails.",
    url: "/tools/security/admin-hardening-checklist",
    keywords: ["pim", "global admin", "conditional access", "least privilege"],
    icon: "UserGear",
    toolkitAreas: ["Cybersecurity", "Microsoft 365"],
  },
  {
    title: "Port blocking checklist",
    category: "Security",
    description: "Host firewall posture for workstations and servers.",
    url: "/tools/security/port-blocking-checklist",
    keywords: ["firewall", "nsg", "defender", "hardening"],
    icon: "Plugs",
    toolkitAreas: ["Cybersecurity"],
  },
];
