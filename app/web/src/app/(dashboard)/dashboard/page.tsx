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
import { getCalendarEvents } from "@/app/actions/calendar";
import { useState, useEffect, useMemo } from "react";
import { getStageLabel, type ApplicationStage } from "@/lib/mock-data";

// ─── Urgency helpers ────────────────────────────────────────────────────────

const MS_48H = 48 * 60 * 60 * 1000;

function hoursUntil(dateStr: string) {
  return (new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60);
}

function fmtHours(h: number) {
  if (h < 1) return "< 1 hour";
  if (h < 24) return `${Math.round(h)} hours`;
  return `${Math.round(h / 24)} day${Math.round(h / 24) !== 1 ? "s" : ""}`;
}

type HeroMessage = {
  urgency: "critical" | "warning" | "info" | "default";
  icon: string;
  headline: string;
  sub: string;
  cta: { label: string; href: string };
  ctaSecondary?: { label: string; href: string };
};

// ─── Main page ──────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { user } = useAuth();
  const [drives, setDrives] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [credentials, setCredentials] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const isFaculty = user?.role === "FACULTY";

  useEffect(() => {
    async function load() {
      try {
        const [_drives, _apps, _creds, _events] = await Promise.all([
          getDrives(),
          getApplications(),
          isFaculty ? getAllCredentials() : getStudentCredentials(),
          getCalendarEvents(),
        ]);
        setDrives(_drives);
        setApplications(_apps);
        setCredentials(_creds);
        setEvents(_events);
      } catch (e) {
        console.error("Dashboard load error:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [isFaculty]);

  const myApplications = useMemo(
    () =>
      applications.filter((a) =>
        user
          ? a.email?.toLowerCase() === user.email?.toLowerCase() || a.studentId === user.id
          : false
      ),
    [applications, user]
  );

  const openDrives = drives.filter((d) => d.status === "open");
  const pendingCredentials = credentials.filter((c: any) => c.status === "PENDING" || c.status === "pending");
  const verifiedDocs = credentials.filter((c: any) => c.status === "VERIFIED" || c.status === "verified");
  const activeApps = (isFaculty ? applications : myApplications).filter(
    (a) => a.currentStage !== "rejected" && a.currentStage !== "withdrawn"
  );

  // ─── Build hero message ──────────────────────────────────────────────────

  const hero = useMemo<HeroMessage>(() => {
    if (isFaculty) {
      // Priority 1: pending credential verifications
      if (pendingCredentials.length > 0) {
        return {
          urgency: "warning",
          icon: "📋",
          headline: `${pendingCredentials.length} credential verification${pendingCredentials.length > 1 ? "s" : ""} pending your review`,
          sub: "Students cannot proceed without faculty attestation. Clear the queue to unblock applications.",
          cta: { label: "Open review queue →", href: "/faculty/documents" },
          ctaSecondary: { label: "Manage Drives", href: "/drives" },
        };
      }
      // Priority 2: drives closing within 48 h
      const closingSoon = drives.filter((d) => {
        const h = hoursUntil(d.deadline);
        return h > 0 && h <= 48;
      });
      if (closingSoon.length > 0) {
        const urgentApps = applications.filter((a) =>
          closingSoon.some((d) => d.id === a.driveId)
        );
        return {
          urgency: "critical",
          icon: "⏰",
          headline: `${closingSoon.length} drive${closingSoon.length > 1 ? "s" : ""} close within 48 hours — ${urgentApps.length} applications`,
          sub: closingSoon.map((d) => `${d.companyName} (${fmtHours(hoursUntil(d.deadline))})`).join(" · "),
          cta: { label: "View drives →", href: "/drives" },
          ctaSecondary: { label: "Pipeline overview", href: "/applications" },
        };
      }
      // Fallback
      const scheduledRounds = events.filter(e => e.type === "interview" || e.type === "assessment");
      return {
        urgency: "default",
        icon: "📊",
        headline: `This week: ${openDrives.length} active drive${openDrives.length !== 1 ? "s" : ""}, ${scheduledRounds.length} rounds scheduled`,
        sub: `${applications.length} total applicants across all drives.`,
        cta: { label: "Applicant pipeline →", href: "/applications" },
        ctaSecondary: { label: "Manage Drives", href: "/drives" },
      };
    }

    // ── Student hero ────────────────────────────────────────────────────────

    // Priority 1: interview within 48 h
    const imminent = myApplications.find((a) => {
      const nextRound = a.roundResults?.find((r: any) => r.status === "upcoming" && r.date);
      if (!nextRound) return false;
      const h = hoursUntil(nextRound.date);
      return h > 0 && h <= 48;
    });
    if (imminent) {
      const nextRound = imminent.roundResults.find((r: any) => r.status === "upcoming" && r.date);
      const hoursLeft = hoursUntil(nextRound.date);
      return {
        urgency: "critical",
        icon: "🎯",
        headline: `Your ${imminent.companyName} ${nextRound.roundName} is ${hoursLeft < 24 ? "tomorrow" : "in " + fmtHours(hoursLeft)}`,
        sub: imminent.role + " — prepare now to make the most of your slot.",
        cta: { label: "Open AI Prep Coach →", href: `/ai-assistant?company=${encodeURIComponent(imminent.companyName)}&role=${encodeURIComponent(imminent.role)}&round=${encodeURIComponent(nextRound.roundName)}` },
        ctaSecondary: { label: "View Application", href: `/drives/${imminent.driveId}` },
      };
    }

    // Priority 2: eligible drive deadline within 48 h, not yet applied
    const urgentDrive = openDrives.find((d) => {
      const h = hoursUntil(d.deadline);
      if (h <= 0 || h > 48) return false;
      const alreadyApplied = myApplications.some((a) => a.driveId === d.id);
      if (alreadyApplied) return false;
      // Check basic branch eligibility if we have it
      if (user && d.eligibility?.branches?.length > 0) {
        return d.eligibility.branches.includes((user as any).branch || "");
      }
      return true;
    });
    if (urgentDrive) {
      const h = hoursUntil(urgentDrive.deadline);
      return {
        urgency: "warning",
        icon: "⏰",
        headline: `${urgentDrive.companyName} applications close in ${fmtHours(h)} — you're eligible`,
        sub: `${urgentDrive.role} · ₹${urgentDrive.ctcLakh}L CTC · don't miss the window`,
        cta: { label: "View & Apply →", href: `/drives/${urgentDrive.id}` },
      };
    }

    // Priority 3: credential just verified (verified but uncelebrated)
    if (verifiedDocs.length > 0 && myApplications.length === 0) {
      return {
        urgency: "info",
        icon: "✅",
        headline: `${verifiedDocs.length} credential${verifiedDocs.length > 1 ? "s" : ""} verified — your profile is recruiter-ready`,
        sub: "Your documents passed attestation. Start applying to open drives now.",
        cta: { label: "Browse open drives →", href: "/drives" },
        ctaSecondary: { label: "View credentials", href: "/credentials" },
      };
    }

    // Fallback
    const eligibleCount = openDrives.filter((d) => {
      if (!user || !d.eligibility?.branches?.length) return true;
      return d.eligibility.branches.includes((user as any).branch || "");
    }).length;
    return {
      urgency: "default",
      icon: "🔍",
      headline: `${eligibleCount} drive${eligibleCount !== 1 ? "s" : ""} match your branch and CGPA this week`,
      sub: `${myApplications.length} active application${myApplications.length !== 1 ? "s" : ""} · ${pendingCredentials.length} document${pendingCredentials.length !== 1 ? "s" : ""} pending review`,
      cta: { label: "Browse drives →", href: "/drives" },
      ...(pendingCredentials.length > 0 ? { ctaSecondary: { label: "Upload documents", href: "/credentials" } } : {}),
    };
  }, [isFaculty, myApplications, drives, openDrives, applications, pendingCredentials, verifiedDocs, events, user]);

  // ─── One-line status sentence ─────────────────────────────────────────────

  const statusSentence = isFaculty
    ? `${applications.length} total applicants · ${openDrives.length} active drives · ${pendingCredentials.length} pending documents`
    : `${activeApps.length} active application${activeApps.length !== 1 ? "s" : ""} · ${myApplications.filter((a) => a.currentStage?.startsWith("round-")).length} interview${myApplications.filter((a) => a.currentStage?.startsWith("round-")).length !== 1 ? "s" : ""} this week · ${pendingCredentials.length} pending document${pendingCredentials.length !== 1 ? "s" : ""}`;

  // ─── This week events ──────────────────────────────────────────────────────

  const thisWeekEvents = useMemo(() => {
    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const driveDeadlines = openDrives
      .filter((d) => {
        const dl = new Date(d.deadline);
        return dl >= now && dl <= sevenDaysFromNow;
      })
      .map((d) => ({
        id: `drive-${d.id}`,
        title: `${d.companyName} deadline`,
        type: "offer-deadline" as const,
        date: d.deadline,
        company: d.companyName,
        href: `/drives/${d.id}`,
        urgency: hoursUntil(d.deadline) <= 24 ? "critical" : hoursUntil(d.deadline) <= 48 ? "warning" : "info",
      }));

    const calEvents = events
      .filter((e) => {
        const d = new Date(e.date);
        return d >= now && d <= sevenDaysFromNow;
      })
      .map((e) => ({
        id: e.id,
        title: e.title,
        type: e.type,
        date: e.date + (e.time ? `T${e.time}` : ""),
        company: e.company,
        href: "/calendar",
        urgency: "info" as const,
      }));

    return [...driveDeadlines, ...calEvents].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [openDrives, events]);

  // ─── Jobs for student / Drives needing attention for faculty ───────────────

  const spotlightDrives = useMemo(() => {
    if (isFaculty) {
      return openDrives
        .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
        .slice(0, 3);
    }
    return openDrives
      .filter((d) => !myApplications.some((a) => a.driveId === d.id))
      .slice(0, 3);
  }, [isFaculty, openDrives, myApplications]);

  return (
    <>
      <Header
        title={user?.fullName?.split(" ")[0] || "Dashboard"}
        subtitle={loading ? "Loading your dashboard..." : statusSentence}
      />

      <div className="p-6 space-y-8 max-w-5xl">
        {loading ? (
          <div className="flex justify-center p-20">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* ── Hero: urgent context ───────────────────────────────────── */}
            <HeroCard hero={hero} />

            {/* ── Pipeline Funnel ───────────────────────────────────────── */}
            <PipelineFunnel
              applications={isFaculty ? applications : myApplications}
              isFaculty={isFaculty}
            />

            {/* ── Two-column layout ─────────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left: Jobs for you / Drives needing attention */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                    {isFaculty ? "Drives needing attention" : "Jobs for you"}
                  </h3>
                  <Link href="/drives">
                    <Button variant="ghost" size="sm">All drives →</Button>
                  </Link>
                </div>
                {spotlightDrives.length === 0 ? (
                  <Card className="py-8 text-center text-sm text-muted-foreground">
                    No open drives right now.
                  </Card>
                ) : (
                  <Card padding="none">
                    <div className="divide-y divide-border">
                      {spotlightDrives.map((d) => {
                        const h = hoursUntil(d.deadline);
                        return (
                          <Link
                            key={d.id}
                            href={`/drives/${d.id}`}
                            className="flex items-center justify-between px-4 py-3.5 hover:bg-surface-hover transition-colors"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                <span className="text-primary text-xs font-bold">
                                  {d.companyName.slice(0, 2).toUpperCase()}
                                </span>
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-foreground truncate">{d.companyName}</p>
                                <p className="text-xs text-muted-foreground truncate">{d.role} · ₹{d.ctcLakh}L</p>
                              </div>
                            </div>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ml-2 ${h <= 24 ? "bg-danger/10 text-danger" : h <= 48 ? "bg-warning/10 text-warning" : "bg-surface-hover text-muted-foreground"}`}>
                              {fmtHours(h)}
                            </span>
                          </Link>
                        );
                      })}
                    </div>
                  </Card>
                )}
              </div>

              {/* Right: This Week */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                    This week
                  </h3>
                  <Link href="/calendar">
                    <Button variant="ghost" size="sm">Full calendar →</Button>
                  </Link>
                </div>
                {thisWeekEvents.length === 0 ? (
                  <Card className="py-8 text-center text-sm text-muted-foreground">
                    Nothing scheduled this week.
                  </Card>
                ) : (
                  <Card padding="none">
                    <div className="divide-y divide-border">
                      {thisWeekEvents.slice(0, 5).map((evt) => {
                        const evtDate = new Date(evt.date);
                        const isToday = new Date().toDateString() === evtDate.toDateString();
                        return (
                          <Link
                            key={evt.id}
                            href={evt.href}
                            className="flex items-start gap-3 px-4 py-3 hover:bg-surface-hover transition-colors"
                          >
                            <div className="flex flex-col items-center shrink-0 w-9 mt-0.5">
                              <span className="text-[10px] font-bold uppercase text-muted-foreground">
                                {evtDate.toLocaleDateString("en", { month: "short" })}
                              </span>
                              <span className={`text-lg font-bold leading-none ${isToday ? "text-primary" : "text-foreground"}`}>
                                {evtDate.getDate()}
                              </span>
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-foreground truncate">{evt.title}</p>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <EventTypeDot type={evt.type} />
                                <span className="text-xs text-muted-foreground capitalize">{evt.type.replace("-", " ")}</span>
                                {isToday && <span className="text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">TODAY</span>}
                              </div>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </Card>
                )}
              </div>
            </div>

            {/* ── Recent Applications ───────────────────────────────────── */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                  {isFaculty ? "Recent applicant activity" : "My applications"}
                </h3>
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
                    {activeApps.slice(0, 5).map((app) => (
                      <Link
                        key={app.id}
                        href={`/drives/${app.driveId}`}
                        className="flex items-center justify-between px-5 py-3.5 hover:bg-surface-hover transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <span className="text-primary text-xs font-bold">
                              {app.companyName?.slice(0, 2).toUpperCase()}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-foreground leading-tight truncate">
                              {app.companyName}
                              {isFaculty && (
                                <span className="ml-2 text-xs text-muted-foreground font-normal">({app.studentName})</span>
                              )}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">{app.role}</p>
                          </div>
                        </div>
                        <StagePill stage={app.currentStage} />
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

// ─── Hero Card ────────────────────────────────────────────────────────────────

function HeroCard({ hero }: { hero: HeroMessage }) {
  const borderColor = {
    critical: "border-danger/40 bg-danger/5",
    warning: "border-warning/40 bg-warning/5",
    info: "border-primary/30 bg-primary/5",
    default: "border-border bg-surface",
  }[hero.urgency];

  const accentColor = {
    critical: "text-danger",
    warning: "text-warning",
    info: "text-primary",
    default: "text-foreground",
  }[hero.urgency];

  return (
    <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl border animate-fade-in ${borderColor}`}>
      <div className="flex items-start gap-3 min-w-0">
        <span className="text-2xl shrink-0 mt-0.5">{hero.icon}</span>
        <div className="min-w-0">
          <h2 className={`text-base font-bold leading-snug ${accentColor}`}>{hero.headline}</h2>
          <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">{hero.sub}</p>
        </div>
      </div>
      <div className="flex gap-2 shrink-0">
        <Link href={hero.cta.href}>
          <Button size="sm">{hero.cta.label}</Button>
        </Link>
        {hero.ctaSecondary && (
          <Link href={hero.ctaSecondary.href}>
            <Button size="sm" variant="secondary">{hero.ctaSecondary.label}</Button>
          </Link>
        )}
      </div>
    </div>
  );
}

// ─── Pipeline Funnel ──────────────────────────────────────────────────────────

function PipelineFunnel({ applications, isFaculty }: { applications: any[]; isFaculty: boolean }) {
  const total = applications.length;

  const counts = {
    applied: applications.filter((a) => a.currentStage === "applied" || a.currentStage === "pending_review").length,
    shortlisted: applications.filter((a) => a.currentStage === "shortlisted").length,
    interviewing: applications.filter((a) => a.currentStage?.startsWith("round-")).length,
    offered: applications.filter((a) => a.currentStage === "offered").length,
  };

  const stages = [
    { label: "Applied", count: counts.applied, color: "bg-surface-hover text-foreground border-border" },
    { label: "Shortlisted", count: counts.shortlisted, color: "bg-info/20 text-info border-info/30" },
    { label: "Interview", count: counts.interviewing, color: "bg-warning/20 text-warning border-warning/30" },
    { label: "Offered", count: counts.offered, color: "bg-success/20 text-success border-success/30" },
  ];

  return (
    <div className="space-y-3 animate-fade-in">
      <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
        {isFaculty ? "Global Pipeline Conversion" : "My Placement Funnel"}
      </h3>
      {total === 0 ? (
        <Card className="py-6 text-center text-sm text-muted-foreground">
          No applications to track yet.
        </Card>
      ) : (
        <>
          <div className="flex h-12 rounded-xl overflow-hidden border border-border bg-surface">
            {stages.map((stage) => {
              if (stage.count === 0) return null;
              const width = (stage.count / total) * 100;
              return (
                <div
                  key={stage.label}
                  style={{ width: `${width}%` }}
                  className={`h-full flex flex-col items-center justify-center px-1 border-r last:border-r-0 transition-all hover:brightness-95 ${stage.color}`}
                  title={`${stage.label}: ${stage.count}`}
                >
                  <span className="font-bold text-base leading-none">{stage.count}</span>
                  {width > 15 && (
                    <span className="text-[9px] font-bold uppercase tracking-wider opacity-70 mt-0.5 truncate max-w-full px-1">
                      {stage.label}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
          {/* legend */}
          <div className="flex gap-4">
            {stages.map((s) => (
              <div key={s.label} className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${s.color.split(" ")[0]}`} />
                <span className="text-xs text-muted-foreground">{s.label} <span className="font-semibold text-foreground">{s.count}</span></span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

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
  return (
    <Badge variant={variantMap[stage] ?? "default"} size="sm" dot>
      {getStageLabel(stage)}
    </Badge>
  );
}

function EventTypeDot({ type }: { type: string }) {
  const colors: Record<string, string> = {
    interview: "bg-warning",
    assessment: "bg-info",
    "offer-deadline": "bg-danger",
    "campus-drive": "bg-success",
    "placement-event": "bg-primary",
  };
  return <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${colors[type] ?? "bg-muted"}`} />;
}
