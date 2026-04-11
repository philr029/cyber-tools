/**
 * AI Report Generator — uses Gemini to produce a structured security report
 * from a user-provided scan context or raw findings.
 *
 * POST /api/tools/ai-report
 * Body: { context: string, title?: string }
 */

import type { NextRequest } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const REPORT_SYSTEM_INSTRUCTION = `You are a professional cybersecurity report writer for a SaaS platform called SecureScope.
Given raw scan data or a description of security findings, produce a concise, structured security report.

Format your response as valid JSON with this exact schema:
{
  "title": "string — short, descriptive report title",
  "executive_summary": "string — 2-3 sentence executive summary for non-technical stakeholders",
  "risk_level": "Low" | "Medium" | "High" | "Critical",
  "risk_score": number between 0 and 100,
  "findings": [
    {
      "id": "F1",
      "title": "string — finding title",
      "severity": "Info" | "Low" | "Medium" | "High" | "Critical",
      "description": "string — clear explanation of the finding",
      "impact": "string — potential business or security impact"
    }
  ],
  "recommendations": [
    {
      "priority": "Immediate" | "Short-term" | "Long-term",
      "action": "string — specific actionable recommendation"
    }
  ],
  "conclusion": "string — 1-2 sentence closing statement"
}

Rules:
- Be factual, concise, and professional.
- Base findings ONLY on the provided context. Do not invent information.
- If context is sparse, produce a general-purpose report with appropriate caveats.
- Respond with raw JSON only — no markdown fences, no preamble.`;

interface ReportFinding {
  id: string;
  title: string;
  severity: "Info" | "Low" | "Medium" | "High" | "Critical";
  description: string;
  impact: string;
}

interface ReportRecommendation {
  priority: "Immediate" | "Short-term" | "Long-term";
  action: string;
}

export interface AIReportResult {
  title: string;
  executive_summary: string;
  risk_level: "Low" | "Medium" | "High" | "Critical";
  risk_score: number;
  findings: ReportFinding[];
  recommendations: ReportRecommendation[];
  conclusion: string;
}

export async function POST(request: NextRequest) {
  if (!process.env.GEMINI_API_KEY) {
    return Response.json(
      { error: "AI Report Generator is not configured on this server. Please set GEMINI_API_KEY." },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const context = ((body as Record<string, unknown>).context ?? "").toString().trim();
  const title = ((body as Record<string, unknown>).title ?? "").toString().trim();

  if (!context) {
    return Response.json({ error: "Scan context or findings are required to generate a report." }, { status: 400 });
  }

  if (context.length > 8000) {
    return Response.json({ error: "Context is too long (max 8000 characters)." }, { status: 400 });
  }

  const prompt = title
    ? `Generate a security report titled "${title}" based on the following scan data:\n\n${context}`
    : `Generate a security report based on the following scan data or findings:\n\n${context}`;

  try {
    const client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = client.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: REPORT_SYSTEM_INSTRUCTION,
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    // Parse the JSON response
    let report: AIReportResult;
    try {
      report = JSON.parse(text) as AIReportResult;
    } catch {
      // Fallback: try to extract JSON from the text
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return Response.json({ error: "AI returned an unexpected response format. Please try again." }, { status: 502 });
      }
      report = JSON.parse(jsonMatch[0]) as AIReportResult;
    }

    // Validate and sanitise the required fields
    const validRiskLevels = ["Low", "Medium", "High", "Critical"] as const;
    if (!validRiskLevels.includes(report.risk_level as (typeof validRiskLevels)[number])) {
      report.risk_level = "Medium";
    }
    report.risk_score = Math.min(100, Math.max(0, Number(report.risk_score) || 0));
    if (!Array.isArray(report.findings)) report.findings = [];
    if (!Array.isArray(report.recommendations)) report.recommendations = [];

    return Response.json({ data: report });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[api/tools/ai-report] Gemini error:", message);
    return Response.json(
      { error: "Failed to generate report. Please try again." },
      { status: 502 },
    );
  }
}
