interface MockDataBannerProps {
  isMock: boolean;
}

export default function MockDataBanner({ isMock }: MockDataBannerProps) {
  if (!isMock) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-emerald-400 bg-emerald-500/10 rounded-full ring-1 ring-emerald-500/30">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        Live Data
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-400 bg-slate-500/10 rounded-full ring-1 ring-slate-500/30">
      <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
      Not configured
    </span>
  );
}
