/**
 * Cookiebot CMP — Domain Group ID (public, not a secret).
 *
 * Set in `.env.local` / Vercel:
 *   NEXT_PUBLIC_COOKIEBOT_DOMAIN_GROUP_ID=<your-id-from-cookiebot-dashboard>
 *
 * Until set, the placeholder below is used so the site still builds; replace it
 * for a working banner and declaration embed.
 */
export const COOKIEBOT_DOMAIN_GROUP_ID =
  process.env.NEXT_PUBLIC_COOKIEBOT_DOMAIN_GROUP_ID?.trim() || "YOUR_COOKIEBOT_DOMAIN_GROUP_ID";

export function isCookiebotConfigured(): boolean {
  const raw = process.env.NEXT_PUBLIC_COOKIEBOT_DOMAIN_GROUP_ID?.trim();
  return Boolean(raw && raw !== "YOUR_COOKIEBOT_DOMAIN_GROUP_ID");
}
