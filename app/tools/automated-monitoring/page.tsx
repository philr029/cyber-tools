import type { Metadata } from "next";
import AutomatedMonitoringHubClient from "./AutomatedMonitoringHubClient";

export const metadata: Metadata = {
  title: "Automated Monitoring Hub — SecureScope",
  description:
    "Server-side monitoring dashboard for phone checks, uptime, forms, DNS, MXToolbox, advanced search, and alert planning — API keys never leave the server.",
};

export default function AutomatedMonitoringPage() {
  return <AutomatedMonitoringHubClient />;
}
