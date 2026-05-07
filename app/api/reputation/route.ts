import type { NextRequest } from "next/server";

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

interface MxToolboxSPFResult {
  Name?: string;
  Info?: string;
  Result?: string;
}

interface MxToolboxSPFResponse {
  Failed?: MxToolboxSPFResult[];
  Passed?: MxToolboxSPFResult[];
  Information?: (MxToolboxSPFResult & { IsFailed?: boolean })[];
}

export interface ReputationLookupEntry {
  source: string;
  listed: boolean;
  detail: string;
}

export interface SPFEntry {
  name: string;
  result: string;
  info: string;
  passed: boolean;
}

export interface ReputationResult {
  target: string;
  healthScore: number;
  blacklist: {
    entries: ReputationLookupEntry[];
    failedCount: number;
    totalChecked: number;
    status: "safe" | "warning" | "risk" | "unknown";
  };
  spf: {
    entries: SPFEntry[];
    failedCount: number;
    totalChecked: number;
    status: "pass" | "fail" | "unknown";
  };
}

const MXTOOLBOX_TIMEOUT_MS = 15_000;
const MAX_RETRIES = 3;

async function fetchWithRetry(url: string, apiKey: string): Promise<Response> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await fetch(url, {
        headers: { Authorization: apiKey },
        signal: AbortSignal.timeout(MXTOOLBOX_TIMEOUT_MS),
        cache: "no-store",
      });
      if (res.ok) return res;
      lastError = new Error(`MxToolbox API returned ${res.status}`);
    } catch (err) {
      lastError = err;
      if (attempt < MAX_RETRIES) {
        await new Promise((r) => setTimeout(r, 500 * attempt));
      }
    }
  }
  throw lastError;
}

function computeHealthScore(
  blacklistFailed: number,
  blacklistTotal: number,
  spfFailed: number,
): number {
  if (blacklistTotal === 0) return 50;
  const blacklistScore = Math.max(0, 100 - blacklistFailed * 20);
  const spfScore = spfFailed > 0 ? Math.max(0, 100 - spfFailed * 15) : 100;
  return Math.round(blacklistScore * 0.7 + spfScore * 0.3);
}

export async function GET(request: NextRequest) {
  const target =
    request.nextUrl.searchParams.get("target") ??
    request.nextUrl.searchParams.get("domain") ??
    "";

  if (!target.trim()) {
    return Response.json(
      { error: "Missing required query parameter: provide target or domain." },
      { status: 400 },
    );
  }

  const normalised = target.trim().toLowerCase();
  const apiKey = process.env.MX_TOOLBOX_API_KEY;

  if (!apiKey) {
    const mock: ReputationResult = {
      target: normalised,
      healthScore: 85,
      blacklist: {
        entries: [
          { source: "Spamhaus ZEN", listed: false, detail: "Not listed" },
          { source: "SURBL", listed: false, detail: "Not listed" },
          { source: "Barracuda", listed: false, detail: "Not listed" },
          { source: "SpamCop", listed: false, detail: "Not listed" },
          { source: "UCEPROTECT", listed: false, detail: "Not listed" },
        ],
        failedCount: 0,
        totalChecked: 5,
        status: "safe",
      },
      spf: {
        entries: [
          { name: "SPF Record", result: "Pass", info: "Valid SPF record found", passed: true },
        ],
        failedCount: 0,
        totalChecked: 1,
        status: "pass",
      },
    };
    return Response.json({ data: mock, mock: true });
  }

  const [blacklistRes, spfRes] = await Promise.allSettled([
    fetchWithRetry(
      `https://api.mxtoolbox.com/api/v1/lookup/blacklist/${encodeURIComponent(normalised)}`,
      apiKey,
    ),
    fetchWithRetry(
      `https://api.mxtoolbox.com/api/v1/lookup/spf/${encodeURIComponent(normalised)}`,
      apiKey,
    ),
  ]);

  // --- Blacklist ---
  let blacklistEntries: ReputationLookupEntry[] = [];
  let blacklistFailed = 0;

  if (blacklistRes.status === "fulfilled") {
    const payload = (await blacklistRes.value.json()) as MxToolboxBlacklistResponse;

    const failedFromArray = (payload.Failed ?? []).map((e) => ({
      source: e.Name ?? "Unknown",
      detail: e.Info ?? "Listed",
    }));
    const failedFromInfo = (payload.Information ?? [])
      .filter((e) => e.IsFailed === true)
      .map((e) => ({
        source: e.Blacklist ?? e.Name ?? "Unknown",
        detail: e.Info ?? "Listed",
      }));

    const deduped = new Map<string, { source: string; detail: string }>();
    for (const e of [...failedFromArray, ...failedFromInfo]) {
      deduped.set(`${e.source}::${e.detail}`, e);
    }
    const failedList = [...deduped.values()];
    const passedList = (payload.Passed ?? []).map((e) => ({
      source: e.Name ?? "Unknown",
      detail: e.Info ?? "Not listed",
    }));

    blacklistFailed = failedList.length;
    blacklistEntries = [
      ...failedList.map((e) => ({ source: e.source, listed: true, detail: e.detail })),
      ...passedList.map((e) => ({ source: e.source, listed: false, detail: e.detail })),
    ];
  }

  const blacklistStatus: ReputationResult["blacklist"]["status"] =
    blacklistRes.status === "rejected"
      ? "unknown"
      : blacklistFailed >= 3
        ? "risk"
        : blacklistFailed >= 1
          ? "warning"
          : "safe";

  // --- SPF ---
  let spfEntries: SPFEntry[] = [];
  let spfFailed = 0;

  if (spfRes.status === "fulfilled") {
    const payload = (await spfRes.value.json()) as MxToolboxSPFResponse;

    const failedItems = (payload.Failed ?? []).map<SPFEntry>((e) => ({
      name: e.Name ?? "SPF Check",
      result: e.Result ?? "Fail",
      info: e.Info ?? "Failed",
      passed: false,
    }));
    const passedItems = (payload.Passed ?? []).map<SPFEntry>((e) => ({
      name: e.Name ?? "SPF Check",
      result: e.Result ?? "Pass",
      info: e.Info ?? "Passed",
      passed: true,
    }));

    spfFailed = failedItems.length;
    spfEntries = [...failedItems, ...passedItems];
  }

  const spfStatus: ReputationResult["spf"]["status"] =
    spfRes.status === "rejected" ? "unknown" : spfFailed > 0 ? "fail" : "pass";

  const healthScore = computeHealthScore(
    blacklistFailed,
    blacklistEntries.length,
    spfFailed,
  );

  const result: ReputationResult = {
    target: normalised,
    healthScore,
    blacklist: {
      entries: blacklistEntries,
      failedCount: blacklistFailed,
      totalChecked: blacklistEntries.length,
      status: blacklistStatus,
    },
    spf: {
      entries: spfEntries,
      failedCount: spfFailed,
      totalChecked: spfEntries.length,
      status: spfStatus,
    },
  };

  return Response.json({ data: result, mock: false });
}
