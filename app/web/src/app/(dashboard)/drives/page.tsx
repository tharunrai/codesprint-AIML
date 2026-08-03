"use client";

import { useState, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import Header from "@/components/layout/Header";
import Input from "@/components/ui/Input";
import DriveCard from "@/components/drives/DriveCard";
import { mockDrives } from "@/lib/mock-data";

type SortOption = "deadline" | "ctc-high" | "ctc-low" | "company";
type StatusFilter = "all" | "open" | "ongoing" | "closed";

export default function DrivesPage() {
  const { user } = useAuth();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [eligibleOnly, setEligibleOnly] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>("deadline");

  const filtered = useMemo(() => {
    let drives = [...mockDrives];

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      drives = drives.filter(
        (d) =>
          d.companyName.toLowerCase().includes(q) ||
          d.role.toLowerCase().includes(q)
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      drives = drives.filter((d) => d.status === statusFilter);
    }

    // Eligible only
    if (eligibleOnly && user) {
      drives = drives.filter((d) => {
        return (
          user.cgpa >= d.eligibility.minCgpa &&
          d.eligibility.branches.includes(user.branch)
        );
      });
    }

    // Sort
    drives.sort((a, b) => {
      switch (sortBy) {
        case "deadline":
          return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        case "ctc-high":
          return b.ctcLakh - a.ctcLakh;
        case "ctc-low":
          return a.ctcLakh - b.ctcLakh;
        case "company":
          return a.companyName.localeCompare(b.companyName);
        default:
          return 0;
      }
    });

    return drives;
  }, [search, statusFilter, eligibleOnly, sortBy, user]);

  return (
    <>
      <Header
        title="Placement Drives"
        subtitle={`${mockDrives.filter((d) => d.status === "open").length} active drives`}
      />

      <div className="p-6 space-y-6">
        {/* Filters bar */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <Input
              placeholder="Search by company or role..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              }
            />
          </div>

          {/* Status pills */}
          <div className="flex gap-1 bg-surface-hover rounded-lg p-1">
            {(["all", "open", "ongoing", "closed"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`
                  px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150 capitalize cursor-pointer
                  ${
                    statusFilter === s
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }
                `}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="h-10 px-3 rounded-lg text-sm bg-surface border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer"
          >
            <option value="deadline">Sort: Deadline</option>
            <option value="ctc-high">Sort: CTC (High → Low)</option>
            <option value="ctc-low">Sort: CTC (Low → High)</option>
            <option value="company">Sort: Company A→Z</option>
          </select>
        </div>

        {/* Eligible toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setEligibleOnly(!eligibleOnly)}
            className={`
              relative w-9 h-5 rounded-full transition-colors duration-200 cursor-pointer
              ${eligibleOnly ? "bg-primary" : "bg-border"}
            `}
          >
            <span
              className={`
                absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200
                ${eligibleOnly ? "translate-x-4" : ""}
              `}
            />
          </button>
          <span className="text-sm text-muted-foreground">
            Show only eligible drives
          </span>
        </div>

        {/* Results count */}
        <p className="text-sm text-muted-foreground">
          Showing {filtered.length} drive{filtered.length !== 1 ? "s" : ""}
        </p>

        {/* Drive grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((drive) => (
              <DriveCard key={drive.id} drive={drive} currentUser={user} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-surface-hover flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-foreground">
              No drives found
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Try adjusting your search or filters
            </p>
          </div>
        )}
      </div>
    </>
  );
}
