"use client";

import AnnouncementBanners from "@/components/messaging/AnnouncementBanners";
import PopupOrchestrator from "@/components/messaging/PopupOrchestrator";
import { PlatformModalProvider } from "@/components/messaging/modal-context";

export default function MessagingRoot() {
  return (
    <PlatformModalProvider>
      <AnnouncementBanners />
      <PopupOrchestrator />
    </PlatformModalProvider>
  );
}
