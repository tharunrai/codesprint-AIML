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
import { getDrives } from "@/app/actions/drives";
import { getApplications } from "@/app/actions/applications";
import { getAllCredentials, getStudentCredentials } from "@/app/actions/credentials";
import { getCalendarEvents } from "@/app/actions/calendar";
import { getOfferLetters } from "@/app/actions/offers";
import { useState, useEffect } from "react";

export default function DashboardPage() {
  const { user } = useAuth();
  
  const [drives, setDrives] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);
  const [offerLetters, setOfferLetters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const isFaculty = user?.role === "FACULTY";

  useEffect(() => {
    async function load() {
      try {
        const [_drives, _apps, _cal, _offers, _docs] = await Promise.all([
          getDrives(),
          getApplications(),
          getCalendarEvents(),
          getOfferLetters(),
          isFaculty ? getAllCredentials() : getStudentCredentials()
        ]);
        setDrives(_drives);
        setApplications(_apps);
        setCalendarEvents(_cal);
        setOfferLetters(_offers);
        setDocuments(_docs);
      } catch (e) {
        console.error("Dashboard data load error:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [isFaculty]);

  // Student documents metrics
  const myDocs = documents.filter((d) => user && d.studentId === user.id);
  const docVerifiedCount = myDocs.filter((d) => d.status === "verified").length;
  const docPendingCount = myDocs.filter((d) => d.status === "pending").length;
  const docRejectedCount = myDocs.filter((d) => d.status === "rejected").length;

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

  // Phase 5: Calendar & Offers Data
  const upcomingEvents = calendarEvents
    .filter((e) => (isFaculty ? true : e.targetRole !== "faculty"))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 2);

  const pendingOffersCount = isFaculty 
    ? offerLetters.filter((o) => o.status === "uploaded").length 
    : 0;

  const myOffers = offerLetters.filter((o) => user && o.studentId === user.id);

  return (
    <>
      <Header
        title={`Welcome back, ${user?.fullName?.split(" ")[0] || "User"}`}
        subtitle={
          isFaculty
            ? "TPC Placement Dashboard & Analytics Overview"
            : "Here's your live placement progress and upcoming milestones"
        }
      />

      <div className="p-6 space-y-6">
        {loading ? (
          <div className="flex justify-center p-12">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
        {/* Stats row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in">
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

        {/* Student Document Attestation Widget */}
        {!isFaculty && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-gradient-to-r from-primary/10 via-accent/5 to-transparent border border-border animate-fade-in">
            <div className="space-y-1">
              <h3 className="font-bold text-foreground text-sm">
                Document Attestation Status
              </h3>
              <p className="text-xs text-muted-foreground">
                Upload and track your credentials (Resume, Marksheet, Certificates) to remain placement-compliant.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="success" dot={docVerifiedCount > 0}>
                {docVerifiedCount} Verified
              </Badge>
              <Badge variant="warning" dot={docPendingCount > 0}>
                {docPendingCount} Pending
              </Badge>
              <Badge variant="danger" dot={docRejectedCount > 0}>
                {docRejectedCount} Rejected
              </Badge>
              <Link href="/documents" className="ml-2">
                <Button size="sm" variant="secondary">
                  Manage Documents →
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* AI Quick Actions (Student Only) */}
        {!isFaculty && (
          <Card className="bg-gradient-to-r from-primary/5 via-accent/5 to-transparent border-primary/15 animate-fade-in">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2l2.09 5.26L20 8.27l-4.08 3.97.96 5.63L12 15.4l-4.88 2.47.96-5.63L4 8.27l5.91-1.01L12 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-foreground text-sm">AI Placement Assistant</h3>
                  <p className="text-xs text-muted-foreground">Get AI-powered resume analysis, company research, and round-specific coaching.</p>
                </div>
              </div>
              <Link href="/ai-assistant">
                <Button size="sm">
                  Open AI Suite →
                </Button>
              </Link>
            </div>
          </Card>
        )}

        {/* Phase 5 Widgets */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-foreground text-sm">Upcoming Interviews & Events</h3>
                <Link href="/calendar">
                  <Button size="sm" variant="ghost">View Calendar →</Button>
                </Link>
              </div>
              {upcomingEvents.length > 0 ? (
                <div className="space-y-3">
                  {upcomingEvents.map((evt) => (
                    <div key={evt.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-surface-hover transition-colors">
                      <div className="w-10 h-10 rounded bg-background border border-border flex flex-col items-center justify-center shrink-0">
                        <span className="text-[9px] font-bold text-primary uppercase">{new Date(evt.date).toLocaleDateString("en-US", { month: "short" })}</span>
                        <span className="text-sm font-black leading-none">{new Date(evt.date).toLocaleDateString("en-US", { day: "numeric" })}</span>
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-foreground">{evt.title}</h4>
                        <p className="text-[10px] text-muted-foreground">{evt.company} • {evt.type.replace("-", " ")}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">No upcoming events.</p>
              )}
            </div>
          </Card>

          <Card className="flex flex-col justify-between bg-gradient-to-br from-surface to-accent/5">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-foreground text-sm">
                  {isFaculty ? "Pending Offer Reviews" : "My Latest Offers"}
                </h3>
                <Link href={isFaculty ? "/faculty/offers" : "/offers"}>
                  <Button size="sm" variant="ghost">Manage →</Button>
                </Link>
              </div>
              {isFaculty ? (
                <div className="py-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-warning/10 text-warning flex items-center justify-center">
                      <span className="text-xl font-bold">{pendingOffersCount}</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Action Required</p>
                      <p className="text-xs text-muted-foreground">Student offers waiting for your verification.</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 mt-4">
                  {myOffers.slice(0, 2).map((off) => (
                    <div key={off.id} className="flex items-center justify-between p-2 rounded-lg bg-background border border-border">
                      <div>
                        <h4 className="text-xs font-bold">{off.companyName}</h4>
                        <p className="text-[10px] text-muted-foreground">{formatCTC(off.packageLPA)} • {off.role}</p>
                      </div>
                      <Badge variant={off.status === "verified" || off.status === "accepted" ? "success" : off.status === "declined" ? "danger" : "warning"} size="sm" dot>
                        {off.status}
                      </Badge>
                    </div>
                  ))}
                  {myOffers.length === 0 && (
                    <p className="text-xs text-muted-foreground">No offers received yet.</p>
                  )}
                </div>
              )}
            </div>
          </Card>
        </div>

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
        </>
        )}
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
