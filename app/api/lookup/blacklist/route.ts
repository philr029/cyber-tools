import type { NextRequest } from "next/server";
import { validateIPOrDomain } from "@/lib/validators";
import { MOCK_RESULTS } from "@/lib/mockData";

interface MxToolboxResult {
  Name?: string;
  Info?: string;
}

interface MxToolboxInformationResult {
  Name?: string;
  Blacklist?: string;
  Info?: string;
  IsFailed?: boolean;
}

interface MxToolboxBlacklistResponse {
  Failed?: MxToolboxResult[];
  Passed?: MxToolboxResult[];
  Information?: MxToolboxInformationResult[];
}

const MXTOOLBOX_TIMEOUT_MS = 10_000;
const BLACKLIST_WARNING_THRESHOLD = 1;
const BLACKLIST_RISK_THRESHOLD = 3;

export async function GET(request: NextRequest) {
  const target =
    request.nextUrl.searchParams.get("target") ??
    request.nextUrl.searchParams.get("domain") ??
    request.nextUrl.searchParams.get("ip") ??
    "";

  if (!target.trim()) {
    return Response.json({ error: "Missing required query parameter: provide target, domain, or ip." }, { status: 400 });
  }

  const validation = validateIPOrDomain(target);
  if (!validation.ok) {
    return Response.json({ error: validation.message }, { status: 400 });
  }

  const normalised = target.trim().toLowerCase();
  const apiKey = process.env.MX_TOOLBOX_API_KEY;

  if (!apiKey) {
    const mockResult = MOCK_RESULTS[normalised];
    const data = mockResult?.blacklist ?? {
      target: normalised,
      entries: [
        { source: "Spamhaus ZEN", listed: false, detail: "Not listed" },
        { source: "SURBL", listed: false, detail: "Not listed" },
        { source: "Barracuda", listed: false, detail: "Not listed" },
        { source: "SpamCop", listed: false, detail: "Not listed" },
        { source: "UCEPROTECT", listed: false, detail: "Not listed" },
      ],
      listedCount: 0,
      totalChecked: 5,
      status: "unknown" as const,
      failedBlacklists: [] as Array<{ source: string; detail: string }>,
      failedCount: 0,
    };

    return Response.json({ data, mock: true });
  }

  try {
    const mxResponse = await fetch(
      `https://api.mxtoolbox.com/api/v1/lookup/blacklist/${encodeURIComponent(normalised)}`,
      {
        headers: { Authorization: apiKey },
        signal: AbortSignal.timeout(MXTOOLBOX_TIMEOUT_MS),
        cache: "no-store",
      },
    );

    if (!mxResponse.ok) {
      return Response.json(
        { error: `MxToolbox API request failed (${mxResponse.status}).` },
        { status: 502 },
      );
    }

    const payload = (await mxResponse.json()) as MxToolboxBlacklistResponse;
    const failedFromFailedArray = (payload.Failed ?? []).map((entry) => ({
      source: entry.Name ?? "Unknown blacklist",
      detail: entry.Info ?? "Listed",
    }));

    const failedFromInformation = (payload.Information ?? [])
      .filter((entry) => entry.IsFailed === true)
      .map((entry) => ({
        source: entry.Blacklist ?? entry.Name ?? "Unknown blacklist",
        detail: entry.Info ?? "Listed",
      }));

    const failedBlacklists =
      failedFromFailedArray.length > 0 ? failedFromFailedArray : failedFromInformation;

    const passedEntries = (payload.Passed ?? []).map((entry) => ({
      source: entry.Name ?? "Unknown blacklist",
      listed: false,
      detail: entry.Info ?? "Not listed",
    }));

    const failedEntries = failedBlacklists.map((entry) => ({
      source: entry.source,
      listed: true,
      detail: entry.detail,
    }));

    const entries = [...failedEntries, ...passedEntries];

    const listedCount = failedEntries.length;
    const totalChecked = entries.length;
    const status =
      listedCount >= BLACKLIST_RISK_THRESHOLD
        ? "risk"
        : listedCount >= BLACKLIST_WARNING_THRESHOLD
          ? "warning"
          : "safe";

    return Response.json({
      data: {
        target: normalised,
        entries,
        listedCount,
        totalChecked,
        status,
        failedBlacklists,
        failedCount: failedBlacklists.length,
      },
      mock: false,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message.toLowerCase() : "";
    if (message.includes("timeout") || message.includes("abort")) {
      return Response.json({ error: "MxToolbox request timed out. Please try again." }, { status: 504 });
    }

    return Response.json({ error: "Failed to fetch blacklist status from MxToolbox." }, { status: 502 });
  }
}
