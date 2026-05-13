import type { Metadata } from "next";
import VaultPanel from "@/components/security/VaultPanel";

export const metadata: Metadata = {
  title: "Encrypted vault – SecureScope",
  description: "Optional client-side encryption for scan history stored in this browser.",
};

export default function DashboardVaultPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Encrypted vault</h1>
        <p className="text-sm text-slate-400 mt-1">
          Editors and admins can manage client-side encryption for local scan history. Viewers cannot open this page.
        </p>
      </div>
      <VaultPanel />
    </div>
  );
}
