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
import { publicErrorMessage } from "@/lib/security/safe-error";

const GEMINI_MODEL = "gemini-2.5-flash";
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

/** Maximum user message length accepted by this route */
const MAX_MESSAGE_LENGTH = 4000;

const isDev = process.env.NODE_ENV === "development";

export async function POST(request: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: isDev ? "Missing GEMINI_API_KEY" : "Service unavailable." },
      { status: 503 },
    );
  }

  let body: ChatRequest;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const userMessage = (body.message ?? "").trim();

  if (!userMessage) {
    return Response.json({ error: "Missing message" }, { status: 400 });
  }

  if (userMessage.length > MAX_MESSAGE_LENGTH) {
    return Response.json(
      { error: "Message exceeds the maximum allowed length." },
      { status: 400 },
    );
  }

  if (isDev) {
    console.log("[api/chat] message length:", userMessage.length, "history:", (body.history ?? []).length);
  }

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
    const geminiRes = await fetch(GEMINI_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-goog-api-key": apiKey,
      },
      body: JSON.stringify({ contents }),
    });

    const data: unknown = await geminiRes.json();

    if (!geminiRes.ok) {
      const errObj = data as { error?: { message?: string } };
      const details = errObj?.error?.message ?? geminiRes.statusText;
      if (isDev) {
        console.error("[api/chat] Gemini HTTP error:", geminiRes.status, details);
      }
      return Response.json(
        {
          error: publicErrorMessage(new Error(String(details)), "The assistant is temporarily unavailable."),
          ...(isDev ? { details: String(details) } : {}),
        },
        { status: 502 },
      );
    }

    const parsed = data as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };
    const reply: string | undefined = parsed?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!reply) {
      if (isDev) {
        console.error("[api/chat] Gemini returned no text.");
      }
      return Response.json(
        { error: "The assistant is temporarily unavailable." },
        { status: 502 },
      );
    }

    if (isDev) {
      console.log("[api/chat] reply length:", reply.length);
    }
    return Response.json({ reply });
  } catch (err) {
    if (isDev) {
      console.error("[api/chat] Server error:", err);
    }
    return Response.json(
      { error: publicErrorMessage(err, "The assistant is temporarily unavailable.") },
      { status: 502 },
    );
  }
}
