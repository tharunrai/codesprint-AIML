"use client";

import { useAuth } from "@/context/AuthContext";
import Sidebar from "@/components/layout/Sidebar";
import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      {/* Main content — offset by sidebar width. Uses peer selector for collapsed state. */}
      <main className="flex-1 ml-64 transition-all duration-300">
        {children}
      </main>
    </div>
  );
}
