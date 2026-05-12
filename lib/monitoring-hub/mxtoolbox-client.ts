/**
 * MXToolbox Lookup API (server-side only).
 *
 * Configure `MXTOOLBOX_API_KEY` in Vercel / local `.env` — never expose this
 * key to the browser. Authorization header is the raw UUID per MXToolbox docs.
 *
 * @see https://mxtoolbox.com/api/api-reference
 */

export type MxToolboxClientErrorCode =
  | "MISSING_API_KEY"
  | "INVALID_API_KEY"
  | "RATE_LIMIT"
  | "UNAVAILABLE"
  | "INVALID_RESPONSE";

const MX_LOOKUP_BASE = "https://mxtoolbox.com/api/v1/lookup";

export interface MxToolboxSuccess {
  ok: true;
  data: unknown;
  /** Milliseconds reported by MXToolbox when present */
  remoteDurationMs: number | null;
}

export interface MxToolboxFailure {
  ok: false;
  httpStatus: number;
  code: MxToolboxClientErrorCode;
  message: string;
}

export async function mxtoolboxLookup(command: string, argument: string): Promise<MxToolboxSuccess | MxToolboxFailure> {
  const apiKey = process.env.MXTOOLBOX_API_KEY?.trim();
  if (!apiKey) {
    return {
      ok: false,
      httpStatus: 503,
      code: "MISSING_API_KEY",
      message:
        "MXToolbox API key is not configured. Add MXTOOLBOX_API_KEY to your server environment (for example Vercel → Settings → Environment Variables).",
    };
  }

  const pathUrl = `${MX_LOOKUP_BASE}/${encodeURIComponent(command)}/${encodeURIComponent(argument)}`;

  let res: Response;
  try {
    res = await fetch(pathUrl, {
      method: "GET",
      headers: {
        Authorization: apiKey,
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(30_000),
    });
  } catch {
    return {
      ok: false,
      httpStatus: 503,
      code: "UNAVAILABLE",
      message: "Could not reach MXToolbox. The service may be temporarily unavailable.",
    };
  }

  if (res.status === 401) {
    return {
      ok: false,
      httpStatus: 401,
      code: "INVALID_API_KEY",
      message: "MXToolbox rejected the API key. Verify MXTOOLBOX_API_KEY in your environment.",
    };
  }

  if (res.status === 429) {
    return {
      ok: false,
      httpStatus: 429,
      code: "RATE_LIMIT",
      message: "MXToolbox rate limit or daily quota exceeded. Try again later or check your plan usage.",
    };
  }

  if (!res.ok) {
    return {
      ok: false,
      httpStatus: res.status >= 400 && res.status < 600 ? res.status : 503,
      code: "UNAVAILABLE",
      message: `MXToolbox returned HTTP ${res.status}.`,
    };
  }

  let data: unknown;
  try {
    data = await res.json();
  } catch {
    return {
      ok: false,
      httpStatus: 502,
      code: "INVALID_RESPONSE",
      message: "MXToolbox returned a non-JSON response.",
    };
  }

  let remoteDurationMs: number | null = null;
  if (data && typeof data === "object" && "TimeToComplete" in data) {
    const t = (data as { TimeToComplete?: string }).TimeToComplete;
    const n = t !== undefined ? Number(t) : NaN;
    if (!Number.isNaN(n)) remoteDurationMs = n;
  }

  return { ok: true, data, remoteDurationMs };
}
