import type { NextRequest } from "next/server";
import { addTestResult, addErrorLog } from "@/lib/monitoring-hub/store";
import { simulatePhoneTest } from "@/lib/monitoring-hub/phone-simulator";
import { clientIpFromRequest, rateLimitExceeded } from "@/lib/monitoring-hub/rate-limit-ip";
import type { HubStatus } from "@/lib/monitoring-hub/types";

export const runtime = "nodejs";

const E164 = /^\+[1-9]\d{6,14}$/;

function outcomeToStatus(o: ReturnType<typeof simulatePhoneTest>["outcome"]): HubStatus {
  if (o === "connected") return "healthy";
  if (o === "failed" || o === "error") return "failed";
  return "warning";
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

  const { testName, phone, expectedResult } = body as Record<string, unknown>;
  const name = typeof testName === "string" ? testName.trim().slice(0, 120) : "";
  const e164 = typeof phone === "string" ? phone.trim() : "";
  const expected = typeof expectedResult === "string" ? expectedResult.trim().slice(0, 200) : "";

  if (!name) {
    return Response.json({ error: "testName is required." }, { status: 400 });
  }
  if (!E164.test(e164)) {
    return Response.json(
      { error: "phone must be in E.164 format (e.g. +447911123456)." },
      { status: 400 },
    );
  }

  try {
    const sim = simulatePhoneTest(e164);
    const status = outcomeToStatus(sim.outcome);
    const row = addTestResult({
      testType: "phone",
      target: e164,
      status,
      responseTime: sim.durationSec * 1000,
      summary: `${name}: ${sim.outcome.replace(/_/g, " ")} — ${sim.notes}`,
      rawResult: {
        testName: name,
        expectedResult: expected || null,
        ...sim,
        integrationNote:
          "Swap simulatePhoneTest() for Twilio call creation + status callbacks; keep secrets in TWILIO_* env vars only.",
      },
      errorMessage: status === "failed" ? sim.notes : null,
      source: "mock",
      label: name,
    });

    return Response.json({ data: row, mock: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Phone test failed.";
    addErrorLog("Phone test runner crashed.", { message: msg });
    return Response.json({ error: msg }, { status: 500 });
  }
}
