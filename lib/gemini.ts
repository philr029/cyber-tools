/**
 * Gemini client helper.
 * Env: GEMINI_API_KEY
 *
 * Extend this file to add tool/function calling, per-topic routing,
 * or threat-intelligence integrations in future iterations.
 */
import { GoogleGenerativeAI } from "@google/generative-ai";

// ---------------------------------------------------------------------------
// Shared system instructions
// ---------------------------------------------------------------------------

const CHAT_SYSTEM_INSTRUCTION = `You are a cyber tools assistant for a public website called SecureScope.
You help users with cyber security, IP and domain checks, Microsoft 365 admin topics, DNS, SSL certificates, blacklist lookups, and general troubleshooting.
Be clear, practical, and concise. Avoid jargon where possible and explain things in plain English.
Do not claim to have performed live checks unless a connected tool actually provided the data.
If the user asks about an IP, domain, or admin issue, explain what it could mean, what to check next, and any sensible precautions.
If you are unsure about something, say so clearly rather than guessing.
Keep responses focused and actionable. Use short paragraphs or bullet points where it aids readability.`;

const REPORT_SYSTEM_INSTRUCTION = `You are a concise cybersecurity analyst.
When given a question or target (IP, domain, URL, description), respond with a JSON object that matches this schema exactly — no markdown, no extra keys:

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
- Respond with raw JSON only — no markdown fences, no extra commentary.`;

// ---------------------------------------------------------------------------
// Model names — change here to update everywhere
// ---------------------------------------------------------------------------

const CHAT_MODEL = "gemini-2.5-flash";
const REPORT_MODEL = "gemini-2.5-flash";

/** Milliseconds before a Gemini request is considered timed out */
const REQUEST_TIMEOUT_MS = 25_000;

// ---------------------------------------------------------------------------
// Internal helper — returns a configured Gemini client
// ---------------------------------------------------------------------------

function getClient(): GoogleGenerativeAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not set.");
  }
  return new GoogleGenerativeAI(apiKey);
}

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export interface GeminiMessage {
  role: "user" | "model";
  parts: Array<{ text: string }>;
}

export interface AIReport {
  summary: string;
  riskLevel: "Low" | "Medium" | "High" | "Critical";
  keyFindings: string[];
  recommendations: string[];
}

// ---------------------------------------------------------------------------
// Chat reply — used by the floating ChatWidget via /api/chat
// ---------------------------------------------------------------------------

export async function generateChatReply(
  userMessage: string,
  history: GeminiMessage[] = []
): Promise<string> {
  const client = getClient();

  console.log("[gemini] generateChatReply — model:", CHAT_MODEL, "| history length:", history.length);

  const model = client.getGenerativeModel({
    model: CHAT_MODEL,
    systemInstruction: CHAT_SYSTEM_INSTRUCTION,
  });

  const chat = model.startChat({ history });

  // Race the Gemini call against a timeout. The SDK does not expose an
  // AbortSignal parameter, so we reject early and let the serverless runtime
  // clean up. This prevents the function from hanging indefinitely.
  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(
      () => reject(new Error(`Gemini request timed out after ${REQUEST_TIMEOUT_MS}ms`)),
      REQUEST_TIMEOUT_MS
    )
  );

  const result = await Promise.race([chat.sendMessage(userMessage), timeoutPromise]);

  const text = result.response.text();
  if (!text) {
    throw new Error("Gemini returned an empty response.");
  }

  console.log("[gemini] generateChatReply — response length:", text.length);
  return text;
}

// ---------------------------------------------------------------------------
// Structured report — used by the AI Assistant tool page via /api/ai
// ---------------------------------------------------------------------------

export async function generateStructuredReport(userMessage: string): Promise<AIReport> {
  const client = getClient();

  // Ask Gemini to respond with JSON directly
  const model = client.getGenerativeModel({
    model: REPORT_MODEL,
    systemInstruction: REPORT_SYSTEM_INSTRUCTION,
    generationConfig: { responseMimeType: "application/json" },
  });

  const result = await model.generateContent(userMessage);
  const rawText = result.response.text().trim();

  const parsed = JSON.parse(rawText) as AIReport;

  // Sanitize — ensure required fields have sensible types/values
  const validRiskLevels: AIReport["riskLevel"][] = ["Low", "Medium", "High", "Critical"];
  if (!validRiskLevels.includes(parsed.riskLevel)) parsed.riskLevel = "Medium";
  if (typeof parsed.summary !== "string") parsed.summary = "";
  if (!Array.isArray(parsed.keyFindings)) parsed.keyFindings = [];
  if (!Array.isArray(parsed.recommendations)) parsed.recommendations = [];

  return parsed;
}
