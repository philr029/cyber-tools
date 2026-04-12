/**
 * GET/POST /api/ai
 *
 * Cybersecurity assistant backed by OpenAI (gpt-4o-mini).
 * The API key is read exclusively from the server-side environment variable
 * OPENAI_API_KEY — it is never exposed to the browser.
 *
 * Accepts:
 *   GET  /api/ai?message=<text>
 *   POST /api/ai  { "message": "<text>" }
 *
 * Returns:
 *   200 { summary, riskLevel, keyFindings, recommendations }
 *   400 { error }   — missing / empty message
 *   500 { error }   — OpenAI call failed
 */

import type { NextRequest } from "next/server";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AIResponse {
  summary: string;
  riskLevel: "Low" | "Medium" | "High" | "Critical";
  keyFindings: string[];
  recommendations: string[];
}

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
// System prompt — gives the model its cybersecurity persona and output schema
// ---------------------------------------------------------------------------

const SYSTEM_PROMPT = `You are a concise cybersecurity assistant.
When given a question or target (IP, domain, URL, description), respond with a
structured JSON object that matches this schema exactly — no markdown, no extra keys:

{
  "summary": "<2-3 sentence executive summary>",
  "riskLevel": "Low" | "Medium" | "High" | "Critical",
  "keyFindings": ["<finding 1>", "<finding 2>", ...],
  "recommendations": ["<recommendation 1>", "<recommendation 2>", ...]
}

Rules:
- Be factual and concise.
- Base findings only on the provided input; do not invent information.
- keyFindings and recommendations must each have 2–5 items.
- Respond with raw JSON only.`;

// ---------------------------------------------------------------------------
// Shared handler — called by both GET and POST
// ---------------------------------------------------------------------------

async function handleRequest(message: string): Promise<Response> {
  // 400 — no message provided
  if (!message.trim()) {
    return Response.json({ error: "A message is required." }, { status: 400 });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "AI assistant is not configured on this server." },
      { status: 503 },
    );
  }

  // Build the messages array for the chat completions endpoint
  const messages: OpenAIChatMessage[] = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: message.trim() },
  ];

  let rawText: string;

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // The Authorization header is assembled from the server-side env variable
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages,
        // Ask the model to emit JSON directly; paired with the system prompt
        // this reliably produces parseable output.
        response_format: { type: "json_object" },
        temperature: 0.3,
      }),
    });

    if (!res.ok) {
      const errBody = (await res.json().catch(() => ({}))) as OpenAIError;
      const detail = errBody?.error?.message ?? res.statusText;
      console.error("[api/ai] OpenAI error:", res.status, detail);
      return Response.json(
        { error: "OpenAI request failed. Please try again." },
        { status: 500 },
      );
    }

    const data = await res.json() as { choices: OpenAIChoice[] };
    rawText = data.choices?.[0]?.message?.content?.trim() ?? "";
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[api/ai] fetch error:", msg);
    return Response.json(
      { error: "Failed to reach the AI assistant. Please try again." },
      { status: 500 },
    );
  }

  // Parse and validate the JSON the model returned
  let parsed: AIResponse;
  try {
    parsed = JSON.parse(rawText) as AIResponse;
  } catch {
    console.error("[api/ai] JSON parse error. Raw text:", rawText);
    return Response.json(
      { error: "AI returned an unexpected response format." },
      { status: 500 },
    );
  }

  // Sanitise — ensure required fields are present with sensible defaults
  const validRiskLevels: AIResponse["riskLevel"][] = ["Low", "Medium", "High", "Critical"];
  if (!validRiskLevels.includes(parsed.riskLevel)) parsed.riskLevel = "Medium";
  if (typeof parsed.summary !== "string") parsed.summary = "";
  if (!Array.isArray(parsed.keyFindings)) parsed.keyFindings = [];
  if (!Array.isArray(parsed.recommendations)) parsed.recommendations = [];

  return Response.json(parsed);
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
