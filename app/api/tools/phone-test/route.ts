import type { NextRequest } from "next/server";
import twilio from "twilio";

export const runtime = "nodejs";

const E164_REGEX = /^\+[1-9]\d{1,14}$/;
const MAX_NUMBERS_PER_REQUEST = 25;
const CALL_DELAY_MS = 1_200;

interface CallResult {
  phoneNumber: string;
  ok: boolean;
  callSid: string | null;
  status: "queued" | "failed";
  error: string | null;
}

function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

function escapeXml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { phone_numbers, test_message } = body as Record<string, unknown>;

  if (!Array.isArray(phone_numbers)) {
    return Response.json(
      { error: "phone_numbers must be an array of E.164 phone numbers." },
      { status: 400 },
    );
  }

  if (phone_numbers.length === 0) {
    return Response.json(
      { error: "At least one phone number is required." },
      { status: 400 },
    );
  }

  if (phone_numbers.length > MAX_NUMBERS_PER_REQUEST) {
    return Response.json(
      {
        error: `Too many phone numbers. Maximum allowed per request is ${MAX_NUMBERS_PER_REQUEST}.`,
      },
      { status: 400 },
    );
  }

  const message = typeof test_message === "string" ? test_message.trim() : "";
  if (!message) {
    return Response.json({ error: "test_message is required." }, { status: 400 });
  }

  const numbers = phone_numbers.map((n) => String(n).trim());
  const invalidNumbers = numbers.filter((n) => !E164_REGEX.test(n));
  if (invalidNumbers.length > 0) {
    return Response.json(
      {
        error: "All phone numbers must be in E.164 format.",
        invalid_phone_numbers: invalidNumbers,
      },
      { status: 400 },
    );
  }

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_FROM_NUMBER;

  if (!accountSid || !authToken || !fromNumber) {
    return Response.json(
      {
        error:
          "Twilio is not fully configured. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_FROM_NUMBER.",
      },
      { status: 503 },
    );
  }

  const client = twilio(accountSid, authToken);
  const escapedMessage = escapeXml(message);
  const twiml = `<Response><Say>${escapedMessage}</Say></Response>`;
  const results: CallResult[] = [];

  for (let i = 0; i < numbers.length; i++) {
    const to = numbers[i];
    try {
      const call = await client.calls.create({
        to,
        from: fromNumber,
        twiml,
      });
      results.push({
        phoneNumber: to,
        ok: true,
        callSid: call.sid ?? null,
        status: "queued",
        error: null,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to queue call.";
      results.push({
        phoneNumber: to,
        ok: false,
        callSid: null,
        status: "failed",
        error: message,
      });
    }

    if (i < numbers.length - 1) {
      await sleep(CALL_DELAY_MS);
    }
  }

  const queued = results.filter((r) => r.ok).length;
  const failed = results.length - queued;

  return Response.json({
    data: {
      total: results.length,
      queued,
      failed,
      delayMsBetweenCalls: CALL_DELAY_MS,
      results,
    },
  });
}
