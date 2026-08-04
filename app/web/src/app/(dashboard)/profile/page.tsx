"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import Header from "@/components/layout/Header";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileSection from "@/components/profile/ProfileSection";
import SocialLinksCard from "@/components/profile/SocialLinksCard";
import EditProfileModal, { ProfileExtras } from "@/components/profile/EditProfileModal";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Link from "next/link";
import {
  FileText,
  Award,
  Shield,
  Star,
  Calendar,
  Brain,
  Briefcase,
  GraduationCap,
  BookOpen,
  Code2,
  FileCheck,
  CheckCircle2,
  Clock,
  ExternalLink,
  ChevronRight,
} from "lucide-react";

import { getApplications } from "@/app/actions/applications";
import { getStudentOffers } from "@/app/actions/offers";
import { getStudentCredentials } from "@/app/actions/credentials";
import { getCalendarEvents } from "@/app/actions/calendar";
import { getDrives } from "@/app/actions/drives";

export default function ProfilePage() {
  const { user, logout } = useAuth();

  const [loading, setLoading] = useState(true);
  const [extras, setExtras] = useState<ProfileExtras>({});
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [applications, setApplications] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [offers, setOffers] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [documents, setDocuments] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [drives, setDrives] = useState<any[]>([]);

  useEffect(() => {
    // Load local storage extras
    try {
      const stored = localStorage.getItem("placeme_profile_extras");
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (stored) setExtras(JSON.parse(stored));
    } catch {}

    async function loadData() {
      try {
        const [apps, offs, docs, evts, drvs] = await Promise.all([
          getApplications(),
          user ? getStudentOffers(user.id) : Promise.resolve([]),
          getStudentCredentials(),
          getCalendarEvents(),
          getDrives(),
        ]);
        setApplications(apps);
        setOffers(offs);
        setDocuments(docs);
        setCalendarEvents(evts);
        setDrives(drvs);
      } catch (e) {
        console.error("Failed to load profile data:", e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSaveExtras = (newExtras: ProfileExtras) => {
    setExtras(newExtras);
    try {
      localStorage.setItem("placeme_profile_extras", JSON.stringify(newExtras));
    } catch {}
  };

  if (!user) return null;

  // Student specific filtering matching Dashboard
  const myApplications = applications.filter(
    (a) => a.email.toLowerCase() === user.email.toLowerCase() || a.studentId === user.id
  );
  const myOffers = offers.filter((o) => o.studentId === user.id);
  const myDocs = documents;

  // Stats (exact match with Dashboard calculations)
  const appliedCount = myApplications.length;
  const shortlistedCount = myApplications.filter(
    (a) => a.currentStage !== "applied" && a.currentStage !== "rejected"
  ).length;
  const offersReceived = myOffers.length;
  const verifiedDocs = myDocs.filter((d) => d.status.toLowerCase() === "verified").length;
  const pendingDocs = myDocs.filter((d) => d.status.toLowerCase() === "pending").length;

  const upcomingEvents = calendarEvents
    .filter((e) => e.targetRole !== "faculty")
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);

  // Deriving student information
  const studentApp = myApplications.length > 0 ? myApplications[0] : null;
  const cgpa = studentApp ? studentApp.cgpa : 8.5;
  const rollNumber = studentApp ? studentApp.rollNumber : "21CS048";
  const branch = studentApp ? studentApp.branch : "Computer Science & Engineering";

  const backlogs = extras.backlogs !== undefined ? extras.backlogs : 0;
  const isEligible = cgpa >= 6.0 && backlogs === 0;

  // Skills parsing
  const defaultSkills = ["React", "TypeScript", "Node.js", "Python", "PostgreSQL", "Tailwind CSS"];
  const skillsList = extras.skills
    ? extras.skills.split(",").map((s) => s.trim()).filter(Boolean)
    : defaultSkills;

  return (
    <>
      <Header
        title="Student Profile"
        subtitle="Manage your personal details, academic records, and career tracking summary"
      />

      <div className="p-6 space-y-6 max-w-5xl">
        <ProfileHeader
          name={user.fullName}
          email={user.email}
          roleBadgeText="Student"
          isFaculty={false}
          onEdit={() => setIsEditModalOpen(true)}
          onLogout={logout}
        />

        {loading ? (
          <div className="flex justify-center p-12">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left Column - Details */}
            <div className="md:col-span-1 space-y-6">
              {/* 1. Personal Information */}
              <ProfileSection title="Personal Information" icon={<BookOpen className="w-4 h-4 text-primary" />}>
                <div className="space-y-3">
                  <InfoRow label="Roll No / USN" value={rollNumber} />
                  <InfoRow label="Branch" value={branch} />
                  <InfoRow label="Section" value={extras.section || "A"} />
                  <InfoRow label="Semester" value={extras.semester ? `Sem ${extras.semester}` : "Sem 8"} />
                  <InfoRow label="Phone" value={extras.phone || "+91 98765 43210"} />
                  <InfoRow
                    label="Batch"
                    value="2022 - 2026"
                  />
                  <InfoRow
                    label="Registered"
                    value={new Date(user.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  />
                </div>
              </ProfileSection>

              {/* 2. Academic Record */}
              <ProfileSection title="Academic Record" icon={<GraduationCap className="w-4 h-4 text-accent" />}>
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-white/5">
                    <span className="text-sm text-muted-foreground">Current CGPA</span>
                    <span className="text-lg font-bold text-foreground">{cgpa.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-white/5">
                    <span className="text-sm text-muted-foreground">Active Backlogs</span>
                    <span className={`text-md font-semibold ${backlogs > 0 ? "text-rose-500" : "text-emerald-500"}`}>
                      {backlogs}
                    </span>
                  </div>
                  <div className="pb-3 border-b border-white/5">
                    <span className="text-sm text-muted-foreground block mb-2">Drive Eligibility</span>
                    <Badge variant={isEligible ? "success" : "warning"}>
                      {isEligible ? "Eligible for All Drives" : "Conditional Eligibility"}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                      <Code2 className="w-3.5 h-3.5" /> Technical Skills
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {skillsList.map((skill, idx) => (
                        <Badge key={idx} variant="default" size="sm" className="bg-sidebar-bg border border-white/10 text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </ProfileSection>

              {/* 7. Social & Professional Links */}
              <SocialLinksCard
                github={extras.github}
                linkedin={extras.linkedin}
                portfolio={extras.portfolio}
                onEdit={() => setIsEditModalOpen(true)}
              />
            </div>

            {/* Right Column - Stats, Summaries & Placeholder Cards */}
            <div className="md:col-span-2 space-y-6">
              {/* 3. Placement Summary */}
              <ProfileSection title="Placement Summary" icon={<Briefcase className="w-4 h-4 text-primary" />}>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <StatCard icon={<FileText />} label="Applied" value={appliedCount} color="primary" />
                  <StatCard icon={<Star />} label="Shortlisted" value={shortlistedCount} color="accent" />
                  <StatCard icon={<Award />} label="Offers" value={offersReceived} color="success" />
                  <StatCard icon={<Shield />} label="Verified Docs" value={verifiedDocs} color="warning" />
                </div>
              </ProfileSection>

              {/* 4. Document Verification Summary (Phase 4 Integration) */}
              <ProfileSection
                title="Credential & Document Vault (Phase 4)"
                icon={<FileCheck className="w-4 h-4 text-emerald-500" />}
                action={
                  <Link href="/credentials" className="text-xs text-primary hover:underline flex items-center gap-1">
                    Manage Vault <ChevronRight className="w-3 h-3" />
                  </Link>
                }
              >
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 rounded-lg bg-sidebar-bg border border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span className="text-sm font-medium">Verified</span>
                    </div>
                    <span className="text-sm font-bold text-emerald-500">{verifiedDocs}</span>
                  </div>
                  <div className="p-3 rounded-lg bg-sidebar-bg border border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Clock className="w-4 h-4 text-amber-500" />
                      <span className="text-sm font-medium">Pending</span>
                    </div>
                    <span className="text-sm font-bold text-amber-500">{pendingDocs}</span>
                  </div>
                  <div className="p-3 rounded-lg bg-sidebar-bg border border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <FileText className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium">Total Docs</span>
                    </div>
                    <span className="text-sm font-bold text-foreground">{myDocs.length}</span>
                  </div>
                </div>
              </ProfileSection>

              {/* 8. Placeholder Cards for Blockchain & AI */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Blockchain Credential Verification */}
                <Card className="flex flex-col h-full bg-gradient-to-br from-sidebar-bg to-sidebar-bg/50 border-primary/20 hover:border-primary/40 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                      <Shield className="w-5 h-5 text-primary" />
                    </div>
                    <Badge variant="info" size="sm">
                      Coming Soon
                    </Badge>
                  </div>
                  <h3 className="text-lg font-bold mt-2">Blockchain Credential Verification</h3>
                  <p className="text-sm text-muted-foreground mt-1.5 flex-1">
                    On-chain tamper-proof verification and cryptographic attestations for college certificates.
                  </p>
                  <Link href="/credentials" className="mt-4">
                    <Button variant="secondary" className="w-full text-primary hover:bg-primary/10" size="sm">
                      View Documents Vault <ExternalLink className="w-3.5 h-3.5 ml-2" />
                    </Button>
                  </Link>
                </Card>

                {/* AI Career Assistant */}
                <Card className="flex flex-col h-full bg-gradient-to-br from-sidebar-bg to-sidebar-bg/50 border-accent/20 hover:border-accent/40 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                      <Brain className="w-5 h-5 text-accent" />
                    </div>
                    <Badge variant="success" size="sm">
                      Available
                    </Badge>
                  </div>
                  <h3 className="text-lg font-bold mt-2">AI Career Assistant</h3>
                  <p className="text-sm text-muted-foreground mt-1.5 flex-1">
                    ATS Resume Score, Company Intelligence, and Round-wise Interview Coach.
                  </p>
                  <Link href="/ai-assistant" className="mt-4">
                    <Button variant="secondary" className="w-full text-accent hover:bg-accent/10" size="sm">
                      Open AI Assistant <ExternalLink className="w-3.5 h-3.5 ml-2" />
                    </Button>
                  </Link>
                </Card>
              </div>

              {/* 5 & 6. Offer Summary & Upcoming Events (Phase 5) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* 5. Offer Summary */}
                <ProfileSection
                  title="Offer Summary (Phase 5)"
                  icon={<Award className="w-4 h-4 text-emerald-500" />}
                  action={
                    <Link href="/offers" className="text-xs text-primary hover:underline flex items-center gap-1">
                      All Offers <ChevronRight className="w-3 h-3" />
                    </Link>
                  }
                >
                  {myOffers.length > 0 ? (
                    <div className="space-y-3">
                      {myOffers.map((offer) => (
                        <div
                          key={offer.id}
                          className="flex justify-between items-center p-3 rounded-lg bg-sidebar-bg border border-white/5"
                        >
                          <div>
                            <p className="text-sm font-semibold">{offer.companyName}</p>
                            <p className="text-xs text-muted-foreground">{offer.role}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-emerald-500">₹{offer.packageLPA} LPA</p>
                            <Badge
                              variant={offer.status === "accepted" ? "success" : "info"}
                              size="sm"
                              className="mt-1"
                            >
                              {offer.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-sm text-muted-foreground">No offers received yet.</p>
                      <Link href="/drives">
                        <Button variant="secondary" size="sm" className="mt-3">
                          Explore Open Drives
                        </Button>
                      </Link>
                    </div>
                  )}
                </ProfileSection>

                {/* 6. Upcoming Events */}
                <ProfileSection
                  title="Upcoming Events (Calendar)"
                  icon={<Calendar className="w-4 h-4 text-primary" />}
                  action={
                    <Link href="/calendar" className="text-xs text-primary hover:underline flex items-center gap-1">
                      Calendar <ChevronRight className="w-3 h-3" />
                    </Link>
                  }
                >
                  {upcomingEvents.length > 0 ? (
                    <div className="space-y-3">
                      {upcomingEvents.map((event) => (
                        <div
                          key={event.id}
                          className="p-3 rounded-lg bg-sidebar-bg border border-white/5"
                        >
                          <div className="flex justify-between items-start">
                            <p className="text-sm font-semibold">{event.title}</p>
                            <Badge variant="default" size="sm" className="text-xs">
                              {event.type}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(event.date).toLocaleDateString("en-IN", {
                              month: "short",
                              day: "numeric",
                            })}{" "}
                            at {event.time} • {event.location}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground py-6 text-center">No upcoming events scheduled.</p>
                  )}
                </ProfileSection>
              </div>
            </div>
          </div>
        )}
      </div>

      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        initialData={extras}
        onSave={handleSaveExtras}
        isFaculty={false}
      />
    </>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between items-start py-1">
      <span className="text-sm text-muted-foreground font-medium">{label}</span>
      <span
        className="text-sm font-semibold text-right max-w-[60%] truncate"
        title={typeof value === "string" ? value : undefined}
      >
        {value}
      </span>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: "primary" | "accent" | "success" | "warning";
}) {
  const colorStyles = {
    primary: "text-primary bg-primary/10 border-primary/20",
    accent: "text-accent bg-accent/10 border-accent/20",
    success: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    warning: "text-amber-500 bg-amber-500/10 border-amber-500/20",
  };

  return (
    <div className={`p-4 rounded-xl border flex flex-col items-center justify-center text-center ${colorStyles[color]}`}>
      <div className="mb-2 opacity-80 *:w-6 *:h-6">{icon}</div>
      <div className="text-2xl font-black mb-1">{value}</div>
      <div className="text-xs font-medium uppercase tracking-wider opacity-80">{label}</div>
    </div>
  );
}
