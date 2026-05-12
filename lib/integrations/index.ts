/**
 * Integration stubs — wire real HTTP clients inside `app/api/**` routes.
 *
 * Never import secret-bearing clients into Client Components. On Vercel, keep keys
 * as server-side environment variables (no `NEXT_PUBLIC_` prefix).
 */

export type IntegrationHealth = "mock" | "configured" | "error";

export async function mockMxToolboxLookup(_host: string): Promise<{ status: IntegrationHealth; note: string }> {
  return {
    status: "mock",
    note: "MXToolbox-style checks: add MXTOOLBOX_API_KEY on the server and call from a route handler.",
  };
}

export async function mockAbuseIpReputation(_ip: string): Promise<{ status: IntegrationHealth; note: string }> {
  return { status: "mock", note: "AbuseIPDB: use ABUSEIPDB_API_KEY in server routes only." };
}

export async function mockVirusTotalReport(_indicator: string): Promise<{ status: IntegrationHealth; note: string }> {
  return { status: "mock", note: "VirusTotal: use VIRUSTOTAL_API_KEY in server routes only." };
}
