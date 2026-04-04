"use client";

import { useState, useCallback } from "react";
import { randomWord } from "./wordlist";
import StrengthMeter from "./StrengthMeter";
import CopyButton from "./CopyButton";

export interface PassphraseOptions {
  wordCount: number;
  separator: string;
  capitalize: boolean;
  addNumber: boolean;
  addSymbol: boolean;
}

const SEPARATORS = [
  { value: "-", label: "Hyphen  ( - )" },
  { value: " ", label: "Space  ( · )" },
  { value: ".", label: "Dot  ( . )" },
  { value: "_", label: "Underscore  ( _ )" },
];

const DEFAULT_OPTS: PassphraseOptions = {
  wordCount: 4,
  separator: "-",
  capitalize: true,
  addNumber: true,
  addSymbol: false,
};

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

function generatePassphrase(opts: PassphraseOptions): string {
  const SYMBOLS = "!@#$%";
  const words: string[] = [];

  for (let i = 0; i < opts.wordCount; i++) {
    let word = randomWord();
    if (opts.capitalize) {
      word = word.charAt(0).toUpperCase() + word.slice(1);
    }
    words.push(word);
  }

  let result = words.join(opts.separator);

  if (opts.addNumber) {
    const num = new Uint32Array(1);
    crypto.getRandomValues(num);
    result += opts.separator + (num[0] % 90 + 10).toString();
  }

  if (opts.addSymbol) {
    const sym = new Uint32Array(1);
    crypto.getRandomValues(sym);
    result += SYMBOLS[sym[0] % SYMBOLS.length];
  }

  return result;
}

export default function PassphraseGenerator() {
  const [opts, setOpts] = useState<PassphraseOptions>(DEFAULT_OPTS);
  const [passphrase, setPassphrase] = useState(() => generatePassphrase(DEFAULT_OPTS));

  const regenerate = useCallback(() => {
    setPassphrase(generatePassphrase(opts));
  }, [opts]);

  function setOpt<K extends keyof PassphraseOptions>(key: K, value: PassphraseOptions[K]) {
    setOpts((prev) => {
      const next = { ...prev, [key]: value };
      setPassphrase(generatePassphrase(next));
      return next;
    });
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center gap-2 mb-5">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-50">
          <svg className="w-4 h-4 text-purple-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path
              fillRule="evenodd"
              d="M4.5 2A1.5 1.5 0 003 3.5v13A1.5 1.5 0 004.5 18h11a1.5 1.5 0 001.5-1.5V7.621a1.5 1.5 0 00-.44-1.06l-4.12-4.122A1.5 1.5 0 0011.378 2H4.5zM10 8a.75.75 0 01.75.75v1.5h1.5a.75.75 0 010 1.5h-1.5v1.5a.75.75 0 01-1.5 0v-1.5h-1.5a.75.75 0 010-1.5h1.5v-1.5A.75.75 0 0110 8z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <h2 className="text-base font-semibold text-gray-900">Passphrase Generator</h2>
      </div>

      {/* Passphrase output */}
      <div className="mb-5">
        <div className="flex items-center gap-2 rounded-xl border px-4 py-3 bg-gray-50">
          <span
            className="flex-1 font-mono text-sm text-gray-900 break-all select-all"
            aria-label="Generated passphrase"
          >
            {passphrase}
          </span>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              type="button"
              onClick={regenerate}
              aria-label="Regenerate passphrase"
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path
                  fillRule="evenodd"
                  d="M15.312 11.424a5.5 5.5 0 01-9.201 2.466l-.312-.311h2.433a.75.75 0 000-1.5H3.989a.75.75 0 00-.75.75v4.242a.75.75 0 001.5 0v-2.43l.31.31a7 7 0 0011.712-3.138.75.75 0 00-1.449-.39zm1.23-3.723a.75.75 0 00.219-.53V2.929a.75.75 0 00-1.5 0V5.36l-.31-.31A7 7 0 003.239 8.188a.75.75 0 101.448.389A5.5 5.5 0 0113.89 6.11l.311.31h-2.432a.75.75 0 000 1.5h4.243a.75.75 0 00.53-.219z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            <CopyButton text={passphrase} />
          </div>
        </div>
        <StrengthMeter password={passphrase} />
      </div>

      {/* Word count */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-2">
          <label htmlFor="pp-count" className="text-sm font-medium text-gray-700">
            Word count
          </label>
          <span className="text-sm font-semibold text-purple-600 tabular-nums">{opts.wordCount}</span>
        </div>
        <input
          id="pp-count"
          type="range"
          min={2}
          max={10}
          value={opts.wordCount}
          onChange={(e) => setOpt("wordCount", Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-purple-500"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>2</span>
          <span>10</span>
        </div>
      </div>

      {/* Separator */}
      <div className="mb-5">
        <label htmlFor="pp-separator" className="block text-sm font-medium text-gray-700 mb-2">
          Word separator
        </label>
        <select
          id="pp-separator"
          value={opts.separator}
          onChange={(e) => setOpt("separator", e.target.value)}
          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-400"
        >
          {SEPARATORS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {/* Options */}
      <div>
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Options</p>
        <div className="flex flex-col gap-3">
          <Toggle id="pp-capitalize" checked={opts.capitalize} onChange={(v) => setOpt("capitalize", v)} label="Capitalize words" />
          <Toggle id="pp-number" checked={opts.addNumber} onChange={(v) => setOpt("addNumber", v)} label="Add a number" />
          <Toggle id="pp-symbol" checked={opts.addSymbol} onChange={(v) => setOpt("addSymbol", v)} label="Add a symbol (!@#$%)" />
        </div>
      </div>
    </div>
  );
}
