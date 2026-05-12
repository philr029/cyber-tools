import type { NextRequest } from "next/server";
import {
  getAlertSettings,
  setAlertSettings,
  touchMockAlertDispatch,
} from "@/lib/monitoring-hub/store";
import type { AlertSettings } from "@/lib/monitoring-hub/types";
import { clientIpFromRequest, rateLimitExceeded } from "@/lib/monitoring-hub/rate-limit-ip";

export const runtime = "nodejs";

function isAlertSettings(x: unknown): x is AlertSettings {
  if (!x || typeof x !== "object") return false;
  const o = x as AlertSettings;
  return typeof o.channels === "object" && o.channels !== null;
}

export async function GET() {
  return Response.json({ data: getAlertSettings() });
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

  if (!isAlertSettings(body)) {
    return Response.json({ error: "Invalid alert settings payload." }, { status: 400 });
  }

  setAlertSettings(body);
  return Response.json({ ok: true, data: getAlertSettings() });
}

/** Mock-only: records a synthetic dispatch timestamp for UI demos. */
export async function POST(request: NextRequest) {
  const ip = clientIpFromRequest(request);
  if (rateLimitExceeded(ip)) {
    return Response.json({ error: "Too many requests." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    body = {};
  }
  const action = (body as { action?: string }).action;
  if (action !== "mock_dispatch") {
    return Response.json({ error: 'Set { "action": "mock_dispatch" } to simulate an alert run.' }, { status: 400 });
  }

  touchMockAlertDispatch();
  return Response.json({
    ok: true,
    message:
      "Mock alert dispatch recorded. Replace this with SendGrid, Slack Incoming Webhooks, Twilio SMS, etc. using the destinations saved in alert settings.",
    data: getAlertSettings(),
  });
}
