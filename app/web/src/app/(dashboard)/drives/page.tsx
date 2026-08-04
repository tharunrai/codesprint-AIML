"use client";

import { useState, useMemo, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { getDrives } from "@/app/actions/drives";
import Header from "@/components/layout/Header";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import DriveCard from "@/components/drives/DriveCard";
import CreateDriveModal from "@/components/drives/CreateDriveModal";

type SortOption = "deadline" | "ctc-high" | "ctc-low" | "company";
type StatusFilter = "all" | "open" | "ongoing" | "closed";

export default function DrivesPage() {
  const { user } = useAuth();
  const [drives, setDrives] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [eligibleOnly, setEligibleOnly] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>("deadline");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  useEffect(() => {
    async function load() {
      try {
        const data = await getDrives();
        setDrives(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const isFaculty = user?.role === "FACULTY";

  const filtered = useMemo(() => {
    let list = [...drives];

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (d) =>
          d.companyName.toLowerCase().includes(q) ||
          d.role.toLowerCase().includes(q)
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      list = list.filter((d) => d.status === statusFilter);
    }

    // Eligible only (for students)
    if (eligibleOnly && user && !isFaculty) {
      list = list.filter((d) => {
        const userAny = user as any;
        return (
          userAny.cgpa >= d.eligibility.minCgpa &&
          d.eligibility.branches.includes(userAny.branch)
        );
      });
    }

    // Sort
    list.sort((a, b) => {
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

    return list;
  }, [search, statusFilter, eligibleOnly, sortBy, user, isFaculty, drives]);

  return (
    <>
      <Header
        title={isFaculty ? "Placement Drives Management" : "Placement Drives"}
        subtitle={
          isFaculty
            ? "Manage hiring drives, update round stages, and track applicant pipelines"
            : `${drives.filter((d) => d.status === "open").length} active drives open for application`
        }
      />

      <div className="p-6 space-y-6">
        {/* Faculty Banner / Quick Action */}
        {loading ? (
          <div className="flex justify-center p-12">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
        {isFaculty && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-gradient-to-r from-primary/10 via-accent/10 to-transparent border border-primary/20">
            <div>
              <h2 className="text-base font-bold text-foreground">
                TPC Admin Controls
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Create new campus drives, close expired registrations, and advance student round stages.
              </p>
            </div>
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              icon={
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              }
            >
              Post New Drive
            </Button>
          </div>
        )}

        {/* Filters bar */}
        <div className="flex flex-col sm:flex-row gap-4 animate-fade-in stagger-1">
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

        {/* Eligible toggle (student only) */}
        {!isFaculty && (
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
        )}

        {/* Results count */}
        <p className="text-sm text-muted-foreground">
          Showing {filtered.length} drive{filtered.length !== 1 ? "s" : ""}
        </p>

        {/* Drive grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 animate-fade-in stagger-2">
            {filtered.map((drive) => (
              <DriveCard
                key={drive.id}
                drive={drive}
                currentUser={user as any}
                onToggleStatus={(driveId, newStatus) => { /* TODO: server action */ }}
              />
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
        </>)}
      </div>

      {/* Create Drive Modal */}
      {isCreateModalOpen && (
        <CreateDriveModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={(newDrive) => { /* TODO: server action for create drive */ }}
        />
      )}
    </>
  );
}
