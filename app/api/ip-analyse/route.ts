/**
 * GET /api/ip-analyse?ip=<address>
 *
 * Combines AbuseIPDB reputation data with an OpenAI cybersecurity analysis
 * into a single endpoint.  Both API keys are read from server-side environment
 * variables and are never exposed to the client.
 *
 * Returns:
 *   200 { ip, analysis, raw }
 *   400 { error }  — missing or invalid IP
 *   500 { error }  — upstream API failure
 *
 * Example: /api/ip-analyse?ip=8.8.8.8
 */

import type { NextRequest } from "next/server";
import { validateIP } from "@/lib/validators";
import { fetchIPReputation } from "@/lib/providers/abuseipdb";
import type { IPReputationResult } from "@/lib/types";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface OpenAIChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface OpenAIChoice {
  message: { content: string };
}

interface OpenAIError {
  error?: { message?: string };
}

// ---------------------------------------------------------------------------
// System prompt
// ---------------------------------------------------------------------------

const SYSTEM_PROMPT = `You are a concise cybersecurity analyst.
When given IP reputation data from AbuseIPDB, respond with a structured JSON
object that matches this schema exactly — no markdown, no extra keys:

{
  "summary": "<2-3 sentence executive summary>",
  "riskLevel": "Low" | "Medium" | "High" | "Critical",
  "keyFindings": ["<finding 1>", "<finding 2>", ...],
  "recommendations": ["<recommendation 1>", "<recommendation 2>", ...]
}

Rules:
- Be factual and concise.
- Base findings only on the provided data; do not invent information.
- keyFindings and recommendations must each have 2–5 items.
- Respond with raw JSON only.`;

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  const ip = (request.nextUrl.searchParams.get("ip") ?? "").trim();

  // 400 — missing or invalid IP
  const validation = validateIP(ip);
  if (!validation.ok) {
    return Response.json({ error: validation.message }, { status: 400 });
  }

  // Step 1: Fetch AbuseIPDB reputation data
  let abuseData: IPReputationResult | null;
  try {
    abuseData = await fetchIPReputation(ip);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[api/ip-analyse] AbuseIPDB error:", msg);
    return Response.json({ error: "Failed to fetch IP reputation data." }, { status: 500 });
  }

  if (!abuseData) {
    return Response.json(
      { error: "AbuseIPDB is not configured on this server." },
      { status: 503 },
    );
  }

  // Step 2: Send AbuseIPDB data to OpenAI for analysis
  const openaiKey = process.env.OPENAI_API_KEY;
  if (!openaiKey) {
    return Response.json(
      { error: "AI assistant is not configured on this server." },
      { status: 503 },
    );
  }

  const messages: OpenAIChatMessage[] = [
    { role: "system", content: SYSTEM_PROMPT },
    {
      role: "user",
      content: `Analyse the following AbuseIPDB reputation data for IP ${ip}:\n\n${JSON.stringify(abuseData, null, 2)}`,
    },
  ];

  let analysisText: string;
  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages,
        response_format: { type: "json_object" },
        temperature: 0.3,
      }),
    });

    if (!res.ok) {
      const errBody = (await res.json().catch(() => ({}))) as OpenAIError;
      const detail = errBody?.error?.message ?? res.statusText;
      console.error("[api/ip-analyse] OpenAI error:", res.status, detail);
      return Response.json({ error: "OpenAI request failed. Please try again." }, { status: 500 });
    }

    const data = (await res.json()) as { choices: OpenAIChoice[] };
    analysisText = data.choices?.[0]?.message?.content?.trim() ?? "";
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[api/ip-analyse] fetch error:", msg);
    return Response.json(
      { error: "Failed to reach the AI assistant. Please try again." },
      { status: 500 },
    );
  }

  // Parse the structured JSON analysis returned by OpenAI
  let analysis: unknown;
  try {
    analysis = JSON.parse(analysisText);
  } catch {
    console.error("[api/ip-analyse] JSON parse error. Raw text:", analysisText);
    return Response.json(
      { error: "AI returned an unexpected response format." },
      { status: 500 },
    );
  }

  return Response.json({
    ip,
    analysis,
    raw: abuseData,
  });
}
