import dns from "node:dns/promises";

export interface DomainDnsBundle {
  domain: string;
  a: string[];
  aaaa: string[];
  mx: { exchange: string; priority: number }[];
  txt: string[];
  ns: string[];
  spfRecords: string[];
  dmarcTxt: string[];
  dkimPlaceholder: { note: string };
  errors: string[];
}

export async function collectDomainDns(domain: string): Promise<DomainDnsBundle> {
  const d = domain.trim().toLowerCase();
  const errors: string[] = [];
  const empty = (): DomainDnsBundle => ({
    domain: d,
    a: [],
    aaaa: [],
    mx: [],
    txt: [],
    ns: [],
    spfRecords: [],
    dmarcTxt: [],
    dkimPlaceholder: {
      note:
        "DKIM requires a selector. Configure a selector in MXToolbox or your DNS UI (e.g. default._domainkey). Live DKIM lookup: MXToolbox `dkim` command with argument `domain:selector`.",
    },
    errors,
  });

  const bundle = empty();

  const safeResolve = async <T>(label: string, fn: () => Promise<T>): Promise<T | undefined> => {
    try {
      return await fn();
    } catch (e) {
      errors.push(`${label}: ${e instanceof Error ? e.message : "lookup failed"}`);
      return undefined;
    }
  };

  const a = await safeResolve("A", () => dns.resolve4(d));
  if (a) bundle.a = a;

  const aaaa = await safeResolve("AAAA", () => dns.resolve6(d));
  if (aaaa) bundle.aaaa = aaaa;

  const mx = await safeResolve("MX", () => dns.resolveMx(d));
  if (mx) bundle.mx = mx.map((m) => ({ exchange: m.exchange, priority: m.priority }));

  const txt = await safeResolve("TXT", () => dns.resolveTxt(d));
  if (txt) {
    bundle.txt = txt.map((chunks) => chunks.join(""));
    bundle.spfRecords = bundle.txt.filter((t) => t.toLowerCase().startsWith("v=spf1"));
  }

  const ns = await safeResolve("NS", () => dns.resolveNs(d));
  if (ns) bundle.ns = ns;

  const dmarcHost = `_dmarc.${d}`;
  const dmarcTxt = await safeResolve("DMARC", () => dns.resolveTxt(dmarcHost));
  if (dmarcTxt) {
    bundle.dmarcTxt = dmarcTxt.map((chunks) => chunks.join(""));
  }

  return bundle;
}
