import type { NextRequest } from "next/server";
import { getConfigs, replaceConfigs } from "@/lib/monitoring-hub/store";
import type { HubSchedule, HubTestType, TestConfig } from "@/lib/monitoring-hub/types";
import { clientIpFromRequest, rateLimitExceeded } from "@/lib/monitoring-hub/rate-limit-ip";

export const runtime = "nodejs";

const ALLOWED_TYPES: HubTestType[] = [
  "phone",
  "website",
  "form",
  "domain",
  "mxtoolbox",
  "advanced_search",
  "error_log",
];

const ALLOWED_SCHEDULE: HubSchedule[] = ["manual", "15m", "hourly", "daily", "weekly"];

function isTestConfig(x: unknown): x is TestConfig {
  if (!x || typeof x !== "object") return false;
  const o = x as Record<string, unknown>;
  return (
    typeof o.id === "string" &&
    typeof o.name === "string" &&
    typeof o.testType === "string" &&
    ALLOWED_TYPES.includes(o.testType as HubTestType) &&
    typeof o.target === "string" &&
    typeof o.enabled === "boolean" &&
    typeof o.schedule === "string" &&
    ALLOWED_SCHEDULE.includes(o.schedule as HubSchedule) &&
    typeof o.createdAt === "string" &&
    typeof o.updatedAt === "string"
  );
}

export async function GET() {
  return Response.json({ data: getConfigs() });
}

export async function PUT(request: NextRequest) {
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

  const { configs } = body as { configs?: unknown };
  if (!Array.isArray(configs)) {
    return Response.json({ error: "configs must be an array." }, { status: 400 });
  }

  const cleaned: TestConfig[] = [];
  for (const c of configs) {
    if (isTestConfig(c)) {
      cleaned.push({
        ...c,
        name: c.name.slice(0, 120),
        target: c.target.slice(0, 2048),
      });
    }
  }

  replaceConfigs(cleaned);
  return Response.json({ ok: true, data: getConfigs() });
}
