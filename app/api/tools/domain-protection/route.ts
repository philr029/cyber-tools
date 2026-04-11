/**
 * Domain Protection Tool — detects typosquat and lookalike domains for a given base domain.
 *
 * POST /api/tools/domain-protection
 * Body: { domain: string }
 *
 * Returns a list of candidate domain variants, marking those that resolve in DNS.
 */

import type { NextRequest } from "next/server";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface DomainVariant {
  variant: string;
  technique: string;
  registered: boolean;
  resolvesTo: string | null;
}

export interface DomainProtectionResult {
  baseDomain: string;
  baseName: string;
  baseTLD: string;
  registeredVariants: DomainVariant[];
  unregisteredVariants: DomainVariant[];
  totalChecked: number;
  threatCount: number;
  riskLabel: "Low" | "Medium" | "High" | "Critical";
  summary: string;
}

// ---------------------------------------------------------------------------
// Typosquatting variant generators
// ---------------------------------------------------------------------------

function splitDomain(domain: string): { name: string; tld: string } {
  const parts = domain.split(".");
  // Handle multi-part TLDs like co.uk
  const tld = parts.length > 2 ? parts.slice(-2).join(".") : parts[parts.length - 1];
  const name = parts.length > 2 ? parts.slice(0, -2).join(".") : parts.slice(0, -1).join(".");
  return { name, tld };
}

// Common keyboard adjacency map for character substitution
const KEYBOARD_ADJACENT: Record<string, string[]> = {
  a: ["q", "w", "s", "z"],
  b: ["v", "g", "h", "n"],
  c: ["x", "d", "f", "v"],
  d: ["s", "e", "r", "f", "c", "x"],
  e: ["w", "r", "d", "s"],
  f: ["d", "r", "t", "g", "v", "c"],
  g: ["f", "t", "y", "h", "b", "v"],
  h: ["g", "y", "u", "j", "n", "b"],
  i: ["u", "o", "k", "j"],
  j: ["h", "u", "i", "k", "n", "m"],
  k: ["j", "i", "o", "l", "m"],
  l: ["k", "o", "p"],
  m: ["n", "j", "k"],
  n: ["b", "h", "j", "m"],
  o: ["i", "p", "l", "k"],
  p: ["o", "l"],
  q: ["w", "a"],
  r: ["e", "t", "f", "d"],
  s: ["a", "w", "e", "d", "z", "x"],
  t: ["r", "y", "g", "f"],
  u: ["y", "i", "j", "h"],
  v: ["c", "f", "g", "b"],
  w: ["q", "e", "s", "a"],
  x: ["z", "s", "d", "c"],
  y: ["t", "u", "h", "g"],
  z: ["a", "s", "x"],
};

// Common homoglyph substitutions (visually similar characters)
const HOMOGLYPHS: Record<string, string[]> = {
  a: ["@", "4"],
  e: ["3"],
  i: ["1", "l"],
  l: ["1", "i"],
  o: ["0"],
  s: ["5", "$"],
  t: ["7"],
  g: ["9"],
  b: ["6"],
};

// Popular alternative TLDs for permutation
const ALT_TLDS = ["com", "net", "org", "io", "co", "app", "dev", "info", "biz", "online", "site", "store"];

