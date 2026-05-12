/**
 * Playwright / CI worker contract for form smoke tests.
 *
 * Copy the payload below into a GitHub Actions job, Vercel Cron worker, or
 * Playwright `request.post` — keep dummy data and point `url` at a dedicated
 * staging endpoint to avoid spamming production lead forms.
 */

export const MONITORING_FORM_DUMMY_FIELDS = [
  { key: "name", value: "Automated Test" },
  { key: "email", value: "test@example.com" },
  { key: "phone", value: "01234567890" },
  { key: "message", value: "This is an automated test submission." },
] as const;

export function buildPlaywrightMonitoringSnippet(endpointUrl: string): string {
  return `
// Example: Playwright APIRequestContext (run in CI, not in the browser bundle)
await request.post(${JSON.stringify(endpointUrl)}, {
  data: {
    url: process.env.FORM_TEST_URL,
    method: "POST",
    contentType: "application/x-www-form-urlencoded",
    fields: ${JSON.stringify(MONITORING_FORM_DUMMY_FIELDS)},
    timeoutMs: 20000,
  },
});
`.trim();
}
