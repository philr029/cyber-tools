/** Append UTM query params to a website URL. Adds https:// when missing. */
export function buildUtmUrl(
  websiteUrl: string,
  params: {
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    utm_term?: string;
    utm_content?: string;
  },
): { ok: true; url: string } | { ok: false; error: string } {
  const raw = websiteUrl.trim();
  if (!raw) return { ok: false, error: "Enter a website URL." };

  let normalized = raw;
  if (!/^https?:\/\//i.test(normalized)) {
    normalized = `https://${normalized}`;
  }

  let parsed: URL;
  try {
    parsed = new URL(normalized);
  } catch {
    return { ok: false, error: "That URL does not look valid." };
  }

  const entries: [string, string][] = [];
  if (params.utm_source?.trim()) entries.push(["utm_source", params.utm_source.trim()]);
  if (params.utm_medium?.trim()) entries.push(["utm_medium", params.utm_medium.trim()]);
  if (params.utm_campaign?.trim()) entries.push(["utm_campaign", params.utm_campaign.trim()]);
  if (params.utm_term?.trim()) entries.push(["utm_term", params.utm_term.trim()]);
  if (params.utm_content?.trim()) entries.push(["utm_content", params.utm_content.trim()]);

  if (entries.length === 0) {
    return { ok: false, error: "Add at least one UTM parameter (for example source or campaign)." };
  }

  for (const [k, v] of entries) {
    parsed.searchParams.set(k, v);
  }

  return { ok: true, url: parsed.toString() };
}
