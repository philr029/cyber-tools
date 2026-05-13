import type { Metadata } from "next";
import DayToDayToolsClient from "@/app/components/day-to-day/DayToDayToolsClient";

export const metadata: Metadata = {
  title: "Day-to-Day Tools — SecureScope",
  description:
    "Productivity, office, IT admin, marketing, finance, and developer utilities — planners, timers, templates, trackers, and formatters with local export.",
};

export default function DayToDayToolsPage() {
  return <DayToDayToolsClient />;
}
