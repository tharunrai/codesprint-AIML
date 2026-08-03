"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { usePlacement } from "@/context/PlacementContext";
import Header from "@/components/layout/Header";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import StageBadge from "@/components/ui/StageBadge";
import { type RoundResult } from "@/lib/mock-data";

export default function ApplicationsPage() {
  const { user } = useAuth();
  const { applications, drives } = usePlacement();
  const [selectedDriveId, setSelectedDriveId] = useState<string>("all");

  const isFaculty = user?.role === "faculty";

  // If student, filter applications belonging to this student (match email or studentId)
  const studentApplications = applications.filter((app) =>
    user
      ? app.email.toLowerCase() === user.email.toLowerCase() || app.studentId === user.id
      : true
  );

  const displayApplications = isFaculty
    ? selectedDriveId === "all"
      ? applications
      : applications.filter((a) => a.driveId === selectedDriveId)
    : studentApplications;

  return (
    <>
      <Header
        title={isFaculty ? "Applicant Pipeline Overview" : "My Applications"}
        subtitle={
          isFaculty
            ? `${applications.length} total applicant records across ${drives.length} drives`
            : `${studentApplications.length} active applications tracked in real-time`
        }
      />

      <div className="p-6 space-y-6 max-w-5xl">
        {/* Faculty Drive Selector */}
        {isFaculty && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-surface border border-border">
            <div>
              <span className="text-sm font-semibold text-foreground">Filter by Drive:</span>
              <p className="text-xs text-muted-foreground">Select a drive to inspect candidate pipeline progressions</p>
            </div>
            <select
              value={selectedDriveId}
              onChange={(e) => setSelectedDriveId(e.target.value)}
              className="h-10 px-3 rounded-lg text-sm bg-surface-hover border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer"
            >
              <option value="all">All Drives ({applications.length})</option>
              {drives.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.companyName} — {d.role}
                </option>
              ))}
            </select>
          </div>
        )}

        {displayApplications.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-surface-hover flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                <path d="M14 2v6h6" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-foreground">
              No applications found
            </h3>
            <p className="text-sm text-muted-foreground mt-1 mb-4">
              {isFaculty
                ? "No students have applied to this drive yet."
                : "Browse open drives and submit your first application!"}
            </p>
            <Link href="/drives">
              <Button>Browse Drives</Button>
            </Link>
          </div>
        ) : (
          displayApplications.map((app) => (
            <Link key={app.id} href={`/drives/${app.driveId}`}>
              <Card hover className="mb-4">
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center shrink-0">
                      <span className="text-primary font-bold">
                        {app.companyName.slice(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground">
                          {app.companyName}
                        </h3>
                        {isFaculty && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                            {app.studentName} ({app.rollNumber})
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {app.role}
                      </p>
                    </div>
                  </div>
                  <StageBadge stage={app.currentStage} />
                </div>

                {/* Round pipeline visualization */}
                <div className="flex items-center gap-1 overflow-x-auto pb-2">
                  {app.roundResults.map((round, idx) => (
                    <div key={idx} className="flex items-center">
                      <RoundPill round={round} />
                      {idx < app.roundResults.length - 1 && (
                        <div
                          className={`w-6 h-0.5 shrink-0 ${
                            round.status === "passed"
                              ? "bg-success"
                              : "bg-border"
                          }`}
                        />
                      )}
                    </div>
                  ))}
                </div>

                {/* Meta */}
                <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                  <span>
                    Applied{" "}
                    {new Date(app.appliedDate).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                  <span>•</span>
                  <span>
                    Last Updated{" "}
                    {new Date(app.lastUpdated).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                  {isFaculty && (
                    <>
                      <span>•</span>
                      <span className="text-primary font-medium">
                        Click to manage drive & rounds →
                      </span>
                    </>
                  )}
                </div>
              </Card>
            </Link>
          ))
        )}
      </div>
    </>
  );
}

/* ── Sub-components ────────────────────────────────────────── */

function RoundPill({ round }: { round: RoundResult }) {
  const styles = {
    passed: "bg-success/15 text-success border-success/30",
    failed: "bg-danger/15 text-danger border-danger/30",
    pending: "bg-warning/15 text-warning border-warning/30 animate-pulse",
    upcoming: "bg-surface-hover text-muted border-border",
  };

  return (
    <div
      className={`
        px-3 py-1.5 rounded-full text-[11px] font-semibold border whitespace-nowrap shrink-0
        ${styles[round.status]}
      `}
    >
      {round.roundName.length > 16
        ? round.roundName.slice(0, 14) + "…"
        : round.roundName}
    </div>
  );
}
