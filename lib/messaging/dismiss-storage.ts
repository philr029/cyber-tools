const PREFIX = "ss.msg.";

export type DismissRecord = {
  /** Config version when dismissed */
  v: number;
  /** Unix ms */
  at: number;
};

function key(kind: "banner" | "popup", id: string): string {
  return `${PREFIX}${kind}.${id}`;
}

function safeParse(raw: string | null): DismissRecord | null {
  if (!raw) return null;
  try {
    const o = JSON.parse(raw) as DismissRecord;
    if (typeof o?.v === "number" && typeof o?.at === "number") return o;
  } catch {
    return null;
  }
  return null;
}

export function getDismissRecord(kind: "banner" | "popup", id: string): DismissRecord | null {
  if (typeof window === "undefined") return null;
  return safeParse(localStorage.getItem(key(kind, id)));
}

export function setDismissed(kind: "banner" | "popup", id: string, version: number): void {
  if (typeof window === "undefined") return;
  try {
    const rec: DismissRecord = { v: version, at: Date.now() };
    localStorage.setItem(key(kind, id), JSON.stringify(rec));
  } catch {
    // quota / private mode
  }
}

export function clearDismiss(kind: "banner" | "popup", id: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(key(kind, id));
  } catch {
    // ignore
  }
}

/**
 * Show again if: never dismissed, version bumped, or TTL elapsed since dismiss.
 */
export function shouldShowDismissible(
  kind: "banner" | "popup",
  id: string,
  version: number,
  dismissTtlDays?: number,
): boolean {
  const rec = getDismissRecord(kind, id);
  if (!rec) return true;
  if (rec.v < version) return true;
  if (dismissTtlDays != null && dismissTtlDays > 0) {
    const ttlMs = dismissTtlDays * 86400000;
    if (Date.now() - rec.at >= ttlMs) return true;
  }
  return false;
}

export function getPopupLastShown(id: string): number | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(`${PREFIX}popup.last.${id}`);
  if (!raw) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

export function setPopupLastShown(id: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(`${PREFIX}popup.last.${id}`, String(Date.now()));
  } catch {
    // ignore
  }
}
