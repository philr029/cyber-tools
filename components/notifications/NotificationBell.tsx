"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useNotifications } from "@/lib/notifications-context";
import type { AppNotification } from "@/lib/types";

const TYPE_ICON: Record<string, string> = {
  alert: "🚨",
  case_created: "📁",
  risk_changed: "⚠️",
  playbook_fired: "⚡",
  member_invited: "👤",
};

function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function NotifItem({ notif, onClose }: { notif: AppNotification; onClose: () => void }) {
  const inner = (
    <div className={`flex items-start gap-3 px-4 py-3 hover:bg-white/5 transition-colors ${!notif.read ? "border-l-2 border-cyan-500" : "border-l-2 border-transparent"}`}>
      <span className="text-base shrink-0 mt-0.5">{TYPE_ICON[notif.type] ?? "🔔"}</span>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-slate-200 leading-snug">{notif.title}</p>
        <p className="text-xs text-slate-400 mt-0.5 leading-snug line-clamp-2">{notif.message}</p>
        <p className="text-[10px] text-slate-600 mt-1">{timeAgo(notif.createdAt)}</p>
      </div>
      {!notif.read && (
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0 mt-1.5" />
      )}
    </div>
  );

  if (notif.href) {
    return (
      <Link href={notif.href} onClick={onClose} className="block">
        {inner}
      </Link>
    );
  }
  return inner;
}

export default function NotificationBell() {
  const { notifications, unreadCount, markRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleOpen() {
    setOpen((v) => !v);
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={handleOpen}
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
        className="relative flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors"
      >
        <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M10 2a6 6 0 00-6 6c0 1.887-.454 3.665-1.257 5.234a.75.75 0 00.515 1.076 32.91 32.91 0 003.256.508 3.5 3.5 0 006.972 0 32.903 32.903 0 003.256-.508.75.75 0 00.515-1.076A11.448 11.448 0 0116 8a6 6 0 00-6-6zM8.05 14.943a33.54 33.54 0 003.9 0 2 2 0 01-3.9 0z" clipRule="evenodd" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center leading-none">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-1.5 w-80 rounded-xl border border-[#1e2d4a] bg-[#0d1321] shadow-[0_8px_32px_rgba(0,0,0,0.5)] z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#1e2d4a]">
            <p className="text-xs font-semibold text-slate-200">Notifications</p>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markRead}
                className="text-[10px] text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-[360px] overflow-y-auto divide-y divide-[#1e2d4a]">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <p className="text-xs text-slate-500">No notifications.</p>
              </div>
            ) : (
              notifications.slice(0, 15).map((n) => (
                <NotifItem key={n.id} notif={n} onClose={() => setOpen(false)} />
              ))
            )}
          </div>

          <div className="border-t border-[#1e2d4a] px-4 py-2">
            <Link
              href="/dashboard/activity"
              onClick={() => setOpen(false)}
              className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              View activity log →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