function generateVariants(name: string, tld: string, baseDomain: string): { variant: string; technique: string }[] {
  const variants: Map<string, string> = new Map();

  const addVariant = (variant: string, technique: string) => {
    if (variant !== baseDomain && variant.length >= 3) {
      variants.set(variant, technique);
    }
  };

  // 1. Character omission (drop each character)
  for (let i = 0; i < name.length; i++) {
    const v = name.slice(0, i) + name.slice(i + 1);
    if (v.length >= 2) addVariant(`${v}.${tld}`, "Character omission");
  }

  // 2. Character substitution (adjacent keys)
  for (let i = 0; i < name.length; i++) {
    const ch = name[i].toLowerCase();
    const adjacent = KEYBOARD_ADJACENT[ch] ?? [];
    for (const sub of adjacent) {
      const v = name.slice(0, i) + sub + name.slice(i + 1);
      addVariant(`${v}.${tld}`, "Keyboard substitution");
    }
  }

  // 3. Character repetition (double each char)
  for (let i = 0; i < name.length; i++) {
    const v = name.slice(0, i) + name[i] + name[i] + name.slice(i + 1);
    addVariant(`${v}.${tld}`, "Character repetition");
  }

  // 4. Character transposition (swap adjacent chars)
  for (let i = 0; i < name.length - 1; i++) {
    const v = name.slice(0, i) + name[i + 1] + name[i] + name.slice(i + 2);
    addVariant(`${v}.${tld}`, "Character transposition");
  }

  // 5. Homoglyph substitution
  for (let i = 0; i < name.length; i++) {
    const ch = name[i].toLowerCase();
    const glyphs = HOMOGLYPHS[ch] ?? [];
    for (const sub of glyphs) {
      const v = name.slice(0, i) + sub + name.slice(i + 1);
      addVariant(`${v}.${tld}`, "Homoglyph substitution");
    }
  }

  // 6. Common prefix/suffix additions (phishing patterns)
  const affixes = ["my", "get", "the", "secure", "official", "login", "verify", "account", "support", "help", "portal", "online", "service"];
  for (const affix of affixes) {
    addVariant(`${affix}-${name}.${tld}`, "Prefix addition");
    addVariant(`${name}-${affix}.${tld}`, "Suffix addition");
    addVariant(`${affix}${name}.${tld}`, "Prefix concat");
    addVariant(`${name}${affix}.${tld}`, "Suffix concat");
  }

  // 7. TLD permutation (same name, different TLD)
  for (const altTld of ALT_TLDS) {
    if (altTld !== tld) {
      addVariant(`${name}.${altTld}`, "TLD permutation");
    }
  }

  // 8. Hyphen insertion / removal
  if (name.includes("-")) {
    addVariant(`${name.replace(/-/g, "")}.${tld}`, "Hyphen removal");
  } else {
    for (let i = 1; i < name.length; i++) {
      addVariant(`${name.slice(0, i)}-${name.slice(i)}.${tld}`, "Hyphen insertion");
    }
  }

  // 9. Missing dot (subdomain squatting)
  addVariant(`www${name}.${tld}`, "Missing dot (subdomain squatting)");

  return Array.from(variants.entries()).map(([variant, technique]) => ({ variant, technique }));
}

// ---------------------------------------------------------------------------
// DNS resolution check via Google DNS-over-HTTPS
// ---------------------------------------------------------------------------

async function checkDNS(domain: string): Promise<string | null> {
  try {
    const res = await fetch(`https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=A`, {
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return null;
    const data = await res.json() as { Status: number; Answer?: { data: string }[] };
    if (data.Status !== 0 || !Array.isArray(data.Answer) || data.Answer.length === 0) return null;
    return data.Answer[0].data ?? null;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const rawDomain = ((body as Record<string, unknown>).domain ?? "").toString().trim().toLowerCase();
  if (!rawDomain) {
    return Response.json({ error: "A domain is required." }, { status: 400 });
  }

  // Strip leading protocol / www
  const domain = rawDomain.replace(/^https?:\/\//i, "").replace(/^www\./i, "").split("/")[0];

  if (!/^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/.test(domain) || domain.length > 253) {
    return Response.json({ error: "Invalid domain name." }, { status: 400 });
  }

  const { name, tld } = splitDomain(domain);
  const allVariants = generateVariants(name, tld, domain);

  // Deduplicate and cap at 60 variants to stay within reasonable latency
  const unique = Array.from(new Map(allVariants.map((v) => [v.variant, v.technique])).entries())
    .map(([variant, technique]) => ({ variant, technique }))
    .slice(0, 60);

  // Check DNS for each variant in parallel (with a concurrency limit)
  const BATCH_SIZE = 10;
  const results: DomainVariant[] = [];

  for (let i = 0; i < unique.length; i += BATCH_SIZE) {
    const batch = unique.slice(i, i + BATCH_SIZE);
    const resolved = await Promise.all(
      batch.map(async ({ variant, technique }) => {
        const ip = await checkDNS(variant);
        return { variant, technique, registered: ip !== null, resolvesTo: ip };
      }),
    );
    results.push(...resolved);
  }

  const registered = results.filter((r) => r.registered);
  const unregistered = results.filter((r) => !r.registered);

  const threatCount = registered.length;
  const riskLabel: DomainProtectionResult["riskLabel"] =
    threatCount >= 10 ? "Critical" : threatCount >= 5 ? "High" : threatCount >= 2 ? "Medium" : "Low";

  const summary =
    threatCount === 0
      ? `No registered lookalike domains were found for ${domain}. Your domain appears well-protected.`
      : `Found ${threatCount} registered lookalike domain${threatCount !== 1 ? "s" : ""} out of ${unique.length} checked. ${riskLabel} risk of brand impersonation or phishing.`;

  const result: DomainProtectionResult = {
    baseDomain: domain,
    baseName: name,
    baseTLD: tld,
    registeredVariants: registered,
    unregisteredVariants: unregistered,
    totalChecked: unique.length,
    threatCount,
    riskLabel,
    summary,
  };

  return Response.json({ data: result });
}
