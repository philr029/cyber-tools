interface MockDataBannerProps {
  isMock: boolean;
}

export default function MockDataBanner({ isMock }: MockDataBannerProps) {
  if (!isMock) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 rounded-full ring-1 ring-emerald-200">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        Live Data
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-500 bg-slate-50 rounded-full ring-1 ring-slate-200">
      <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
      Not configured
    </span>
  );
}
