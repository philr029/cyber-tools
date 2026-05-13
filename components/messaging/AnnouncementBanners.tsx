"use client";

import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import { BANNERS } from "@/lib/messaging/banners.config";
import { isBannerScheduleActive } from "@/lib/messaging/banner-utils";
import { setDismissed, shouldShowDismissible } from "@/lib/messaging/dismiss-storage";
import { matchesAuth, matchesPathPrefixes } from "@/lib/messaging/path-match";
import { useAuth } from "@/lib/auth-context";
import { PlatformBanner } from "@/components/messaging/PlatformBanner";

export default function AnnouncementBanners() {
  const pathname = usePathname() ?? "/";
  const { user, loading } = useAuth();
  const isLoggedIn = Boolean(user);
  const [tick, setTick] = useState(0);

  const visible = useMemo(() => {
    if (loading) return [];
    return BANNERS.filter((b) => {
      if (!isBannerScheduleActive(b.expiresAt)) return false;
      if (!matchesPathPrefixes(pathname, b.pathPrefixes)) return false;
      if (!matchesAuth(b.auth, isLoggedIn)) return false;
      if (b.dismissible === false) return true;
      return shouldShowDismissible("banner", b.id, b.version, b.dismissTtlDays);
    });
  }, [pathname, isLoggedIn, loading, tick]);

  if (visible.length === 0) return null;

  return (
    <div className="border-b border-[var(--ss-border)] bg-[var(--ss-page)]">
      {visible.map((b) => (
        <PlatformBanner
          key={b.id}
          banner={b}
          onDismiss={
            b.dismissible !== false
              ? () => {
                  setDismissed("banner", b.id, b.version);
                  setTick((n) => n + 1);
                }
              : undefined
          }
        />
      ))}
    </div>
  );
}
