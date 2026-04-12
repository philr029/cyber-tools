/**
 * GET/POST /api/ai
 *
 * Cybersecurity assistant backed by Google Gemini (gemini-1.5-flash).
 * The API key is read exclusively from the server-side environment variable
 * GEMINI_API_KEY — it is never exposed to the browser.
 *
 * Accepts:
 *   GET  /api/ai?message=<text>
 *   POST /api/ai  { "message": "<text>" }
 *
 * Returns:
 *   200 { summary, riskLevel, keyFindings, recommendations }
 *   400 { error }   — missing / empty message
 *   503 { error }   — API key not configured
 *   502 { error }   — Gemini call failed
 */

import type { NextRequest } from "next/server";
import { generateStructuredReport } from "@/lib/gemini";

// ---------------------------------------------------------------------------
// Shared handler — called by both GET and POST
// ---------------------------------------------------------------------------

async function handleRequest(message: string): Promise<Response> {
  const trimmed = message.trim();

  if (!trimmed) {
    return Response.json({ error: "A message is required." }, { status: 400 });
  }

  if (trimmed.length > 4000) {
    return Response.json(
      { error: "Message exceeds the maximum allowed length." },
      { status: 400 },
    );
  }

  if (!process.env.GEMINI_API_KEY) {
    return Response.json(
      { error: "AI assistant is not configured on this server." },
      { status: 503 },
    );
  }

  try {
    const report = await generateStructuredReport(trimmed);
    return Response.json(report);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[api/ai] Gemini error:", msg);
    return Response.json(
      { error: "Failed to get a response from the AI assistant." },
      { status: 502 },
    );
  }
}

// ---------------------------------------------------------------------------
// Route handlers
// ---------------------------------------------------------------------------

/** GET /api/ai?message=<text> */
export async function GET(request: NextRequest) {
  const message = request.nextUrl.searchParams.get("message") ?? "";
  return handleRequest(message);
}

/** POST /api/ai  body: { message: string } */
export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const message = ((body as Record<string, unknown>).message ?? "").toString();
  return handleRequest(message);
}
