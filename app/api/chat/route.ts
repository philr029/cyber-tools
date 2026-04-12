/**
 * POST /api/chat
 * Secure backend route for AI assistant replies via Gemini 2.5 Flash.
 *
 * Uses direct REST fetch so the model name, endpoint, and auth header are
 * fully explicit and easy to change without touching the SDK layer.
 *
 * Future extension points:
 * - Add tool/function calling by inspecting intent before sending to Gemini
 * - Route to HetrixTools / AbuseIPDB / VirusTotal / URLScan based on detected entities
 * - Add per-user rate limiting via edge middleware or an upstash adapter
 */
import type { NextRequest } from "next/server";
import type { ChatRequest } from "@/types/chat";

const GEMINI_MODEL = "gemini-2.5-flash";
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

/** Maximum user message length accepted by this route */
const MAX_MESSAGE_LENGTH = 4000;

export async function POST(request: NextRequest) {
  console.log("Chat route hit");

  const apiKey = process.env.GEMINI_API_KEY;
  console.log("API key exists:", !!apiKey);

  if (!apiKey) {
    return Response.json({ error: "Missing GEMINI_API_KEY" }, { status: 503 });
  }

  let body: ChatRequest;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const userMessage = (body.message ?? "").trim();
  console.log("Message received:", userMessage.substring(0, 100));

  if (!userMessage) {
    return Response.json({ error: "Missing message" }, { status: 400 });
  }

  if (userMessage.length > MAX_MESSAGE_LENGTH) {
    return Response.json(
      { error: "Message exceeds the maximum allowed length." },
      { status: 400 }
    );
  }

  // Build conversation turns from history, then append the new user message
  type GeminiPart = { text: string };
  type GeminiTurn = { role: "user" | "model"; parts: GeminiPart[] };

  const contents: GeminiTurn[] = [
    ...(body.history ?? []).map((msg) => ({
      role: (msg.role === "user" ? "user" : "model") as "user" | "model",
      parts: [{ text: msg.content }],
    })),
    { role: "user", parts: [{ text: userMessage }] },
  ];

  try {
    console.log(
      "[api/chat] Calling Gemini — model:", GEMINI_MODEL,
      "| message length:", userMessage.length,
      "| history turns:", (body.history ?? []).length,
    );

    const geminiRes = await fetch(GEMINI_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-goog-api-key": apiKey,
      },
      body: JSON.stringify({ contents }),
    });

    const data = await geminiRes.json();
    console.log("Gemini raw response:", JSON.stringify(data).substring(0, 500));

    if (!geminiRes.ok) {
      const details = data?.error?.message ?? geminiRes.statusText;
      console.error("[api/chat] Gemini HTTP error:", geminiRes.status, details);
      return Response.json({ error: "Gemini failed", details }, { status: 502 });
    }

    const reply: string | undefined =
      data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!reply) {
      console.error("[api/chat] Gemini returned no text. Full response:", JSON.stringify(data));
      return Response.json(
        { error: "Gemini failed", details: "Empty response from model." },
        { status: 502 },
      );
    }

    console.log("[api/chat] Reply generated — length:", reply.length);
    return Response.json({ reply });
  } catch (err) {
    const details = err instanceof Error ? err.message : String(err);
    console.error("[api/chat] Server error:", details, err);
    return Response.json({ error: "Gemini failed", details }, { status: 502 });
  }
}
