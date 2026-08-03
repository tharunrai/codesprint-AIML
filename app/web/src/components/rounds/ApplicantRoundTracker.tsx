"use client";

import { useState, useMemo } from "react";
import { usePlacement } from "@/context/PlacementContext";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import {
  type Application,
  type ApplicationStage,
  type Drive,
  getStageLabel,
} from "@/lib/mock-data";

interface ApplicantRoundTrackerProps {
  drive: Drive;
}

const STAGES: { key: ApplicationStage | "all"; label: string }[] = [
  { key: "all", label: "All Applicants" },
  { key: "applied", label: "Applied" },
  { key: "shortlisted", label: "Shortlisted" },
  { key: "round-1", label: "Round 1" },
  { key: "round-2", label: "Round 2" },
  { key: "round-3", label: "Round 3" },
  { key: "offered", label: "Offered" },
  { key: "rejected", label: "Rejected" },
];

export default function ApplicantRoundTracker({ drive }: ApplicantRoundTrackerProps) {
  const { applications, updateApplicationStage, bulkUpdateStage } = usePlacement();

  const [activeStage, setActiveStage] = useState<ApplicationStage | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBranch, setSelectedBranch] = useState<string>("all");
  const [selectedAppIds, setSelectedAppIds] = useState<string[]>([]);
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);

  // Filter applications belonging to this drive
  const driveApplications = useMemo(() => {
    return applications.filter((app) => app.driveId === drive.id);
  }, [applications, drive.id]);

  // Filter by stage, branch, and search
  const filteredApplicants = useMemo(() => {
    return driveApplications.filter((app) => {
      // Stage filter
      if (activeStage !== "all" && app.currentStage !== activeStage) return false;

      // Branch filter
      if (selectedBranch !== "all" && app.branch !== selectedBranch) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = app.studentName.toLowerCase().includes(q);
        const matchRoll = app.rollNumber.toLowerCase().includes(q);
        const matchEmail = app.email.toLowerCase().includes(q);
        if (!matchName && !matchRoll && !matchEmail) return false;
      }

      return true;
    });
  }, [driveApplications, activeStage, selectedBranch, searchQuery]);

  // Calculate counts per stage
  const stageCounts = useMemo(() => {
    const counts: Record<string, number> = { all: driveApplications.length };
    STAGES.forEach((s) => {
      if (s.key !== "all") {
        counts[s.key] = driveApplications.filter((a) => a.currentStage === s.key).length;
      }
    });
    return counts;
  }, [driveApplications]);

  // Bulk Selection Handlers
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedAppIds(filteredApplicants.map((a) => a.id));
    } else {
      setSelectedAppIds([]);
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedAppIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleBulkStageChange = (targetStage: ApplicationStage) => {
    if (selectedAppIds.length === 0) return;
    bulkUpdateStage(selectedAppIds, targetStage);
    setSelectedAppIds([]);
    setShowRejectConfirm(false);
  };

  const handleIndividualStageChange = (appId: string, newStage: ApplicationStage) => {
    updateApplicationStage(appId, newStage);
  };

  const isAllSelected =
    filteredApplicants.length > 0 &&
    filteredApplicants.every((a) => selectedAppIds.includes(a.id));

  return (
    <div className="space-y-6">
      {/* Overview Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        <StatPill label="Total Applied" count={driveApplications.length} variant="default" />
        <StatPill label="Shortlisted" count={stageCounts["shortlisted"] || 0} variant="info" />
        <StatPill label="Round 1" count={stageCounts["round-1"] || 0} variant="warning" />
        <StatPill label="Round 2" count={stageCounts["round-2"] || 0} variant="warning" />
        <StatPill label="Offered" count={stageCounts["offered"] || 0} variant="success" />
        <StatPill label="Rejected" count={stageCounts["rejected"] || 0} variant="danger" />
      </div>

      {/* Filter and Search Bar */}
      <Card padding="sm">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="flex-1 max-w-md">
            <Input
              placeholder="Search by student name or roll number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              }
            />
          </div>

          <div className="flex items-center gap-3">
            {/* Branch Filter */}
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="h-10 px-3 rounded-lg text-sm bg-surface border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer"
            >
              <option value="all">All Branches</option>
              {drive.eligibility.branches.map((b) => (
                <option key={b} value={b}>
                  Branch: {b}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Stage Filter Tabs */}
        <div className="flex gap-1 overflow-x-auto pt-3 border-t border-border mt-3 pb-1">
          {STAGES.map((s) => {
            const count = stageCounts[s.key] || 0;
            const active = activeStage === s.key;
            return (
              <button
                key={s.key}
                onClick={() => {
                  setActiveStage(s.key);
                  setSelectedAppIds([]);
                }}
                className={`
                  px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer
                  ${
                    active
                      ? "bg-primary text-white shadow-sm font-semibold"
                      : "text-muted-foreground hover:bg-surface-hover hover:text-foreground"
                  }
                `}
              >
                <span>{s.label}</span>
                <span
                  className={`
                    px-1.5 py-0.2 rounded-full text-[10px] font-bold
                    ${active ? "bg-white/20 text-white" : "bg-surface-hover text-muted"}
                  `}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Floating / Sticky Bulk Action Bar */}
      {selectedAppIds.length > 0 && (
        <div className="sticky top-20 z-20 bg-foreground text-background dark:bg-surface dark:text-foreground p-3 rounded-2xl shadow-xl border border-border flex flex-wrap items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center">
              {selectedAppIds.length}
            </span>
            <span className="text-sm font-medium">students selected</span>
          </div>

          {/* Bulk Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {showRejectConfirm ? (
              <div className="flex items-center gap-2 bg-danger/20 border border-danger/40 px-3 py-1 rounded-xl animate-fade-in">
                <span className="text-xs text-danger font-medium">
                  Reject {selectedAppIds.length} student{selectedAppIds.length > 1 ? "s" : ""}?
                </span>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => handleBulkStageChange("rejected")}
                >
                  Confirm Reject
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowRejectConfirm(false)}
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleBulkStageChange("shortlisted")}
                >
                  Shortlist
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleBulkStageChange("round-1")}
                >
                  Move to R1
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleBulkStageChange("round-2")}
                >
                  Move to R2
                </Button>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => handleBulkStageChange("offered")}
                >
                  Extend Offer
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => setShowRejectConfirm(true)}
                >
                  Reject
                </Button>
              </>
            )}

            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setSelectedAppIds([]);
                setShowRejectConfirm(false);
              }}
            >
              Clear
            </Button>
          </div>
        </div>
      )}

      {/* Applicants Table */}
      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-surface-hover/60 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <th className="py-3.5 px-4 w-10">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded border-border text-primary focus:ring-primary/40 cursor-pointer"
                  />
                </th>
                <th className="py-3.5 px-4">Student</th>
                <th className="py-3.5 px-4">Branch & CGPA</th>
                <th className="py-3.5 px-4">Current Stage</th>
                <th className="py-3.5 px-4">Applied Date</th>
                <th className="py-3.5 px-4 text-right">Update Stage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-sm">
              {filteredApplicants.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted-foreground">
                    No applicants found matching this stage or search query.
                  </td>
                </tr>
              ) : (
                filteredApplicants.map((app) => {
                  const isSelected = selectedAppIds.includes(app.id);
                  return (
                    <tr
                      key={app.id}
                      className={`hover:bg-surface-hover/80 transition-colors ${
                        isSelected ? "bg-primary/5" : ""
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3.5 px-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectOne(app.id)}
                          className="w-4 h-4 rounded border-border text-primary focus:ring-primary/40 cursor-pointer"
                        />
                      </td>

                      {/* Student Info */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center shrink-0">
                            <span className="text-xs font-bold text-primary">
                              {app.studentName
                                .split(" ")
                                .map((w) => w[0])
                                .join("")
                                .slice(0, 2)}
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">{app.studentName}</p>
                            <p className="text-xs text-muted-foreground">{app.rollNumber}</p>
                          </div>
                        </div>
                      </td>

                      {/* Branch & CGPA */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-surface border border-border text-foreground">
                            {app.branch}
                          </span>
                          <p className="text-xs text-muted-foreground">CGPA: {app.cgpa}</p>
                        </div>
                      </td>

                      {/* Current Stage */}
                      <td className="py-3.5 px-4">
                        <StageStatusBadge stage={app.currentStage} />
                      </td>

                      {/* Applied Date */}
                      <td className="py-3.5 px-4 text-xs text-muted-foreground">
                        {new Date(app.appliedDate).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                        })}
                      </td>

                      {/* Action Dropdown */}
                      <td className="py-3.5 px-4 text-right">
                        <select
                          value={app.currentStage}
                          onChange={(e) =>
                            handleIndividualStageChange(
                              app.id,
                              e.target.value as ApplicationStage
                            )
                          }
                          className="h-8 px-2.5 rounded-lg text-xs font-medium bg-surface border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer"
                        >
                          <option value="applied">Applied</option>
                          <option value="shortlisted">Shortlisted</option>
                          <option value="round-1">Round 1 (OA)</option>
                          <option value="round-2">Round 2 (Tech)</option>
                          <option value="round-3">Round 3 (HR)</option>
                          <option value="offered">Offer Extended</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

/* ── Mini Sub-components ────────────────────────────────────── */

function StatPill({
  label,
  count,
  variant,
}: {
  label: string;
  count: number;
  variant: "default" | "info" | "warning" | "success" | "danger";
}) {
  return (
    <Card padding="sm" className="flex items-center justify-between">
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-xl font-bold text-foreground mt-0.5">{count}</p>
      </div>
      <Badge variant={variant} size="sm" dot>
        {label.slice(0, 3)}
      </Badge>
    </Card>
  );
}

function StageStatusBadge({ stage }: { stage: ApplicationStage }) {
  const variant =
    stage === "offered"
      ? "success"
      : stage === "rejected"
        ? "danger"
        : stage === "applied"
          ? "default"
          : stage === "shortlisted"
            ? "info"
            : "warning";

  return (
    <Badge variant={variant} dot={stage !== "rejected" && stage !== "offered"}>
      {getStageLabel(stage)}
    </Badge>
  );
}
