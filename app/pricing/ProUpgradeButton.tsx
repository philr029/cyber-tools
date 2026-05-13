"use client";

import Link from "next/link";
import { withBasePath } from "@/lib/base-path";

/** Placeholder upgrade control — routes to pricing until server-side checkout exists. */
export default function ProUpgradeButton() {
  return (
    <Link
      href={withBasePath("/pricing")}
      className="block w-full rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 py-2.5 text-center text-sm font-semibold text-white shadow-lg shadow-cyan-900/25 motion-safe:transition-[transform,opacity] motion-safe:hover:opacity-95"
    >
      Compare plans
    </Link>
  );
}
