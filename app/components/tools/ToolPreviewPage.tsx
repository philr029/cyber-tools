import type { ReactNode } from "react";
import ToolPageLayout from "@/app/components/tools/ToolPageLayout";

interface ToolPreviewPageProps {
  title: string;
  description: string;
  status: string;
  bullets: string[];
  icon: ReactNode;
}

export default function ToolPreviewPage({ title, description, status, bullets, icon }: ToolPreviewPageProps) {
  return (
    <ToolPageLayout title={title} description={description}>
      <div className="rounded-[28px] border border-white/10 bg-[rgba(255,255,255,0.03)] p-6 shadow-[0_18px_60px_rgba(0,0,0,0.28)] backdrop-blur-xl">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-black/25 text-white">
              {icon}
            </div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/45">Module Preview</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">{title}</h2>
            <p className="mt-3 text-sm leading-7 text-white/65">{description}</p>
          </div>
          <div className="rounded-2xl border border-cyan-400/15 bg-cyan-400/8 px-4 py-3 text-sm text-cyan-100">
            <p className="text-[11px] uppercase tracking-[0.22em] text-cyan-200/80">Status</p>
            <p className="mt-1 font-medium">{status}</p>
          </div>
        </div>
        <div className="mt-8 grid gap-3 md:grid-cols-3">
          {bullets.map((bullet) => (
            <div key={bullet} className="rounded-2xl border border-white/8 bg-black/20 p-4 text-sm leading-6 text-white/68">
              {bullet}
            </div>
          ))}
        </div>
      </div>
    </ToolPageLayout>
  );
}
