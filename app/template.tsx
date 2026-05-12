/**
 * Wraps each top-level segment to re-run enter motion on client navigations
 * without remounting the global header chrome.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col motion-safe:animate-page-enter motion-reduce:animate-none">
      {children}
    </div>
  );
}
