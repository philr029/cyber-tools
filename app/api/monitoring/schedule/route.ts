import type { NextRequest } from "next/server";
import { getGlobalSchedule, setGlobalSchedule } from "@/lib/monitoring-hub/store";
import type { HubSchedule } from "@/lib/monitoring-hub/types";
import { clientIpFromRequest, rateLimitExceeded } from "@/lib/monitoring-hub/rate-limit-ip";

export const runtime = "nodejs";

const ALLOWED: HubSchedule[] = ["manual", "15m", "hourly", "daily", "weekly"];

export async function GET() {
  return Response.json({
    data: {
      schedule: getGlobalSchedule(),
      /**
       * Scheduling is intentionally not executed inside this demo app.
       * Wire your chosen scheduler to hit the `/api/monitoring/run/*` routes:
       * - Vercel Cron (`vercel.json` crons hitting signed API routes)
       * - GitHub Actions (`on: schedule` + `curl` / Playwright)
       * - Supabase scheduled functions / pg_cron
       * - n8n, Zapier, Make, or Power Automate recurring flows
       */
      hints: ["vercel_cron", "github_actions", "supabase_scheduler", "n8n", "zapier", "make", "power_automate"],
    },
  });
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

  const schedule = (body as { schedule?: string }).schedule;
  if (!schedule || !ALLOWED.includes(schedule as HubSchedule)) {
    return Response.json({ error: "Invalid schedule value." }, { status: 400 });
  }

  setGlobalSchedule(schedule as HubSchedule);
  return Response.json({ ok: true, data: { schedule: getGlobalSchedule() } });
}
