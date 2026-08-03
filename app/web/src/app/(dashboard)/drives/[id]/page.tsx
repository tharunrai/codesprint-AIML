"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { usePlacement } from "@/context/PlacementContext";
import Header from "@/components/layout/Header";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import ApplyModal from "@/components/drives/ApplyModal";
import ApplicantRoundTracker from "@/components/rounds/ApplicantRoundTracker";
import {
  checkEligibility,
  formatCTC,
  deadlineCountdown,
} from "@/lib/mock-data";

export default function DriveDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { drives, applications, applyToDrive, updateDriveStatus } = usePlacement();

  const driveId = params.id as string;
  const drive = drives.find((d) => d.id === driveId);

  const [activeTab, setActiveTab] = useState<"overview" | "applicants">("overview");
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applyLoading, setApplyLoading] = useState(false);

  const isFaculty = user?.role === "faculty";

  // Check if current logged in user has applied
  const userApplication = applications.find(
    (a) => a.driveId === driveId && (a.studentId === user?.id || a.email === user?.email)
  );
  const applied = !!userApplication;

  if (!drive) {
    return (
      <>
        <Header title="Drive Not Found" />
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-foreground">
              Drive not found
            </h2>
            <p className="text-sm text-muted-foreground mt-1 mb-4">
              The drive you&apos;re looking for doesn&apos;t exist.
            </p>
            <Button onClick={() => router.push("/drives")}>
              ← Back to Drives
            </Button>
          </div>
        </div>
      </>
    );
  }

  const eligibility = user && !isFaculty
    ? checkEligibility(user, drive)
    : { eligible: true, reasons: [] };

  const isClosed = drive.status === "closed";

  async function handleApply() {
    if (!user) return;
    setApplyLoading(true);
    // Submit application via PlacementContext
    await new Promise((r) => setTimeout(r, 600));
    applyToDrive(drive.id, user);
    setApplyLoading(false);
    setShowApplyModal(false);
  }

  function handleToggleDriveStatus() {
    updateDriveStatus(drive.id, isClosed ? "open" : "closed");
  }

  // TODO: Wire up real AI Prep Coach integration (section 4.5 of specs.md)
  function handleAIPrepCoach() {
    alert("AI Prep Coach — coming soon! This feature is being built by a teammate.");
  }

  // TODO: Wire up real Company Research Assistant integration (section 4.5 of specs.md)
  function handleCompanyResearch() {
    alert("Company Research Assistant — coming soon! This feature is being built by a teammate.");
  }

  return (
    <>
      <Header
        title={drive.companyName}
        subtitle={`${drive.role} • ${isFaculty ? "Faculty Administration" : "Job Profile & Rounds"}`}
      />

      <div className="p-6 max-w-5xl space-y-6">
        {/* Top Company Banner */}
        <Card>
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
            <div className="flex items-start gap-4">
              {/* Company Logo Icon */}
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center shrink-0">
                <span className="text-primary font-bold text-2xl">
                  {drive.companyName.slice(0, 2).toUpperCase()}
                </span>
              </div>

              {/* Info */}
              <div className="space-y-2">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">
                    {drive.companyName}
                  </h2>
                  <p className="text-lg text-muted-foreground">{drive.role}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Badge
                    variant={
                      isClosed
                        ? "default"
                        : drive.status === "ongoing"
                          ? "warning"
                          : "success"
                    }
                    dot={!isClosed}
                  >
                    {isClosed ? "Closed" : drive.status === "ongoing" ? "Ongoing" : "Open"}
                  </Badge>
                  <Badge variant="info">{drive.roleType}</Badge>
                  <Badge variant="default">{deadlineCountdown(drive.deadline)}</Badge>
                </div>
              </div>
            </div>

            {/* Faculty Quick Status Toggle */}
            {isFaculty && (
              <div className="flex items-center gap-3">
                <Button
                  variant={isClosed ? "primary" : "secondary"}
                  size="sm"
                  onClick={handleToggleDriveStatus}
                >
                  {isClosed ? "Reopen Applications" : "Close Applications"}
                </Button>
              </div>
            )}
          </div>
        </Card>

        {/* Tab Navigation for Faculty */}
        {isFaculty && (
          <div className="flex border-b border-border">
            <button
              onClick={() => setActiveTab("overview")}
              className={`
                px-5 py-2.5 text-sm font-semibold border-b-2 transition-all cursor-pointer
                ${
                  activeTab === "overview"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }
              `}
            >
              Drive Overview
            </button>
            <button
              onClick={() => setActiveTab("applicants")}
              className={`
                px-5 py-2.5 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 cursor-pointer
                ${
                  activeTab === "applicants"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }
              `}
            >
              <span>Applicants & Round Tracking</span>
              <span className="px-2 py-0.5 rounded-full text-xs bg-primary/10 text-primary font-bold">
                {applications.filter((a) => a.driveId === drive.id).length}
              </span>
            </button>
          </div>
        )}

        {/* Tab 1: Overview */}
        {(activeTab === "overview" || !isFaculty) && (
          <div className="space-y-6">
            {/* Description */}
            <Card>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                About the Opportunity
              </h3>
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">
                {drive.description}
              </p>
            </Card>

            {/* Details grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Compensation */}
              <Card>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  Compensation
                </h3>
                <p className="text-3xl font-bold text-foreground">
                  {formatCTC(drive.ctcLakh)}
                </p>
                {drive.ctcBreakdown && (
                  <p className="text-sm text-muted-foreground mt-2">
                    {drive.ctcBreakdown}
                  </p>
                )}
              </Card>

              {/* Eligibility */}
              <Card>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  Eligibility Criteria
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Min CGPA</span>
                    <span className="font-medium text-foreground">
                      {drive.eligibility.minCgpa}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Branches</span>
                    <span className="font-medium text-foreground">
                      {drive.eligibility.branches.join(", ")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Max Backlogs</span>
                    <span className="font-medium text-foreground">
                      {drive.eligibility.maxBacklogs}
                    </span>
                  </div>
                  {!isFaculty && (
                    <div className="pt-2 border-t border-border">
                      {eligibility.eligible ? (
                        <Badge variant="success">✓ You are eligible</Badge>
                      ) : (
                        <div>
                          <Badge variant="danger">✗ Not eligible</Badge>
                          <div className="mt-1 space-y-0.5">
                            {eligibility.reasons.map((r, i) => (
                              <p key={i} className="text-xs text-danger">
                                {r}
                              </p>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            </div>

            {/* Rounds Pipeline */}
            <Card>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                Hiring Rounds Timeline
              </h3>
              <div className="space-y-0">
                {drive.rounds.map((round, idx) => (
                  <div key={round.id} className="flex items-start gap-4">
                    {/* Timeline line */}
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                        {idx + 1}
                      </div>
                      {idx < drive.rounds.length - 1 && (
                        <div className="w-0.5 h-8 bg-border" />
                      )}
                    </div>
                    {/* Content */}
                    <div className="pb-6">
                      <p className="font-medium text-foreground">{round.name}</p>
                      <div className="flex gap-2 mt-1">
                        <Badge variant="default" size="sm">
                          {round.type}
                        </Badge>
                        {round.scheduledDate && (
                          <span className="text-xs text-muted-foreground">
                            {new Date(round.scheduledDate).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Action buttons (Student View) */}
            {!isFaculty ? (
              <Card>
                <div className="flex flex-col sm:flex-row gap-3">
                  {applied ? (
                    <Button variant="secondary" disabled className="flex-1">
                      ✓ Already Applied ({userApplication?.currentStage.replace("-", " ").toUpperCase()})
                    </Button>
                  ) : (
                    <Button
                      onClick={() => setShowApplyModal(true)}
                      disabled={isClosed || !eligibility.eligible}
                      className="flex-1"
                    >
                      {isClosed
                        ? "Applications Closed"
                        : eligibility.eligible
                          ? "Apply Now"
                          : "Not Eligible"}
                    </Button>
                  )}

                  {/* AI Placeholder buttons */}
                  <Button
                    variant="secondary"
                    onClick={handleAIPrepCoach}
                    icon={
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    }
                  >
                    AI Prep Coach
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={handleCompanyResearch}
                    icon={
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                      </svg>
                    }
                  >
                    Company Research
                  </Button>
                </div>
              </Card>
            ) : (
              <Card className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-foreground">Manage Pipeline Stages</h4>
                  <p className="text-xs text-muted-foreground">
                    Switch to the Applicants tab to update round results, shortlist students, and extend offers.
                  </p>
                </div>
                <Button onClick={() => setActiveTab("applicants")}>
                  Open Round Tracker →
                </Button>
              </Card>
            )}
          </div>
        )}

        {/* Tab 2: Faculty Applicants & Round Tracker */}
        {isFaculty && activeTab === "applicants" && (
          <ApplicantRoundTracker drive={drive} />
        )}
      </div>

      {/* Apply Modal */}
      {showApplyModal && (
        <ApplyModal
          drive={drive}
          eligible={eligibility.eligible}
          reasons={eligibility.reasons}
          onConfirm={handleApply}
          onCancel={() => setShowApplyModal(false)}
          loading={applyLoading}
        />
      )}
    </>
  );
}
