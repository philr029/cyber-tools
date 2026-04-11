"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import {
  loadNotifications,
  markAllRead,
  addNotification,
} from "@/lib/enterprise-mock";
import type { AppNotification, NotificationType } from "@/lib/types";

interface NotificationsContextValue {
  notifications: AppNotification[];
  unreadCount: number;
  markRead: () => void;
  push: (type: NotificationType, title: string, message: string, href?: string) => void;
  refresh: () => void;
}

const NotificationsContext = createContext<NotificationsContextValue | null>(null);

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<AppNotification[]>(() =>
    loadNotifications(),
  );

  const refresh = useCallback(() => {
    setNotifications(loadNotifications());
  }, []);

  const markRead = useCallback(() => {
    markAllRead();
    setNotifications(loadNotifications());
  }, []);

  const push = useCallback(
    (type: NotificationType, title: string, message: string, href?: string) => {
      addNotification(type, title, message, href);
      setNotifications(loadNotifications());
    },
    [],
  );

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationsContext.Provider value={{ notifications, unreadCount, markRead, push, refresh }}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error("useNotifications must be used inside NotificationsProvider");
  return ctx;
}
