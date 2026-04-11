"use client";

import { useState, type FormEvent } from "react";
import {
  loadMonitors,
  addMonitor,
  removeMonitor,
  type MonitoredTarget,
} from "@/lib/mockData";
import { useToast } from "@/lib/toast-context";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";

const SEVERITY_COLORS = {
  info: "text-cyan-400 bg-cyan-500/10",
  warning: "text-amber-400 bg-amber-500/10",
  critical: "text-red-400 bg-red-500/10",
};

const TYPE_LABELS: Record<string, string> = { ip: "IP", domain: "Domain", url: "URL" };

export default function AlertsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [monitors, setMonitors] = useState<MonitoredTarget[]>(() => loadMonitors());
  const [target, setTarget] = useState("");
  const [type, setType] = useState<"ip" | "domain" | "url">("domain");

  function handleAdd(e: FormEvent) {
    e.preventDefault();
    if (!target.trim()) return;
    if (user?.plan !== "pro") {
      toast("Monitoring is a Pro feature. Upgrade to enable alerts.", "warning");
      return;
    }
    const monitor = addMonitor(target.trim(), type);
    setMonitors((prev) => [monitor, ...prev]);
    setTarget("");
    toast(`Now monitoring ${target.trim()}`, "success");
  }

  function handleRemove(id: string) {
    removeMonitor(id);
    setMonitors((prev) => prev.filter((m) => m.id !== id));
    toast("Monitor removed.", "info");
  }

  const allAlerts = monitors.flatMap((m) => m.alerts).sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-100">Alerts &amp; Monitoring</h1>
        <p className="text-sm text-slate-400 mt-0.5">
          Monitor domains and IPs for security changes.
        </p>
      </div>

      {user?.plan !== "pro" && (
        <div className="mb-5 rounded-2xl bg-amber-500/5 border border-amber-500/20 p-4 flex items-center gap-4">
          <svg className="w-5 h-5 text-amber-400 shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z" clipRule="evenodd" />
          </svg>
          <div className="flex-1">
            <p className="text-sm font-medium text-amber-300">Pro feature</p>
            <p className="text-xs text-amber-400/70 mt-0.5">Upgrade to Pro to add monitors and receive alerts when threats are detected.</p>
          </div>
          <Link href="/pricing" className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-medium transition-colors">
            Upgrade
          </Link>
        </div>
      )}

      {/* Add monitor form */}
      <form onSubmit={handleAdd} className="rounded-2xl bg-[#0d1321] border border-[#1e2d4a] p-5 mb-5">
        <p className="text-sm font-medium text-slate-300 mb-3">Add Monitor</p>
        <div className="flex flex-col sm:flex-row gap-2">
          <select
            value={type}
            onChange={(e) => setType(e.target.value as "ip" | "domain" | "url")}
            className="px-3 py-2 rounded-xl bg-[#131929] border border-[#1e2d4a] text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/40 transition-colors"
          >
            <option value="domain">Domain</option>
            <option value="ip">IP</option>
            <option value="url">URL</option>
          </select>
          <input
            type="text"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            placeholder="example.com or 1.2.3.4"
            className="flex-1 px-3 py-2 rounded-xl bg-[#131929] border border-[#1e2d4a] text-slate-200 placeholder-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500/50 transition-colors"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-medium transition-colors"
          >
            Monitor
          </button>
        </div>
      </form>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Active monitors */}
        <div className="rounded-2xl bg-[#0d1321] border border-[#1e2d4a] p-5">
          <p className="text-sm font-medium text-slate-300 mb-3">Active Monitors</p>
          {monitors.length === 0 ? (
            <p className="text-xs text-slate-500 py-4 text-center">No monitors configured.</p>
          ) : (
            <div className="space-y-2">
              {monitors.map((m) => (
                <div key={m.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-[#131929]">
                  <span className="text-xs font-medium text-slate-500 shrink-0">{TYPE_LABELS[m.type]}</span>
                  <span className="flex-1 text-sm font-mono text-slate-300 truncate">{m.target}</span>
                  <span className={`w-2 h-2 rounded-full shrink-0 ${
                    m.status === "safe" ? "bg-emerald-500" :
                    m.status === "warning" ? "bg-amber-500" :
                    m.status === "risk" ? "bg-red-500" :
                    "bg-slate-600"
                  }`} />
                  <button
                    type="button"
                    onClick={() => handleRemove(m.id)}
                    aria-label={`Remove monitor for ${m.target}`}
                    className="text-slate-600 hover:text-red-400 transition-colors"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Alert feed */}
        <div className="rounded-2xl bg-[#0d1321] border border-[#1e2d4a] p-5">
          <p className="text-sm font-medium text-slate-300 mb-3">Alert Feed</p>
          {allAlerts.length === 0 ? (
            <div className="py-4 text-center">
              <p className="text-xs text-slate-500">No alerts. All monitored targets are nominal.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {allAlerts.slice(0, 10).map((alert) => (
                <div key={alert.id} className={`flex items-start gap-2.5 p-2.5 rounded-xl border ${
                  alert.severity === "critical" ? "bg-red-500/5 border-red-500/20" :
                  alert.severity === "warning" ? "bg-amber-500/5 border-amber-500/20" :
                  "bg-cyan-500/5 border-cyan-500/20"
                }`}>
                  <span className={`mt-0.5 shrink-0 inline-flex px-1.5 py-0.5 rounded text-xs font-medium ${SEVERITY_COLORS[alert.severity]}`}>
                    {alert.severity}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-300">{alert.message}</p>
                    <p className="text-xs text-slate-600 mt-0.5">{new Date(alert.timestamp).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
