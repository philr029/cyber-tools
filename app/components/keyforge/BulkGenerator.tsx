"use client";

import { useState, useCallback } from "react";
import { generatePassword, type PasswordOptions } from "./passwordUtils";
import CopyButton from "./CopyButton";

const DEFAULT_OPTS: PasswordOptions = {
  length: 16,
  uppercase: true,
  lowercase: true,
  numbers: true,
  symbols: true,
  excludeSimilar: false,
  excludeAmbiguous: false,
};

const MAX_BULK = 50;

interface ToggleProps {
  id: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}

function Toggle({ id, checked, onChange, label }: ToggleProps) {
  return (
    <label htmlFor={id} className="flex items-center gap-2.5 cursor-pointer select-none">
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-5 w-9 flex-shrink-0 rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
          checked ? "bg-blue-500" : "bg-gray-200"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 mt-0.5 ${
            checked ? "translate-x-4.5" : "translate-x-0.5"
          }`}
        />
      </button>
      <span className="text-sm text-gray-700">{label}</span>
    </label>
  );
}

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function BulkGenerator() {
  const [opts, setOpts] = useState<PasswordOptions>(DEFAULT_OPTS);
  const [count, setCount] = useState(10);
  const [passwords, setPasswords] = useState<string[]>([]);
  const [generated, setGenerated] = useState(false);

  const atLeastOneCharset = opts.uppercase || opts.lowercase || opts.numbers || opts.symbols;

  function setOpt<K extends keyof PasswordOptions>(key: K, value: PasswordOptions[K]) {
    setOpts((prev) => ({ ...prev, [key]: value }));
    setGenerated(false);
  }

  const handleGenerate = useCallback(() => {
    if (!atLeastOneCharset) return;
    const list: string[] = [];
    for (let i = 0; i < count; i++) {
      list.push(generatePassword(opts));
    }
    setPasswords(list);
    setGenerated(true);
  }, [opts, count, atLeastOneCharset]);

  function exportTxt() {
    downloadFile(passwords.join("\n"), "keyforge-passwords.txt", "text/plain");
  }

  function exportCsv() {
    const header = "index,password\n";
    const rows = passwords.map((p, i) => `${i + 1},"${p.replace(/"/g, '""')}"`).join("\n");
    downloadFile(header + rows, "keyforge-passwords.csv", "text/csv");
  }

  function copyAll() {
    const text = passwords.join("\n");
    navigator.clipboard.writeText(text).catch(() => {});
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center gap-2 mb-5">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-green-50">
          <svg className="w-4 h-4 text-green-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path d="M10 3a1.5 1.5 0 110 3 1.5 1.5 0 010-3zM10 8.5a1.5 1.5 0 110 3 1.5 1.5 0 010-3zM11.5 15.5a1.5 1.5 0 10-3 0 1.5 1.5 0 003 0z" />
          </svg>
        </div>
        <h2 className="text-base font-semibold text-gray-900">Bulk Generator</h2>
      </div>

      {/* Count */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-2">
          <label htmlFor="bulk-count" className="text-sm font-medium text-gray-700">
            Number of passwords
          </label>
          <span className="text-sm font-semibold text-green-600 tabular-nums">{count}</span>
        </div>
        <input
          id="bulk-count"
          type="range"
          min={1}
          max={MAX_BULK}
          value={count}
          onChange={(e) => {
            setCount(Number(e.target.value));
            setGenerated(false);
          }}
          className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-green-500"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>1</span>
          <span>{MAX_BULK}</span>
        </div>
      </div>

      {/* Length */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-2">
          <label htmlFor="bulk-length" className="text-sm font-medium text-gray-700">
            Password length
          </label>
          <span className="text-sm font-semibold text-green-600 tabular-nums">{opts.length}</span>
        </div>
        <input
          id="bulk-length"
          type="range"
          min={6}
          max={128}
          value={opts.length}
          onChange={(e) => setOpt("length", Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-green-500"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>6</span>
          <span>128</span>
        </div>
      </div>

      {/* Options */}
      <div className="mb-5">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Options</p>
        <div className="grid grid-cols-2 gap-y-3 gap-x-4 mb-3">
          <Toggle id="bulk-upper" checked={opts.uppercase} onChange={(v) => setOpt("uppercase", v)} label="Uppercase" />
          <Toggle id="bulk-lower" checked={opts.lowercase} onChange={(v) => setOpt("lowercase", v)} label="Lowercase" />
          <Toggle id="bulk-numbers" checked={opts.numbers} onChange={(v) => setOpt("numbers", v)} label="Numbers" />
          <Toggle id="bulk-symbols" checked={opts.symbols} onChange={(v) => setOpt("symbols", v)} label="Symbols" />
        </div>
        <div className="flex flex-col gap-3">
          <Toggle id="bulk-similar" checked={opts.excludeSimilar} onChange={(v) => setOpt("excludeSimilar", v)} label="Exclude similar chars" />
          <Toggle id="bulk-ambiguous" checked={opts.excludeAmbiguous} onChange={(v) => setOpt("excludeAmbiguous", v)} label="Exclude ambiguous symbols" />
        </div>
        {!atLeastOneCharset && (
          <p className="text-xs text-red-500 mt-2">At least one character set must be selected.</p>
        )}
      </div>

      {/* Generate button */}
      <button
        type="button"
        onClick={handleGenerate}
        disabled={!atLeastOneCharset}
        className="w-full py-2.5 px-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-colors"
      >
        Generate {count} Password{count !== 1 ? "s" : ""}
      </button>

      {/* Results */}
      {generated && passwords.length > 0 && (
        <div className="mt-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-gray-500">{passwords.length} passwords generated</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={copyAll}
                className="text-xs font-medium text-gray-500 hover:text-gray-900 underline-offset-2 hover:underline transition-colors"
              >
                Copy all
              </button>
              <button
                type="button"
                onClick={exportTxt}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900 transition-colors"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path d="M10.75 2.75a.75.75 0 00-1.5 0v8.614L6.295 8.235a.75.75 0 10-1.09 1.03l4.25 4.5a.75.75 0 001.09 0l4.25-4.5a.75.75 0 00-1.09-1.03l-2.955 3.129V2.75z" />
                  <path d="M3.5 12.75a.75.75 0 00-1.5 0v2.5A2.75 2.75 0 004.75 18h10.5A2.75 2.75 0 0018 15.25v-2.5a.75.75 0 00-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5z" />
                </svg>
                TXT
              </button>
              <button
                type="button"
                onClick={exportCsv}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900 transition-colors"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path d="M10.75 2.75a.75.75 0 00-1.5 0v8.614L6.295 8.235a.75.75 0 10-1.09 1.03l4.25 4.5a.75.75 0 001.09 0l4.25-4.5a.75.75 0 00-1.09-1.03l-2.955 3.129V2.75z" />
                  <path d="M3.5 12.75a.75.75 0 00-1.5 0v2.5A2.75 2.75 0 004.75 18h10.5A2.75 2.75 0 0018 15.25v-2.5a.75.75 0 00-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5z" />
                </svg>
                CSV
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-gray-100 bg-gray-50 divide-y divide-gray-100 max-h-72 overflow-y-auto">
            {passwords.map((pw, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-2.5">
                <span className="text-xs text-gray-400 tabular-nums w-5 flex-shrink-0 text-right">{i + 1}</span>
                <span className="flex-1 font-mono text-xs text-gray-800 select-all break-all">{pw}</span>
                <CopyButton text={pw} className="flex-shrink-0" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
