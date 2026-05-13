import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Security – SecureScope",
  description:
    "Security checklist: HTTPS, headers, API secrets, client-side encryption, storage, and API hardening guidance for SecureScope.",
};

export default function SecurityLayout({ children }: { children: React.ReactNode }) {
  return children;
}
