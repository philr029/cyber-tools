"use client";

import { useState, useCallback } from "react";
import { generatePassword, type PasswordOptions } from "./passwordUtils";
import StrengthMeter from "./StrengthMeter";
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

export default function PasswordGenerator() {
  const [opts, setOpts] = useState<PasswordOptions>(DEFAULT_OPTS);
  const [password, setPassword] = useState(() => generatePassword(DEFAULT_OPTS));

  const regenerate = useCallback(() => {
    setPassword(generatePassword(opts));
  }, [opts]);

  function setOpt<K extends keyof PasswordOptions>(key: K, value: PasswordOptions[K]) {
    setOpts((prev) => {
      const next = { ...prev, [key]: value };
      setPassword(generatePassword(next));
      return next;
    });
  }

  const atLeastOneCharset = opts.uppercase || opts.lowercase || opts.numbers || opts.symbols;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center gap-2 mb-5">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50">
          <svg className="w-4 h-4 text-blue-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path
              fillRule="evenodd"
              d="M8 7a5 5 0 114.546 4.978l-.285.286a.75.75 0 01-.531.22H11v.75a.75.75 0 01-.75.75H9.5v.75a.75.75 0 01-.75.75h-2A.75.75 0 016 15v-1.879a.75.75 0 01.22-.53l2.502-2.502A5.003 5.003 0 018 7zm5-1a1 1 0 11-2 0 1 1 0 012 0z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <h2 className="text-base font-semibold text-gray-900">Password Generator</h2>
      </div>

      {/* Password output */}
      <div className="mb-5">
        <div className={`flex items-center gap-2 rounded-xl border px-4 py-3 bg-gray-50 ${!atLeastOneCharset ? "opacity-50" : ""}`}>
          <span
            className="flex-1 font-mono text-sm text-gray-900 break-all select-all"
            aria-label="Generated password"
          >
            {atLeastOneCharset ? password : "—"}
          </span>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              type="button"
              onClick={regenerate}
              disabled={!atLeastOneCharset}
              aria-label="Regenerate password"
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path
                  fillRule="evenodd"
                  d="M15.312 11.424a5.5 5.5 0 01-9.201 2.466l-.312-.311h2.433a.75.75 0 000-1.5H3.989a.75.75 0 00-.75.75v4.242a.75.75 0 001.5 0v-2.43l.31.31a7 7 0 0011.712-3.138.75.75 0 00-1.449-.39zm1.23-3.723a.75.75 0 00.219-.53V2.929a.75.75 0 00-1.5 0V5.36l-.31-.31A7 7 0 003.239 8.188a.75.75 0 101.448.389A5.5 5.5 0 0113.89 6.11l.311.31h-2.432a.75.75 0 000 1.5h4.243a.75.75 0 00.53-.219z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            <CopyButton text={atLeastOneCharset ? password : ""} disabled={!atLeastOneCharset} />
          </div>
        </div>
        {atLeastOneCharset && <StrengthMeter password={password} />}
      </div>

      {/* Length */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-2">
          <label htmlFor="pw-length" className="text-sm font-medium text-gray-700">
            Length
          </label>
          <span className="text-sm font-semibold text-blue-600 tabular-nums">{opts.length}</span>
        </div>
        <input
          id="pw-length"
          type="range"
          min={6}
          max={128}
          value={opts.length}
          onChange={(e) => setOpt("length", Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-blue-500"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>6</span>
          <span>128</span>
        </div>
      </div>

      {/* Character sets */}
      <div className="mb-5">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Character sets</p>
        <div className="grid grid-cols-2 gap-y-3 gap-x-4">
          <Toggle id="pw-upper" checked={opts.uppercase} onChange={(v) => setOpt("uppercase", v)} label="Uppercase (A–Z)" />
          <Toggle id="pw-lower" checked={opts.lowercase} onChange={(v) => setOpt("lowercase", v)} label="Lowercase (a–z)" />
          <Toggle id="pw-numbers" checked={opts.numbers} onChange={(v) => setOpt("numbers", v)} label="Numbers (0–9)" />
          <Toggle id="pw-symbols" checked={opts.symbols} onChange={(v) => setOpt("symbols", v)} label="Symbols (!@#…)" />
        </div>
        {!atLeastOneCharset && (
          <p className="text-xs text-red-500 mt-2">At least one character set must be selected.</p>
        )}
      </div>

      {/* Exclusion options */}
      <div>
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Exclusions</p>
        <div className="flex flex-col gap-3">
          <Toggle
            id="pw-similar"
            checked={opts.excludeSimilar}
            onChange={(v) => setOpt("excludeSimilar", v)}
            label="Exclude similar characters (O, 0, l, 1, I)"
          />
          <Toggle
            id="pw-ambiguous"
            checked={opts.excludeAmbiguous}
            onChange={(v) => setOpt("excludeAmbiguous", v)}
            label={`Exclude ambiguous symbols ({ } [ ] ( ) / \\ ' " \` ~ , ; : . < >)`}
          />
        </div>
      </div>
    </div>
  );
}
