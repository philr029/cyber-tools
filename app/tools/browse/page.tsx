import type { Metadata } from "next";
import ToolkitBrowseClient from "./ToolkitBrowseClient";

export const metadata: Metadata = {
  title: "Browse toolkit — SecureScope",
  description: "Filterable dashboard of every tool, checklist, and hub in the SecureScope catalogue.",
};

export default function ToolkitBrowsePage() {
  return (
    <main className="flex-1 bg-[#050505]">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <ToolkitBrowseClient />
      </div>
    </main>
  );
}
