"use client";

import AnnouncementBanners from "@/components/messaging/AnnouncementBanners";
import PopupOrchestrator from "@/components/messaging/PopupOrchestrator";
import { PlatformModalProvider } from "@/components/messaging/modal-context";
import ToolVisitRecorder from "@/app/components/platform/ToolVisitRecorder";
import FirstVisitWelcome from "@/app/components/platform/FirstVisitWelcome";

export default function MessagingRoot() {
  return (
    <PlatformModalProvider>
      <ToolVisitRecorder />
      <AnnouncementBanners />
      <PopupOrchestrator />
      <FirstVisitWelcome />
    </PlatformModalProvider>
  );
}
