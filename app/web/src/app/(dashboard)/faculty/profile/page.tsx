"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import Header from "@/components/layout/Header";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileSection from "@/components/profile/ProfileSection";
import EditProfileModal, { ProfileExtras } from "@/components/profile/EditProfileModal";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Link from "next/link";
import {
  Users,
  Building2,
  TrendingUp,
  Shield,
  BookOpen,
  Calendar,
  Award,
  ChevronRight,
} from "lucide-react";

import { getApplications } from "@/app/actions/applications";
import { getAllOffers } from "@/app/actions/offers";
import { getAllCredentials } from "@/app/actions/credentials";
import { getCalendarEvents } from "@/app/actions/calendar";
import { getDrives } from "@/app/actions/drives";
import { getFacultyProfile } from "@/app/actions/profile";

export default function FacultyProfilePage() {
  const { user, logout } = useAuth();

  const [loading, setLoading] = useState(true);
  const [extras, setExtras] = useState<ProfileExtras>({});
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // DB Profile Data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [dbProfile, setDbProfile] = useState<any>(null);

  // Stats Data
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
        const [apps, offs, docs, evts, drvs, fProfile] = await Promise.all([
          getApplications(),
          getAllOffers(),
          getAllCredentials(),
          getCalendarEvents(),
          getDrives(),
          getFacultyProfile(),
        ]);
        setApplications(apps);
        setOffers(offs);
        setDocuments(docs);
        setCalendarEvents(evts);
        setDrives(drvs);
        setDbProfile(fProfile);
      } catch (e) {
        console.error("Failed to load faculty profile data:", e);
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

  // Stats calculations
  const totalStudentsApplied = new Set(applications.map((a) => a.studentId || a.email)).size;
  const totalOffers = applications.filter((a) => a.currentStage === "offered").length;
  const pendingDocs = documents.filter((d) => d.status.toLowerCase() === "pending").length;
  const drivesCoordinated = drives.length;
  const pendingOfferReviews = offers.filter((o) => o.status === "Offer Uploaded" || o.status === "pending").length;

  const upcomingEvents = calendarEvents
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);

  const department = dbProfile?.department || "Computer Science & Engineering";

  return (
    <>
      <Header
        title="Faculty Profile"
        subtitle="Training & Placement Cell (TPC) Coordinator Profile and Overview"
      />

      <div className="p-6 space-y-6 max-w-5xl">
        <ProfileHeader
          name={user.fullName}
          email={user.email}
          roleBadgeText="TPC Coordinator / Faculty"
          isFaculty={true}
          onEdit={() => setIsEditModalOpen(true)}
          onLogout={logout}
        />

        {loading ? (
          <div className="flex justify-center p-12">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left Column - Details & Quick Actions */}
            <div className="md:col-span-1 space-y-6">
              {/* Faculty Information */}
              <ProfileSection title="Faculty Details" icon={<BookOpen className="w-4 h-4 text-primary" />}>
                <div className="space-y-3">
                  <InfoRow label="Department" value={department} />
                  <InfoRow label="Designation" value={extras.designation || "Associate Professor & TPC Lead"} />
                  <InfoRow label="Phone" value={extras.phone || "+91 98765 43210"} />
                  <InfoRow label="Office" value="TPC Office, Block B" />
                  <InfoRow
                    label="Joined Portal"
                    value={new Date(user.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  />
                </div>
              </ProfileSection>

              {/* Quick Actions */}
              <ProfileSection title="TPC Actions" icon={<Building2 className="w-4 h-4 text-accent" />}>
                <div className="space-y-2.5">
                  <Link href="/drives" className="block">
                    <Button variant="secondary" className="w-full justify-between text-left" size="sm">
                      <span className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-primary" /> Manage Drives
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                    </Button>
                  </Link>
                  <Link href="/faculty/documents" className="block">
                    <Button variant="secondary" className="w-full justify-between text-left" size="sm">
                      <span className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-emerald-500" /> Verify Documents
                      </span>
                      {pendingDocs > 0 && (
                        <Badge variant="warning" size="sm">
                          {pendingDocs}
                        </Badge>
                      )}
                    </Button>
                  </Link>
                  <Link href="/faculty/offers" className="block">
                    <Button variant="secondary" className="w-full justify-between text-left" size="sm">
                      <span className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-accent" /> Review Offers
                      </span>
                      {pendingOfferReviews > 0 && (
                        <Badge variant="info" size="sm">
                          {pendingOfferReviews}
                        </Badge>
                      )}
                    </Button>
                  </Link>
                  <Link href="/analytics" className="block">
                    <Button variant="secondary" className="w-full justify-between text-left" size="sm">
                      <span className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-purple-400" /> Analytics
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                    </Button>
                  </Link>
                </div>
              </ProfileSection>
            </div>

            {/* Right Column - Stats & Events */}
            <div className="md:col-span-2 space-y-6">
              {/* Coordination Summary */}
              <ProfileSection title="Placement Coordination Summary" icon={<TrendingUp className="w-4 h-4 text-primary" />}>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <StatCard icon={<Users />} label="Students Active" value={totalStudentsApplied} color="primary" />
                  <StatCard icon={<Building2 />} label="Drives Active" value={drivesCoordinated} color="accent" />
                  <StatCard icon={<TrendingUp />} label="Total Offers" value={totalOffers} color="success" />
                  <StatCard icon={<Shield />} label="Pending Docs" value={pendingDocs} color="warning" />
                </div>
              </ProfileSection>

              {/* Upcoming Placement Events */}
              <ProfileSection
                title="Upcoming Placement Drives & Rounds"
                icon={<Calendar className="w-4 h-4 text-primary" />}
                action={
                  <Link href="/calendar" className="text-xs text-primary hover:underline flex items-center gap-1">
                    Full Calendar <ChevronRight className="w-3 h-3" />
                  </Link>
                }
              >
                {upcomingEvents.length > 0 ? (
                  <div className="space-y-3">
                    {upcomingEvents.map((event) => (
                      <div
                        key={event.id}
                        className="flex justify-between items-center p-3 rounded-lg bg-sidebar-bg border border-white/5"
                      >
                        <div>
                          <p className="text-sm font-semibold">{event.title}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {event.company} • {event.location}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-primary">
                            {new Date(event.date).toLocaleDateString("en-IN", {
                              month: "short",
                              day: "numeric",
                            })}
                          </p>
                          <Badge variant="default" size="sm" className="mt-1 text-xs">
                            {event.time}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground py-6 text-center">No upcoming events on the calendar.</p>
                )}
              </ProfileSection>
            </div>
          </div>
        )}
      </div>

      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        initialData={extras}
        onSave={handleSaveExtras}
        isFaculty={true}
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
