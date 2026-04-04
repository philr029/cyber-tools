/**
 * POST /api/chat
 * Secure backend route for AI assistant replies via Gemini.
 *
 * Future extension points:
 * - Add tool/function calling by inspecting intent before sending to Gemini
 * - Route to HetrixTools / AbuseIPDB / VirusTotal / URLScan based on detected entities
 * - Add per-user rate limiting via edge middleware or an upstash adapter
 */
import type { NextRequest } from "next/server";
import { generateChatReply, type GeminiMessage } from "@/lib/gemini";
import type { ChatRequest } from "@/types/chat";

export async function POST(request: NextRequest) {
  if (!process.env.GEMINI_API_KEY) {
    return Response.json(
      { error: "AI assistant is not configured on this server." },
      { status: 503 }
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
    return Response.json({ error: "Message must not be empty." }, { status: 400 });
  }

  if (userMessage.length > 4000) {
    return Response.json(
      { error: "Message exceeds the maximum allowed length." },
      { status: 400 }
    );
  }

  // Convert client history format to Gemini SDK format
  const history: GeminiMessage[] = (body.history ?? []).map((msg) => ({
    role: msg.role === "user" ? "user" : "model",
    parts: [{ text: msg.content }],
  }));

  try {
    const reply = await generateChatReply(userMessage, history);
    return Response.json({ reply });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[api/chat] Gemini error:", message);
    return Response.json(
      { error: "Failed to get a response from the AI assistant." },
      { status: 502 }
    );
  }
}
