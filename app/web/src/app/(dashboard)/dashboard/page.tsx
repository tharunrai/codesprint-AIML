"use client";

import { useAuth } from "@/context/AuthContext";
import Header from "@/components/layout/Header";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { getDrives } from "@/app/actions/drives";
import { getApplications } from "@/app/actions/applications";
import { getStudentCredentials, getAllCredentials } from "@/app/actions/credentials";
import { useState, useEffect } from "react";
import { getStageLabel, type ApplicationStage } from "@/lib/mock-data";

export default function DashboardPage() {
  const { user } = useAuth();
  const [drives, setDrives] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [credentials, setCredentials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const isFaculty = user?.role === "FACULTY";

  useEffect(() => {
    async function load() {
      try {
        const [_drives, _apps, _creds] = await Promise.all([
          getDrives(),
          getApplications(),
          isFaculty ? getAllCredentials() : getStudentCredentials(),
        ]);
        setDrives(_drives);
        setApplications(_apps);
        setCredentials(_creds);
      } catch (e) {
        console.error("Dashboard load error:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [isFaculty]);

  const myApplications = applications.filter((a) =>
    user
      ? a.email?.toLowerCase() === user.email?.toLowerCase() || a.studentId === user.id
      : false
  );

  const activeApps = (isFaculty ? applications : myApplications).filter(
    (a) => a.currentStage !== "rejected" && a.currentStage !== "withdrawn"
  );

  const openDrives = drives.filter((d) => d.status === "open");

  // Faculty-specific
  const pendingCredentials = credentials.filter((c: any) => c.status === "PENDING" || c.status === "pending");
  const totalApplicants = applications.length;

  // Student-specific
  const pendingDocs = credentials.filter((c: any) => c.status === "PENDING" || c.status === "pending");
  const verifiedDocs = credentials.filter((c: any) => c.status === "VERIFIED" || c.status === "verified");

  return (
    <>
      <Header
        title={`Welcome back, ${user?.fullName?.split(" ")[0] || "User"}`}
        subtitle={
          isFaculty
            ? `${totalApplicants} total applicants · ${openDrives.length} active drives · ${pendingCredentials.length} documents awaiting review`
            : `${activeApps.length} active application${activeApps.length !== 1 ? "s" : ""} · ${openDrives.length} open drive${openDrives.length !== 1 ? "s" : ""}`
        }
      />

      <div className="p-6 space-y-6 max-w-4xl">
        {loading ? (
          <div className="flex justify-center p-20">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Primary CTA */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-primary/10 via-accent/10 to-transparent border border-primary/20 animate-fade-in">
              {isFaculty ? (
                <>
                  <div>
                    <h2 className="text-base font-bold text-foreground">Placement Coordination</h2>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {pendingCredentials.length} credential{pendingCredentials.length !== 1 ? "s" : ""} waiting for your review and verification.
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Link href="/faculty/documents">
                      <Button size="sm">
                        Review Credentials →
                      </Button>
                    </Link>
                    <Link href="/drives">
                      <Button size="sm" variant="secondary">
                        Manage Drives
                      </Button>
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <h2 className="text-base font-bold text-foreground">
                      {openDrives.length} Open Drive{openDrives.length !== 1 ? "s" : ""} Available
                    </h2>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {verifiedDocs.length > 0
                        ? `${verifiedDocs.length} verified credential${verifiedDocs.length !== 1 ? "s" : ""} · ready to apply`
                        : "Verify your credentials to unlock applications"}
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Link href="/drives">
                      <Button size="sm">
                        Browse Jobs →
                      </Button>
                    </Link>
                    {pendingDocs.length > 0 && (
                      <Link href="/credentials">
                        <Button size="sm" variant="secondary">
                          {pendingDocs.length} Pending Doc{pendingDocs.length !== 1 ? "s" : ""}
                        </Button>
                      </Link>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Active Applications */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                  {isFaculty ? "Recent Applicant Activity" : "My Active Applications"}
                </h2>
                <Link href="/applications">
                  <Button variant="ghost" size="sm">View all →</Button>
                </Link>
              </div>

              <Card padding="none">
                {activeApps.length === 0 ? (
                  <div className="p-10 text-center">
                    <p className="text-sm text-muted-foreground">
                      {isFaculty ? "No applicant activity yet." : "No active applications — "}
                      {!isFaculty && (
                        <Link href="/drives" className="text-primary underline underline-offset-2">
                          browse open drives
                        </Link>
                      )}
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {activeApps.slice(0, 6).map((app) => (
                      <Link
                        key={app.id}
                        href={`/drives/${app.driveId}`}
                        className="flex items-center justify-between px-5 py-3.5 hover:bg-surface-hover transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <span className="text-primary text-xs font-bold">
                              {app.companyName?.slice(0, 2).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground leading-tight">
                              {app.companyName}
                              {isFaculty && (
                                <span className="ml-2 text-xs text-muted-foreground font-normal">
                                  ({app.studentName})
                                </span>
                              )}
                            </p>
                            <p className="text-xs text-muted-foreground">{app.role}</p>
                          </div>
                        </div>
                        <StagePill stage={app.currentStage} />
                      </Link>
                    ))}
                    {activeApps.length > 6 && (
                      <div className="px-5 py-3 text-xs text-muted-foreground text-center">
                        +{activeApps.length - 6} more ·{" "}
                        <Link href="/applications" className="text-primary underline underline-offset-2">
                          view all
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            </div>

            {/* Student: Credential status strip */}
            {!isFaculty && (
              <div className="grid grid-cols-3 gap-3 animate-fade-in">
                <MiniStat
                  label="Verified"
                  value={verifiedDocs.length}
                  color="success"
                />
                <MiniStat
                  label="Pending Review"
                  value={pendingDocs.length}
                  color="warning"
                />
                <MiniStat
                  label="Open Drives"
                  value={openDrives.length}
                  color="primary"
                />
              </div>
            )}

            {/* Faculty: quick numbers */}
            {isFaculty && (
              <div className="grid grid-cols-3 gap-3 animate-fade-in">
                <MiniStat label="Active Drives" value={openDrives.length} color="primary" />
                <MiniStat label="Total Applicants" value={totalApplicants} color="accent" />
                <MiniStat label="Docs Pending" value={pendingCredentials.length} color="warning" />
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}

function StagePill({ stage }: { stage: ApplicationStage }) {
  const variantMap: Record<string, "success" | "danger" | "warning" | "default" | "info"> = {
    offered: "success",
    rejected: "danger",
    applied: "default",
    pending_review: "warning",
    shortlisted: "info",
    "round-1": "info",
    "round-2": "info",
    "round-3": "info",
  };
  const variant = variantMap[stage] ?? "default";
  return (
    <Badge variant={variant} size="sm" dot>
      {getStageLabel(stage)}
    </Badge>
  );
}

function MiniStat({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: "primary" | "accent" | "warning" | "success";
}) {
  const colorMap = {
    primary: "text-primary bg-primary/10",
    accent: "text-accent bg-accent/10",
    warning: "text-warning bg-warning/10",
    success: "text-success bg-success/10",
  };
  return (
    <Card>
      <div className={`text-2xl font-bold ${colorMap[color].split(" ")[0]}`}>{value}</div>
      <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
    </Card>
  );
}
