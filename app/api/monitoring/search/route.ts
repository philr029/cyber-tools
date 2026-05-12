import type { NextRequest } from "next/server";
import { listResults, addTestResult } from "@/lib/monitoring-hub/store";
import type { HubSearchFilters, HubSortOption } from "@/lib/monitoring-hub/types";
import { clientIpFromRequest, rateLimitExceeded } from "@/lib/monitoring-hub/rate-limit-ip";

export const runtime = "nodejs";

function parseBodyFilters(b: Record<string, unknown>): HubSearchFilters {
  return {
    keyword: typeof b.keyword === "string" ? b.keyword : undefined,
    testType: (b.testType as HubSearchFilters["testType"]) || undefined,
    status: (b.status as HubSearchFilters["status"]) || undefined,
    domain: typeof b.domain === "string" ? b.domain : undefined,
    url: typeof b.url === "string" ? b.url : undefined,
    phone: typeof b.phone === "string" ? b.phone : undefined,
    dateFrom: typeof b.dateFrom === "string" ? b.dateFrom : undefined,
    dateTo: typeof b.dateTo === "string" ? b.dateTo : undefined,
    errorType: typeof b.errorType === "string" ? b.errorType : undefined,
    minResponseMs: typeof b.minResponseMs === "number" ? b.minResponseMs : undefined,
  };
}

export async function POST(request: NextRequest) {
  const ip = clientIpFromRequest(request);
  if (rateLimitExceeded(ip)) {
    return Response.json({ error: "Too many requests." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const b = body as Record<string, unknown>;
  const filters = parseBodyFilters(b);
  const sort = (typeof b.sort === "string" ? b.sort : "newest") as HubSortOption;
  const limit = Math.min(200, Math.max(1, Number(b.limit) || 80));

  const rows = listResults(filters, sort).slice(0, limit);

  const row = addTestResult({
    testType: "advanced_search",
    target: "search",
    status: "healthy",
    responseTime: null,
    summary: `Advanced search returned ${rows.length} row(s).`,
    rawResult: { filters, sort, limit, snapshotCount: rows.length },
    errorMessage: null,
    source: "manual",
    label: "advanced_search",
  });

  return Response.json({ data: { results: rows, searchMeta: row } });
}
