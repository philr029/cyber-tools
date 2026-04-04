/**
 * Gemini client helper.
 * Env: GEMINI_API_KEY
 *
 * Extend this file to add tool/function calling, per-topic routing,
 * or threat-intelligence integrations in future iterations.
 */
import { GoogleGenerativeAI } from "@google/generative-ai";

const SYSTEM_INSTRUCTION = `You are a cyber tools assistant for a public website called SecureScope.
You help users with cyber security, IP and domain checks, Microsoft 365 admin topics, DNS, SSL certificates, blacklist lookups, and general troubleshooting.
Be clear, practical, and concise. Avoid jargon where possible and explain things in plain English.
Do not claim to have performed live checks unless a connected tool actually provided the data.
If the user asks about an IP, domain, or admin issue, explain what it could mean, what to check next, and any sensible precautions.
If you are unsure about something, say so clearly rather than guessing.
Keep responses focused and actionable. Use short paragraphs or bullet points where it aids readability.`;

function getClient(): GoogleGenerativeAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not set.");
  }
  return new GoogleGenerativeAI(apiKey);
}

export interface GeminiMessage {
  role: "user" | "model";
  parts: Array<{ text: string }>;
}

export async function generateChatReply(
  userMessage: string,
  history: GeminiMessage[] = []
): Promise<string> {
  const client = getClient();

  const model = client.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction: SYSTEM_INSTRUCTION,
  });

  const chat = model.startChat({ history });

  const result = await chat.sendMessage(userMessage);
  const response = result.response;
  return response.text();
}
