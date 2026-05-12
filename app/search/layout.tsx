import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Search — SecureScope",
  description: "Search tools, hubs, dashboards, and pages across the SecureScope toolkit.",
};

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return children;
}
