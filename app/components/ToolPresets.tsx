"use client";

interface Preset {
  label: string;
  query: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bg: string;
}

const PRESETS: Preset[] = [
  {
    label: "Demo Scan",
    query: "google.com",
    description: "Run a full audit on google.com",
    color: "text-cyan-400",
    bg: "bg-cyan-500/10 border-cyan-500/20 hover:bg-cyan-500/15 hover:border-cyan-500/35",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path fillRule="evenodd" d="M2 10a8 8 0 1116 0 8 8 0 01-16 0zm6.39-2.908a.75.75 0 01.766.027l3.5 2.25a.75.75 0 010 1.262l-3.5 2.25A.75.75 0 018 12.25v-4.5a.75.75 0 01.39-.658z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    label: "Suspicious IP",
    query: "185.220.101.1",
    description: "Known Tor exit node",
    color: "text-red-400",
    bg: "bg-red-500/10 border-red-500/20 hover:bg-red-500/15 hover:border-red-500/35",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    label: "CloudFlare DNS",
    query: "1.1.1.1",
    description: "Check Cloudflare's public DNS",
    color: "text-orange-400",
    bg: "bg-orange-500/10 border-orange-500/20 hover:bg-orange-500/15 hover:border-orange-500/35",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path d="M10.75 16.82A7.462 7.462 0 0115 15.5c.71 0 1.396.098 2.046.282A.75.75 0 0018 15.06v-11a.75.75 0 00-.546-.721A9.006 9.006 0 0015 3a8.963 8.963 0 00-4.25 1.065V16.82zM9.25 4.065A8.963 8.963 0 005 3c-.85 0-1.673.118-2.454.339A.75.75 0 002 4.06v11a.75.75 0 00.954.721A7.506 7.506 0 015 15.5c1.579 0 3.042.487 4.25 1.32V4.065z" />
      </svg>
    ),
  },
  {
    label: "GitHub Domain",
    query: "github.com",
    description: "Full security audit on GitHub",
    color: "text-purple-400",
    bg: "bg-purple-500/10 border-purple-500/20 hover:bg-purple-500/15 hover:border-purple-500/35",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path fillRule="evenodd" d="M9.661 2.237a.531.531 0 01.678 0 11.947 11.947 0 007.078 2.749.5.5 0 01.479.425c.069.52.104 1.05.104 1.589 0 5.162-3.26 9.563-7.834 11.256a.48.48 0 01-.332 0C5.26 16.563 2 12.162 2 7a10.66 10.66 0 01.104-1.589.5.5 0 01.48-.425 11.947 11.947 0 007.077-2.749z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    label: "Google DNS",
    query: "8.8.8.8",
    description: "Google's public DNS server",
    color: "text-blue-400",
    bg: "bg-blue-500/10 border-blue-500/20 hover:bg-blue-500/15 hover:border-blue-500/35",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    label: "Microsoft",
    query: "microsoft.com",
    description: "Enterprise security snapshot",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/15 hover:border-emerald-500/35",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
      </svg>
    ),
  },
];

interface Props {
  onSelect: (query: string) => void;
}

export default function ToolPresets({ onSelect }: Props) {
  return (
    <div className="space-y-3 animate-fade-in-delay">
      <div className="flex items-center gap-2">
        <svg className="w-3.5 h-3.5 text-cyan-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path d="M11.983 1.907a.75.75 0 00-1.292-.657l-8.5 9.5A.75.75 0 002.75 12h6.572l-1.305 6.093a.75.75 0 001.292.657l8.5-9.5A.75.75 0 0017.25 8h-6.572l1.305-6.093z" />
        </svg>
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Quick Presets</h2>
      </div>
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((preset) => (
          <button
            key={preset.query}
            type="button"
            onClick={() => onSelect(preset.query)}
            title={preset.description}
            className={`preset-btn inline-flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition-all duration-200 ${preset.bg} ${preset.color}`}
          >
            {preset.icon}
            {preset.label}
          </button>
        ))}
      </div>
    </div>
  );
}
