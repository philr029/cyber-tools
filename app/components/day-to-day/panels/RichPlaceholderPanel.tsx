"use client";

import { getRichPlaceholder } from "@/lib/day-to-day-tools/rich-placeholders";
import ExportToolbar from "../ExportToolbar";

export default function RichPlaceholderPanel({ placeholderId }: { placeholderId: string }) {
  const cfg = getRichPlaceholder(placeholderId);
  if (!cfg) {
    return (
      <div className="rounded-2xl border border-dashed border-[var(--ss-border)] px-4 py-8 text-center text-sm text-[var(--ss-text-secondary)]">
        Unknown placeholder id: <code className="text-[var(--ss-accent)]">{placeholderId}</code>
      </div>
    );
  }

  const body = [
    cfg.title,
    "",
    cfg.summary,
    "",
    "Required environment variables:",
    ...cfg.requiredEnv.map((e) => `  - ${e}`),
    "",
    `Suggested backend route / artifact:\n${cfg.suggestedRoute}`,
    "",
    "Example request JSON:",
    JSON.stringify(cfg.exampleRequest, null, 2),
    "",
    "Example response JSON:",
    JSON.stringify(cfg.exampleResponse, null, 2),
    "",
    "Security:",
    cfg.securityNote,
  ].join("\n");

  return (
    <div className="space-y-4 text-sm text-[var(--ss-text-secondary)] leading-relaxed">
      <p className="text-[var(--ss-text)] font-semibold">{cfg.title}</p>
      <p>{cfg.summary}</p>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--ss-text-secondary)] mb-2">Required env</p>
        <ul className="list-disc pl-5 space-y-1">
          {cfg.requiredEnv.map((e) => (
            <li key={e} className="font-mono text-xs text-[var(--ss-text)]">
              {e}
            </li>
          ))}
        </ul>
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--ss-text-secondary)] mb-1">Backend placeholder</p>
        <code className="block rounded-xl border border-[var(--ss-border)] bg-[color-mix(in_srgb,var(--ss-text)_4%,transparent)] p-3 text-xs font-mono whitespace-pre-wrap text-[var(--ss-text)]">{cfg.suggestedRoute}</code>
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--ss-text-secondary)] mb-1">Example request</p>
          <pre className="rounded-xl border border-[var(--ss-border)] p-3 text-xs font-mono overflow-auto max-h-48 text-[var(--ss-text)]">{JSON.stringify(cfg.exampleRequest, null, 2)}</pre>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--ss-text-secondary)] mb-1">Example response</p>
          <pre className="rounded-xl border border-[var(--ss-border)] p-3 text-xs font-mono overflow-auto max-h-48 text-[var(--ss-text)]">{JSON.stringify(cfg.exampleResponse, null, 2)}</pre>
        </div>
      </div>
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-100">{cfg.securityNote}</div>
      <ExportToolbar filenameBase={`placeholder-${placeholderId}`} getText={() => body} getJson={() => ({ ...cfg })} />
    </div>
  );
}
