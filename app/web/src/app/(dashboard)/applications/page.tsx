"use client";

import Link from "next/link";
import Header from "@/components/layout/Header";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import {
  mockApplications,
  getStageLabel,
  type ApplicationStage,
  type RoundResult,
} from "@/lib/mock-data";

export default function ApplicationsPage() {
  return (
    <>
      <Header
        title="My Applications"
        subtitle={`${mockApplications.length} total applications`}
      />

      <div className="p-6 space-y-4 max-w-4xl">
        {mockApplications.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-surface-hover flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                <path d="M14 2v6h6" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-foreground">
              No applications yet
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Browse open drives and start applying!
            </p>
          </div>
        ) : (
          mockApplications.map((app) => (
            <Link key={app.id} href={`/drives/${app.driveId}`}>
              <Card hover className="mb-4">
                {/* Header row */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center shrink-0">
                      <span className="text-primary font-bold">
                        {app.companyName.slice(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">
                        {app.companyName}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {app.role}
                      </p>
                    </div>
                  </div>
                  <StageBadge stage={app.currentStage} />
                </div>

                {/* Round pipeline */}
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
                    Updated{" "}
                    {new Date(app.lastUpdated).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
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

function StageBadge({ stage }: { stage: ApplicationStage }) {
  const variant =
    stage === "offered"
      ? "success"
      : stage === "rejected"
        ? "danger"
        : stage === "applied"
          ? "default"
          : "info";
  return (
    <Badge variant={variant} dot={stage !== "rejected" && stage !== "offered"}>
      {getStageLabel(stage)}
    </Badge>
  );
}

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
