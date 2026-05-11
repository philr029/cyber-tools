"use client";

import { useMemo, useState } from "react";
import ToolPageLayout from "@/app/components/tools/ToolPageLayout";
import CopyButton from "@/app/components/tools/CopyButton";

type Lang = "javascript" | "python" | "powershell" | "html" | "css";

interface Snippet {
  name: string;
  code: string;
}

const LIBRARY: Record<Lang, Snippet[]> = {
  javascript: [
    {
      name: "Fetch JSON with error handling",
      code: `async function getJson(url) {
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(\`HTTP \${res.status} - \${res.statusText}\`);
  return res.json();
}`,
    },
    {
      name: "Debounce helper",
      code: `function debounce(fn, ms = 250) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}`,
    },
    {
      name: "Local storage hook (React)",
      code: `import { useEffect, useState } from "react";

export function useLocalStorage(key, initial) {
  const [v, setV] = useState(() => {
    if (typeof window === "undefined") return initial;
    try { return JSON.parse(localStorage.getItem(key)) ?? initial; } catch { return initial; }
  });
  useEffect(() => { try { localStorage.setItem(key, JSON.stringify(v)); } catch {} }, [key, v]);
  return [v, setV];
}`,
    },
  ],
  python: [
    {
      name: "Read CSV into list of dicts",
      code: `import csv
from pathlib import Path

def read_csv(path: str | Path) -> list[dict]:
    with open(path, newline="", encoding="utf-8") as f:
        return list(csv.DictReader(f))`,
    },
    {
      name: "Requests with retry",
      code: `import requests
from requests.adapters import HTTPAdapter, Retry

s = requests.Session()
s.mount("https://", HTTPAdapter(max_retries=Retry(total=3, backoff_factor=0.5)))
r = s.get("https://api.example.com/health", timeout=10)
r.raise_for_status()
print(r.json())`,
    },
    {
      name: "Simple argparse CLI",
      code: `import argparse

p = argparse.ArgumentParser(description="Demo CLI")
p.add_argument("name")
p.add_argument("--shout", action="store_true")
args = p.parse_args()
msg = f"Hello, {args.name}!"
print(msg.upper() if args.shout else msg)`,
    },
  ],
  powershell: [
    {
      name: "Bulk create AD users from CSV",
      code: `Import-Csv .\\users.csv | ForEach-Object {
  New-ADUser \`
    -Name "$($_.FirstName) $($_.LastName)" \`
    -GivenName $_.FirstName \`
    -Surname $_.LastName \`
    -SamAccountName $_.SamAccount \`
    -UserPrincipalName "$($_.SamAccount)@contoso.com" \`
    -Path "OU=NewStarters,DC=contoso,DC=com" \`
    -AccountPassword (ConvertTo-SecureString $_.Password -AsPlainText -Force) \`
    -Enabled $true \`
    -ChangePasswordAtLogon $true
}`,
    },
    {
      name: "Connect to Exchange Online",
      code: `Install-Module ExchangeOnlineManagement -Scope CurrentUser
Connect-ExchangeOnline -UserPrincipalName admin@contoso.com -ShowProgress $true`,
    },
    {
      name: "Find disabled accounts",
      code: `Get-ADUser -Filter 'Enabled -eq $false' -Properties LastLogonDate |
  Select-Object Name, SamAccountName, LastLogonDate |
  Sort-Object LastLogonDate -Descending |
  Export-Csv .\\disabled-users.csv -NoTypeInformation`,
    },
  ],
  html: [
    {
      name: "Semantic page skeleton",
      code: `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Page title</title>
  <meta name="description" content="Short SEO description, 150 chars max." />
</head>
<body>
  <header><nav aria-label="Primary"></nav></header>
  <main></main>
  <footer></footer>
</body>
</html>`,
    },
    {
      name: "Accessible form field",
      code: `<label for="email" class="block text-sm font-medium">Email</label>
<input
  id="email"
  name="email"
  type="email"
  autocomplete="email"
  required
  aria-describedby="email-help"
  class="mt-1 block w-full rounded-md border-gray-300"
/>
<p id="email-help" class="mt-1 text-xs text-gray-500">We never share your email.</p>`,
    },
  ],
  css: [
    {
      name: "Fluid container with gutters",
      code: `.container {
  width: min(100% - 2rem, 72rem);
  margin-inline: auto;
}`,
    },
    {
      name: "Card with hover lift",
      code: `.card {
  border: 1px solid rgb(255 255 255 / 0.1);
  border-radius: 1rem;
  background: rgb(255 255 255 / 0.03);
  padding: 1.25rem;
  transition: transform .15s ease, border-color .15s ease;
}
.card:hover {
  transform: translateY(-2px);
  border-color: rgb(34 211 238 / 0.5);
}`,
    },
    {
      name: "Reduced motion respect",
      code: `@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.001ms !important;
    scroll-behavior: auto !important;
  }
}`,
    },
  ],
};

