import type { Metadata } from "next";
import CertificatesShowcase from "@/app/components/trust/CertificatesShowcase";

export const metadata: Metadata = {
  title: "Credentials – SecureScope",
  description: "Study and capability placeholders — not third-party verification claims.",
};

export default function CredentialsPage() {
  return (
    <main className="flex-1 max-w-7xl mx-auto px-4 py-14">
      <CertificatesShowcase />
    </main>
  );
}
