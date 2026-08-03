"use client";

import { useAuth } from "@/context/AuthContext";
import { usePlacement } from "@/context/PlacementContext";
import Header from "@/components/layout/Header";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import {
  formatCTC,
  getStageLabel,
  deadlineCountdown,
  type ApplicationStage,
} from "@/lib/mock-data";
import Link from "next/link";

export default function DashboardPage() {
  const { user } = useAuth();
  const { drives, applications } = usePlacement();

  const isFaculty = user?.role === "faculty";

  // Student specific metrics (matching email or studentId)
  const myApplications = applications.filter((a) =>
    user
      ? a.email.toLowerCase() === user.email.toLowerCase() || a.studentId === user.id
      : false
  );

  const activeDrives = drives.filter((d) => d.status === "open").length;
  const appliedCount = isFaculty ? applications.length : myApplications.length;
  const shortlisted = (isFaculty ? applications : myApplications).filter(
    (a) => a.currentStage !== "applied" && a.currentStage !== "rejected"
  ).length;
  const offers = (isFaculty ? applications : myApplications).filter(
    (a) => a.currentStage === "offered"
  ).length;

  const recentDrives = drives.slice(0, 3);
  const recentApplications = (isFaculty ? applications : myApplications).slice(0, 4);

  return (
    <>
      <Header
        title={`Welcome back, ${user?.name?.split(" ")[0] || "User"}`}
        subtitle={
          isFaculty
            ? "TPC Placement Dashboard & Analytics Overview"
            : "Here's your live placement progress and upcoming milestones"
        }
      />

      <div className="p-6 space-y-6">
        {/* Stats row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label={isFaculty ? "Total Active Drives" : "Active Drives"}
            value={activeDrives}
            icon={
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="7" width="20" height="14" rx="2" />
                <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
              </svg>
            }
            color="primary"
          />
          <StatCard
            label={isFaculty ? "Total Applications" : "Applied"}
            value={appliedCount}
            icon={
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                <path d="M14 2v6h6" />
              </svg>
            }
            color="accent"
          />
          <StatCard
            label={isFaculty ? "In Progress / Shortlisted" : "Shortlisted"}
            value={shortlisted}
            icon={
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            }
            color="warning"
          />
          <StatCard
            label={isFaculty ? "Offers Released" : "Offers"}
            value={offers}
            icon={
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            }
            color="success"
          />
        </div>

        {/* Faculty Analytics Banner */}
        {isFaculty && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-gradient-to-r from-accent/10 via-primary/10 to-transparent border border-accent/20">
            <div>
              <h3 className="font-bold text-foreground text-sm">
                Recruitment Analytics & Insights
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Inspect branch-wise placement percentages, CTC distributions, and drive conversion funnels.
              </p>
            </div>
            <Link href="/analytics">
              <Button size="sm" variant="secondary">
                View Full Analytics →
              </Button>
            </Link>
          </div>
        )}

        {/* Recent Drives */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">
              {isFaculty ? "Recent Campus Drives" : "Recent Drives"}
            </h2>
            <Link href="/drives">
              <Button variant="ghost" size="sm">
                View all →
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentDrives.map((drive) => {
              const driveAppCount = applications.filter((a) => a.driveId === drive.id).length;
              return (
                <Link key={drive.id} href={`/drives/${drive.id}`}>
                  <Card hover className="h-full">
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="text-primary font-bold text-sm">
                          {drive.companyName.slice(0, 2).toUpperCase()}
                        </span>
                      </div>
                      <Badge
                        variant={drive.status === "open" ? "success" : "default"}
                        size="sm"
                        dot
                      >
                        {drive.status}
                      </Badge>
                    </div>
                    <h3 className="font-semibold text-foreground">
                      {drive.companyName}
                    </h3>
                    <p className="text-sm text-muted-foreground">{drive.role}</p>
                    <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                      <span className="font-semibold text-foreground">
                        {formatCTC(drive.ctcLakh)}
                      </span>
                      <span>•</span>
                      <span>{deadlineCountdown(drive.deadline)}</span>
                      <span>•</span>
                      <span>{driveAppCount} registered</span>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Recent Applications / Activity */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">
              {isFaculty ? "Recent Applicant Activity" : "Your Applications"}
            </h2>
            <Link href="/applications">
              <Button variant="ghost" size="sm">
                View all →
              </Button>
            </Link>
          </div>
          <Card padding="none">
            {recentApplications.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                No recent application activity.
              </div>
            ) : (
              <div className="divide-y divide-border">
                {recentApplications.map((app) => (
                  <Link
                    key={app.id}
                    href={`/drives/${app.driveId}`}
                    className="flex items-center justify-between px-6 py-4 hover:bg-surface-hover transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                        <span className="text-accent text-xs font-bold">
                          {app.companyName.slice(0, 2).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-foreground">
                            {app.companyName}
                          </p>
                          {isFaculty && (
                            <span className="text-xs text-muted-foreground">
                              ({app.studentName})
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {app.role}
                        </p>
                      </div>
                    </div>
                    <StageBadge stage={app.currentStage} />
                  </Link>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}

/* ── Sub-components ────────────────────────────────────────── */

function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: "primary" | "accent" | "warning" | "success";
}) {
  const bgClass = {
    primary: "bg-primary/10 text-primary",
    accent: "bg-accent/10 text-accent",
    warning: "bg-warning/10 text-warning",
    success: "bg-success/10 text-success",
  }[color];

  return (
    <Card>
      <div className="flex items-center gap-4">
        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${bgClass}`}
        >
          {icon}
        </div>
        <div>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </div>
    </Card>
  );
}

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
    <Badge variant={variant} size="sm" dot={stage !== "rejected"}>
      {getStageLabel(stage)}
    </Badge>
  );
}