const LANG_LABEL: Record<Lang, string> = {
  javascript: "JavaScript",
  python: "Python",
  powershell: "PowerShell",
  html: "HTML",
  css: "CSS",
};

export default function SnippetGeneratorPage() {
  const [lang, setLang] = useState<Lang>("javascript");
  const [description, setDescription] = useState("");
  const [picked, setPicked] = useState<string>(LIBRARY.javascript[0].name);

  const snippets = LIBRARY[lang];
  const current = useMemo(
    () => snippets.find((s) => s.name === picked) ?? snippets[0],
    [snippets, picked],
  );

  const output = useMemo(() => {
    const header = `// ${LANG_LABEL[lang]} — ${current.name}\n// Intent: ${
      description.trim() || "(describe what you want to do for richer context)"
    }\n\n`;
    if (lang === "python") return `# ${LANG_LABEL[lang]} — ${current.name}\n# Intent: ${description.trim() || "(describe what you want to do)"}\n\n${current.code}`;
    if (lang === "powershell") return `# ${LANG_LABEL[lang]} — ${current.name}\n# Intent: ${description.trim() || "(describe what you want to do)"}\n\n${current.code}`;
    if (lang === "html") return `<!-- ${LANG_LABEL[lang]} — ${current.name} -->\n<!-- Intent: ${description.trim() || "(describe what you want to do)"} -->\n\n${current.code}`;
    if (lang === "css") return `/* ${LANG_LABEL[lang]} — ${current.name}\n   Intent: ${description.trim() || "(describe what you want to do)"} */\n\n${current.code}`;
    return header + current.code;
  }, [lang, current, description]);

  return (
    <ToolPageLayout
      title="Code Snippet Generator"
      description="Choose a language, describe what you want to do, and copy a well-formatted starter snippet. Replace the placeholder with your own logic and ship faster."
    >
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <MetaCard label="Skill" body="Multi-language code scaffolding." accent="cyan" />
        <MetaCard label="Why" body="Stops you retyping the same boilerplate for every script." accent="violet" />
        <MetaCard
          label="Future API"
          body="Optional: wire to an LLM via a serverless function so the description field becomes a real prompt. Never call the LLM directly from the browser — proxy through Vercel/Netlify so the API key stays server-side."
          accent="emerald"
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-[24px] border border-white/10 bg-[rgba(255,255,255,0.03)] p-5">
          <label className="block text-xs text-white/65">
            <span className="mb-1 block font-medium text-white/75">Language</span>
            <select
              value={lang}
              onChange={(e) => {
                const v = e.target.value as Lang;
                setLang(v);
                setPicked(LIBRARY[v][0].name);
              }}
              className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
            >
              {Object.keys(LIBRARY).map((k) => (
                <option key={k} value={k} className="bg-[#0b1220]">
                  {LANG_LABEL[k as Lang]}
                </option>
              ))}
            </select>
          </label>

          <label className="mt-3 block text-xs text-white/65">
            <span className="mb-1 block font-medium text-white/75">Describe what you want</span>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. fetch a JSON endpoint with retry and surface a friendly error message"
              className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
            />
            <span className="mt-1 block text-[11px] leading-5 text-white/45">
              The description is included as a comment so you can wire it to an LLM later.
            </span>
          </label>

          <label className="mt-3 block text-xs text-white/65">
            <span className="mb-1 block font-medium text-white/75">Starter template</span>
            <select
              value={picked}
              onChange={(e) => setPicked(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
            >
              {snippets.map((s) => (
                <option key={s.name} value={s.name} className="bg-[#0b1220]">
                  {s.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="rounded-[24px] border border-white/10 bg-black/30 p-4">
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/55">
              {LANG_LABEL[lang]} output
              <span className="ml-2 rounded bg-white/5 px-1.5 py-0.5 text-[10px] font-mono text-white/55">
                {lang}
              </span>
            </p>
            <CopyButton text={output} label="Copy code" />
          </div>
          <pre className="max-h-96 overflow-auto rounded-xl bg-black/40 p-3 text-xs leading-6 text-white/85 whitespace-pre">
{output}
          </pre>
        </div>
      </div>
    </ToolPageLayout>
  );
}

function MetaCard({
  label,
  body,
  accent,
}: {
  label: string;
  body: string;
  accent: "cyan" | "violet" | "emerald";
}) {
  const map: Record<string, string> = {
    cyan: "border-cyan-400/20 bg-cyan-500/5 text-cyan-200",
    violet: "border-violet-400/20 bg-violet-500/5 text-violet-200",
    emerald: "border-emerald-400/20 bg-emerald-500/5 text-emerald-200",
  };
  return (
    <div className={`rounded-2xl border p-4 ${map[accent]}`}>
      <p className="text-[10px] font-semibold uppercase tracking-[0.28em] opacity-80">{label}</p>
      <p className="mt-1.5 text-xs leading-6 text-white/75">{body}</p>
    </div>
  );
}
