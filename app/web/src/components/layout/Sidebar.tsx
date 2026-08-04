"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Badge from "@/components/ui/Badge";
import { useState } from "react";

const studentNavItems = [
  { label: "Jobs & Internships", href: "/drives", icon: DrivesIcon },
  { label: "My Applications", href: "/applications", icon: ApplicationsIcon },
  { label: "Credentials", href: "/credentials", icon: DocumentsIcon },
  { label: "My Offers", href: "/offers", icon: OffersIcon },
  { label: "AI Assistant", href: "/ai-assistant", icon: AIIcon },
  { label: "Calendar", href: "/calendar", icon: CalendarIcon },
  { label: "Dashboard", href: "/dashboard", icon: DashboardIcon },
  { label: "Profile", href: "/profile", icon: ProfileIcon },
];

const facultyNavItems = [
  { label: "Dashboard", href: "/dashboard", icon: DashboardIcon },
  { label: "Manage Drives", href: "/drives", icon: DrivesIcon },
  { label: "Applications", href: "/applications", icon: ApplicationsIcon },
  { label: "Calendar", href: "/calendar", icon: CalendarIcon },
  { label: "Offers", href: "/faculty/offers", icon: OffersIcon },
  { label: "Analytics", href: "/analytics", icon: AnalyticsIcon },
  { label: "Documents", href: "/faculty/documents", icon: DocumentsIcon },
  { label: "AI Assistant", href: "/ai-assistant", icon: AIIcon },
];

export default function Sidebar() {
  const { user, role, logout } = useAuth();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const navItems = role === "FACULTY" ? facultyNavItems : studentNavItems;

  return (
    <aside
      className={`
        fixed top-0 left-0 h-screen z-40
        bg-sidebar-bg text-sidebar-fg
        flex flex-col
        transition-all duration-300 ease-out
        ${collapsed ? "w-[68px]" : "w-64"}
      `}
    >
      {/* Brand */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-white/10 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
          <span className="text-white font-bold text-sm">P</span>
        </div>
        {!collapsed && (
          <span className="font-bold text-lg tracking-tight whitespace-nowrap">
            PlaceMe
          </span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto text-sidebar-fg/60 hover:text-sidebar-fg transition-colors cursor-pointer"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`}
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                transition-all duration-150
                ${
                  isActive
                    ? "bg-sidebar-active text-white shadow-md shadow-sidebar-active/30"
                    : "text-sidebar-fg/70 hover:bg-sidebar-hover hover:text-sidebar-fg"
                }
              `}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="border-t border-white/10 p-3 shrink-0">
        {!collapsed && user && (
          <div className="mb-3 px-1">
            <p className="text-sm font-medium truncate">{user.fullName}</p>
            <p className="text-xs text-sidebar-fg/50 truncate">{user.email}</p>
            <Badge
              variant={role === "FACULTY" ? "warning" : "info"}
              size="sm"
              className="mt-1.5"
            >
              {role === "FACULTY" ? "Faculty / TPC" : "Student"}
            </Badge>
          </div>
        )}
        <button
          onClick={logout}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-sidebar-fg/60 hover:bg-sidebar-hover hover:text-sidebar-fg transition-colors cursor-pointer"
          title={collapsed ? "Sign out" : undefined}
        >
          <LogoutIcon className="w-4 h-4 shrink-0" />
          {!collapsed && <span>Sign out</span>}
        </button>
      </div>
    </aside>
  );
}

/* ── Inline Icons (simple SVGs to avoid extra deps) ────────── */

function DashboardIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

function DrivesIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
    </svg>
  );
}

function ApplicationsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <path d="M14 2v6h6" />
      <path d="M16 13H8" />
      <path d="M16 17H8" />
      <path d="M10 9H8" />
    </svg>
  );
}

function DocumentsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}

function ProfileIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function AnalyticsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  );
}

function LogoutIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function OffersIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
    </svg>
  );
}

function AIIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2l2.09 5.26L20 8.27l-4.08 3.97.96 5.63L12 15.4l-4.88 2.47.96-5.63L4 8.27l5.91-1.01L12 2z" />
    </svg>
  );
}

