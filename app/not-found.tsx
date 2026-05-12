import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex-1 bg-[#050505] flex flex-col items-center justify-center px-4 py-24 text-center">
      <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-300/90">404</p>
      <h1 className="mt-3 text-2xl font-semibold text-white sm:text-3xl">This page isn&apos;t in the toolkit</h1>
      <p className="mt-3 max-w-md text-sm text-white/60">
        The route may have moved, or the link might be outdated. Try search, the tools hub, or your dashboard.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/search"
          className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2.5 text-sm font-semibold text-white"
        >
          Open search
        </Link>
        <Link
          href="/tools/browse"
          className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white/85 hover:bg-white/10"
        >
          Toolkit index
        </Link>
        <Link
          href="/tools"
          className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white/85 hover:bg-white/10"
        >
          Security suite
        </Link>
        <Link href="/" className="text-sm text-cyan-300 hover:text-cyan-200 underline-offset-2 hover:underline">
          Home
        </Link>
      </div>
    </main>
  );
}
