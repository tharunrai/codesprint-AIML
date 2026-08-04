"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { type Notification } from "@/lib/types";

const STORAGE_KEY_NOTIFS = "placeme_notifications";

interface PlacementContextType {
  notifications: Notification[];
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  resetToDefaults: () => void;
}

const PlacementContext = createContext<PlacementContextType | undefined>(undefined);

export function PlacementProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem(STORAGE_KEY_NOTIFS);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Save to local storage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY_NOTIFS, JSON.stringify(notifications));
    }
  }, [notifications]);

  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const resetToDefaults = () => {
    setNotifications([]);
    localStorage.removeItem(STORAGE_KEY_NOTIFS);
  };

  return (
    <PlacementContext.Provider
      value={{
        notifications,
        markNotificationRead,
        markAllNotificationsRead,
        resetToDefaults,
      }}
    >
      {children}
    </PlacementContext.Provider>
  );
}

export function usePlacement() {
  const context = useContext(PlacementContext);
  if (context === undefined) {
    throw new Error("usePlacement must be used within a PlacementProvider");
  }
  return context;
}
