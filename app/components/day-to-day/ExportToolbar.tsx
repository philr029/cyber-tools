"use client";

import { copyToClipboard, downloadCsv, downloadJson, downloadTxt } from "./exportUtils";

type ExportKind = "copy" | "txt" | "csv" | "json";

export default function ExportToolbar({
  getText,
  getJson,
  csv,
  filenameBase,
  className = "",
}: {
  getText: () => string;
  getJson?: () => unknown;
  csv?: { headers: string[]; rows: string[][] };
  filenameBase: string;
  className?: string;
}) {
  const safeBase = filenameBase.replace(/[^\w\-]+/g, "_").slice(0, 80) || "export";

  async function run(kind: ExportKind) {
    if (kind === "copy") {
      await copyToClipboard(getText());
      return;
    }
    if (kind === "txt") downloadTxt(`${safeBase}.txt`, getText());
    if (kind === "json" && getJson) downloadJson(`${safeBase}.json`, getJson());
    if (kind === "csv" && csv) downloadCsv(`${safeBase}.csv`, csv.headers, csv.rows);
  }

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      <button
        type="button"
        onClick={() => void run("copy")}
        className="ss-pill px-3 py-1.5 text-xs font-semibold text-[var(--ss-text-secondary)] hover:text-[var(--ss-text)] hover:bg-[color-mix(in_srgb,var(--ss-text)_6%,transparent)] border border-[var(--ss-border)]"
      >
        Copy
      </button>
      <button
        type="button"
        onClick={() => run("txt")}
        className="ss-pill px-3 py-1.5 text-xs font-semibold text-[var(--ss-text-secondary)] hover:text-[var(--ss-text)] hover:bg-[color-mix(in_srgb,var(--ss-text)_6%,transparent)] border border-[var(--ss-border)]"
      >
        .txt
      </button>
      {getJson ? (
        <button
          type="button"
          onClick={() => run("json")}
          className="ss-pill px-3 py-1.5 text-xs font-semibold text-[var(--ss-text-secondary)] hover:text-[var(--ss-text)] hover:bg-[color-mix(in_srgb,var(--ss-text)_6%,transparent)] border border-[var(--ss-border)]"
        >
          .json
        </button>
      ) : null}
      {csv ? (
        <button
          type="button"
          onClick={() => run("csv")}
          className="ss-pill px-3 py-1.5 text-xs font-semibold text-[var(--ss-text-secondary)] hover:text-[var(--ss-text)] hover:bg-[color-mix(in_srgb,var(--ss-text)_6%,transparent)] border border-[var(--ss-border)]"
        >
          .csv
        </button>
      ) : null}
    </div>
  );
}
