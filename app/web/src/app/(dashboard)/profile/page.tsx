"use client";

import { useAuth } from "@/context/AuthContext";
import Header from "@/components/layout/Header";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { usePlacement } from "@/context/PlacementContext";
import Link from "next/link";
import { User, Mail, BookOpen, GraduationCap, Star, FileText, Award, Shield, Sparkles, TrendingUp, Building2 } from "lucide-react";

export default function ProfilePage() {
  const { user, role, logout } = useAuth();
  const { applications, documents, offerLetters } = usePlacement();

  const isFaculty = user?.role === "FACULTY";

  // Student-specific data
  const myApplications = applications.filter(
    (a) => user && (a.email.toLowerCase() === user.email.toLowerCase() || a.studentId === user.id)
  );
  const myDocs = documents.filter((d) => user && d.studentId === user.id);
  const myOffers = offerLetters.filter((o) => user && o.studentId === user.id);
  const verifiedDocs = myDocs.filter((d) => d.status === "verified").length;
  const offersReceived = myOffers.length;
  const offersAccepted = myOffers.filter((o) => o.status === "accepted").length;

  // Faculty data
  const totalStudentsApplied = new Set(applications.map((a) => a.studentId)).size;
  const totalOffers = applications.filter((a) => a.currentStage === "offered").length;

  return (
    <>
      <Header
        title={isFaculty ? "Faculty Profile" : "Student Profile"}
        subtitle="Your account information and placement summary"
      />

      <div className="p-6 space-y-6 max-w-4xl">
        {/* Profile Card */}
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-r from-primary/20 via-accent/15 to-primary/10" />
          <div className="relative pt-12 flex flex-col sm:flex-row items-center sm:items-end gap-5">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-3xl font-black shadow-lg shadow-primary/20 border-4 border-background -mt-4">
              {user?.fullName?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div className="text-center sm:text-left flex-1">
              <h2 className="text-2xl font-black text-foreground">
                {user?.fullName || "User"}
              </h2>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-1.5">
                <Badge variant={isFaculty ? "warning" : "info"} size="sm">
                  {isFaculty ? "Faculty / TPC Coordinator" : "Student"}
                </Badge>
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5" /> {user?.email}
                </span>
              </div>
            </div>
            <Button variant="secondary" size="sm" onClick={logout}>
              Sign Out
            </Button>
          </div>
        </Card>

        {/* Stats Grid */}
        {!isFaculty ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard
              icon={<FileText className="w-5 h-5 text-primary" />}
              label="Applications"
              value={myApplications.length}
              color="primary"
            />
            <StatCard
              icon={<Award className="w-5 h-5 text-emerald-500" />}
              label="Offers"
              value={offersReceived}
              color="success"
            />
            <StatCard
              icon={<Shield className="w-5 h-5 text-amber-500" />}
              label="Verified Docs"
              value={verifiedDocs}
              color="warning"
            />
            <StatCard
              icon={<Star className="w-5 h-5 text-accent" />}
              label="Accepted"
              value={offersAccepted}
              color="accent"
            />
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard
              icon={<User className="w-5 h-5 text-primary" />}
              label="Students Applied"
              value={totalStudentsApplied}
              color="primary"
            />
            <StatCard
              icon={<Building2 className="w-5 h-5 text-accent" />}
              label="Total Drives"
              value={applications.length > 0 ? new Set(applications.map((a) => a.driveId)).size : 0}
              color="accent"
            />
            <StatCard
              icon={<TrendingUp className="w-5 h-5 text-emerald-500" />}
              label="Offers Extended"
              value={totalOffers}
              color="success"
            />
            <StatCard
              icon={<Shield className="w-5 h-5 text-amber-500" />}
              label="Docs Pending"
              value={documents.filter((d) => d.status === "pending").length}
              color="warning"
            />
          </div>
        )}

        {/* Quick Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
              <BookOpen className="w-4 h-4" /> Account Information
            </h3>
            <div className="space-y-3">
              <InfoRow label="Full Name" value={user?.fullName || "N/A"} />
              <InfoRow label="Email" value={user?.email || "N/A"} />
              <InfoRow label="Role" value={isFaculty ? "Faculty / TPC" : "Student"} />
              <InfoRow
                label="Account Created"
                value={
                  user?.createdAt
                    ? new Date(user.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })
                    : "N/A"
                }
              />
            </div>
          </Card>

          <Card>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> Quick Actions
            </h3>
            <div className="space-y-2">
              {!isFaculty ? (
                <>
                  <Link href="/drives">
                    <Button variant="secondary" className="w-full justify-start" size="sm">
                      <GraduationCap className="w-4 h-4 mr-2" /> Browse Placement Drives
                    </Button>
                  </Link>
                  <Link href="/credentials">
                    <Button variant="secondary" className="w-full justify-start" size="sm">
                      <Shield className="w-4 h-4 mr-2" /> Manage Credentials
                    </Button>
                  </Link>
                  <Link href="/ai-assistant">
                    <Button variant="secondary" className="w-full justify-start" size="sm">
                      <Sparkles className="w-4 h-4 mr-2" /> AI Placement Assistant
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/analytics">
                    <Button variant="secondary" className="w-full justify-start" size="sm">
                      <TrendingUp className="w-4 h-4 mr-2" /> View Analytics
                    </Button>
                  </Link>
                  <Link href="/faculty/documents">
                    <Button variant="secondary" className="w-full justify-start" size="sm">
                      <Shield className="w-4 h-4 mr-2" /> Verify Documents
                    </Button>
                  </Link>
                  <Link href="/ai-assistant">
                    <Button variant="secondary" className="w-full justify-start" size="sm">
                      <Sparkles className="w-4 h-4 mr-2" /> AI Assistant Tools
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </Card>
        </div>

        {/* Recent Applications (Students) */}
        {!isFaculty && myApplications.length > 0 && (
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4" /> Recent Applications
              </h3>
              <Link href="/applications">
                <Button variant="ghost" size="sm">View All →</Button>
              </Link>
            </div>
            <div className="space-y-2">
              {myApplications.slice(0, 3).map((app) => (
                <div
                  key={app.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-surface-hover/50 border border-border/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-primary text-xs font-bold">
                        {app.companyName.slice(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{app.companyName}</p>
                      <p className="text-xs text-muted-foreground">{app.role}</p>
                    </div>
                  </div>
                  <Badge
                    variant={
                      app.currentStage === "offered"
                        ? "success"
                        : app.currentStage === "rejected"
                        ? "danger"
                        : "info"
                    }
                    size="sm"
                  >
                    {app.currentStage.replace("-", " ")}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </>
  );
}

/* ── Sub-components ────────────────────────────────────────── */

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <Card className="text-center">
      <div className="flex justify-center mb-2">{icon}</div>
      <p className="text-2xl font-black text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
    </Card>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-semibold text-foreground">{value}</span>
    </div>
  );
}
