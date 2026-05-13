import type { FormId } from "@/lib/messaging/types";

const prefix = "ss_form_archive_";

export type ArchivedSubmission = {
  formId: FormId;
  at: string;
  fields: Record<string, string>;
};

function key(formId: FormId) {
  return `${prefix}${formId}`;
}

export function appendFormSubmission(formId: FormId, fields: Record<string, string>) {
  if (typeof window === "undefined") return;
  const entry: ArchivedSubmission = { formId, at: new Date().toISOString(), fields };
  try {
    const prev = window.localStorage.getItem(key(formId));
    const list: ArchivedSubmission[] = prev ? (JSON.parse(prev) as ArchivedSubmission[]) : [];
    const next = [...(Array.isArray(list) ? list : []), entry].slice(-40);
    window.localStorage.setItem(key(formId), JSON.stringify(next));
  } catch {
    /* quota */
  }
}

export function listFormSubmissions(formId: FormId): ArchivedSubmission[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(key(formId));
    if (!raw) return [];
    const list = JSON.parse(raw) as ArchivedSubmission[];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export function submissionsToJson(formId: FormId): string {
  return JSON.stringify(listFormSubmissions(formId), null, 2);
}

/** Simple CSV of the latest submission (single row header + values). */
export function lastSubmissionToCsv(formId: FormId): string | null {
  const list = listFormSubmissions(formId);
  const last = list[list.length - 1];
  if (!last) return null;
  const headers = Object.keys(last.fields);
  const esc = (v: string) => `"${v.replace(/"/g, '""')}"`;
  return [headers.join(","), headers.map((h) => esc(last.fields[h] ?? "")).join(",")].join("\n");
}
