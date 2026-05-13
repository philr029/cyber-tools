export type CertStatus = "Completed" | "In progress" | "Planned";

export type CertificatePlaceholder = {
  id: string;
  title: string;
  provider: string;
  status: CertStatus;
  /** ISO or human placeholder */
  dateNote?: string;
  notes: string;
  verifyUrl?: string;
};

/** Placeholder credentials — not claims of earned certifications. */
export const CERTIFICATE_PLACEHOLDERS: CertificatePlaceholder[] = [
  {
    id: "ms900",
    title: "Microsoft 365 Fundamentals",
    provider: "Microsoft Learn",
    status: "Planned",
    dateNote: "Placeholder",
    notes: "Study track placeholder for portfolio display only.",
    verifyUrl: "https://learn.microsoft.com/",
  },
  {
    id: "ms102",
    title: "Microsoft 365 Administrator",
    provider: "Microsoft Learn",
    status: "In progress",
    dateNote: "Placeholder",
    notes: "Mapped to in-app MS-102 notes; not a claim of certification.",
    verifyUrl: "https://learn.microsoft.com/",
  },
  {
    id: "secplus",
    title: "CompTIA Security+",
    provider: "CompTIA",
    status: "Planned",
    notes: "Exam prep index only — verify via Credly when earned.",
    verifyUrl: "https://www.comptia.org/",
  },
  {
    id: "cyber-ops",
    title: "Cybersecurity operations",
    provider: "Portfolio",
    status: "In progress",
    notes: "Hands-on tooling in SecureScope; not a third-party credential.",
  },
  {
    id: "it-admin",
    title: "IT administration",
    provider: "Portfolio",
    status: "Completed",
    notes: "Demonstrated via IT admin tool hub content (educational).",
  },
  {
    id: "mkt-ops",
    title: "Marketing operations",
    provider: "Portfolio",
    status: "Completed",
    notes: "Campaign QA and web testing modules (educational).",
  },
  {
    id: "automation",
    title: "Automation engineering",
    provider: "Portfolio",
    status: "In progress",
    notes: "Monitoring and planner tools — backend integrations roadmap.",
  },
  {
    id: "web-test",
    title: "Web testing",
    provider: "Portfolio",
    status: "Completed",
    notes: "Checklists and launch flows in the web QA hub.",
  },
  {
    id: "data-prot",
    title: "Data protection awareness",
    provider: "Placeholder",
    status: "Planned",
    notes: "Privacy/CMP wiring in this app — not legal advice.",
  },
  {
    id: "endpoint",
    title: "Endpoint security posture",
    provider: "Placeholder",
    status: "Planned",
    notes: "Defender/Malwarebytes checklists are guidance templates only.",
  },
];
