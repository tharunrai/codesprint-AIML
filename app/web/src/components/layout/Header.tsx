"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { usePlacement } from "@/context/PlacementContext";
import { type Notification } from "@/lib/types";;
import Badge from "@/components/ui/Badge";

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
  const { user } = useAuth();
  const { notifications, markNotificationRead, markAllNotificationsRead } = usePlacement();
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border">
      <div className="flex items-center justify-between h-16 px-6">
        {/* Title area */}
        <div>
          <h1 className="text-lg font-semibold text-foreground">{title}</h1>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          {/* Theme toggle */}
          <button
            onClick={() => {
              const root = document.documentElement;
              const isDark = root.classList.contains("dark") || (!root.classList.contains("light") && window.matchMedia("(prefers-color-scheme: dark)").matches);
              if (isDark) {
                root.classList.remove("dark");
                root.classList.add("light");
              } else {
                root.classList.remove("light");
                root.classList.add("dark");
              }
            }}
            className="p-2 rounded-lg hover:bg-surface-hover transition-colors cursor-pointer text-muted-foreground"
            aria-label="Toggle theme"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          </button>

          {/* Notification bell */}
          <div ref={notifRef} className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg hover:bg-surface-hover transition-colors cursor-pointer"
              aria-label="Notifications"
            >
              <BellIcon className="w-5 h-5 text-muted-foreground" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-4.5 h-4.5 px-1 bg-danger text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification dropdown */}
            {showNotifications && (
              <div className="absolute right-0 top-full mt-2 w-84 bg-surface border border-border rounded-2xl shadow-xl overflow-hidden z-50 animate-fade-in">
                <div className="px-4 py-3 border-b border-border flex items-center justify-between bg-surface-hover/30">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">
                      Notifications
                    </span>
                    {unreadCount > 0 && (
                      <Badge variant="info" size="sm">
                        {unreadCount} new
                      </Badge>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={() => markAllNotificationsRead()}
                      className="text-xs text-primary hover:underline font-medium cursor-pointer"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-border">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-xs text-muted-foreground">
                      No notifications yet
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <NotificationItem
                        key={notif.id}
                        notification={notif}
                        onItemClick={() => {
                          markNotificationRead(notif.id);
                          setShowNotifications(false);
                        }}
                      />
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User avatar & role indicator */}
          {user && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-xs font-bold text-primary">
                  {(user.fullName || "User")
                    .split(" ")
                    .map((w: string) => w[0])
                    .join("")
                    .slice(0, 2)}
                </span>
              </div>
              <div className="hidden sm:block text-left">
                <span className="text-sm font-medium text-foreground block leading-tight">
                  {(user.fullName || "User").split(" ")[0]}
                </span>
                <span className="text-[10px] text-muted-foreground uppercase font-semibold">
                  {user.role}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

/* ── Notification item ─────────────────────────────────────── */

function NotificationItem({
  notification,
  onItemClick,
}: {
  notification: Notification;
  onItemClick: () => void;
}) {
  const typeVariant: Record<Notification["type"], "info" | "success" | "warning" | "danger"> = {
    info: "info",
    success: "success",
    warning: "warning",
    deadline: "danger",
  };

  const timeAgo = getTimeAgo(notification.timestamp);

  return (
    <Link
      href={notification.link || "#"}
      onClick={onItemClick}
      className={`
        block px-4 py-3 hover:bg-surface-hover transition-colors
        ${notification.read ? "opacity-60" : "bg-primary/5"}
      `}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5">
          <Badge variant={typeVariant[notification.type]} size="sm" dot>
            {notification.type}
          </Badge>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">
            {notification.title}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
            {notification.message}
          </p>
          <p className="text-[10px] text-muted mt-1">{timeAgo}</p>
        </div>
        {!notification.read && (
          <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />
        )}
      </div>
    </Link>
  );
}

/* ── Helpers ───────────────────────────────────────────────── */

function getTimeAgo(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${Math.max(1, mins)}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

/* ── Icons ─────────────────────────────────────────────────── */

function BellIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 01-3.46 0" />
    </svg>
  );
}
