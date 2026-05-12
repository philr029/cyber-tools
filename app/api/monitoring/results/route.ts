import type { NextRequest } from "next/server";
import { listResults } from "@/lib/monitoring-hub/store";
import type { HubSortOption, HubTestType } from "@/lib/monitoring-hub/types";

export const runtime = "nodejs";

function parseTestType(v: string | null): HubTestType | "" {
  const allowed: HubTestType[] = [
    "phone",
    "website",
    "form",
    "domain",
    "mxtoolbox",
    "advanced_search",
    "error_log",
  ];
  if (!v) return "";
  return allowed.includes(v as HubTestType) ? (v as HubTestType) : "";
}

function parseStatus(v: string | null): "healthy" | "warning" | "failed" | "not_tested" | "" {
  if (!v) return "";
  if (v === "healthy" || v === "warning" || v === "failed" || v === "not_tested") return v;
  return "";
}

function parseSort(v: string | null): HubSortOption {
  if (v === "oldest" || v === "failed_first" || v === "slowest" || v === "testType") return v;
  return "newest";
}

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const minMs = sp.get("minResponseMs");
  const rows = listResults(
    {
      keyword: sp.get("keyword") ?? undefined,
      testType: parseTestType(sp.get("testType")),
      status: parseStatus(sp.get("status")),
      domain: sp.get("domain") ?? undefined,
      url: sp.get("url") ?? undefined,
      phone: sp.get("phone") ?? undefined,
      dateFrom: sp.get("dateFrom") ?? undefined,
      dateTo: sp.get("dateTo") ?? undefined,
      errorType: sp.get("errorType") ?? undefined,
      minResponseMs: minMs ? Number(minMs) : undefined,
    },
    parseSort(sp.get("sort")),
  );

  const limitRaw = sp.get("limit");
  const limit = Math.min(200, Math.max(1, Number(limitRaw) || 80));

  return Response.json({ data: rows.slice(0, limit), total: rows.length });
}
