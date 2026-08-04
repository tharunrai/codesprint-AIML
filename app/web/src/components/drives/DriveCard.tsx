"use client";

import Link from "next/link";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { type Drive } from "@/lib/types";
import { type User } from "@prisma/client";
import { checkEligibility, formatCTC, deadlineCountdown } from "@/lib/utils";

interface DriveCardProps {
  drive: Drive;
  currentUser: User | null;
  studentProfile?: { cgpa?: number | null; branch?: string | null } | null;
  onToggleStatus?: (driveId: string, newStatus: "open" | "closed") => void;
}

export default function DriveCard({ drive, currentUser, studentProfile, onToggleStatus }: DriveCardProps) {
  const isFaculty = currentUser?.role === "FACULTY";
  const eligibility = currentUser && !isFaculty
    ? checkEligibility(studentProfile || { cgpa: 8.4, branch: "CSE" }, drive)
    : { eligible: false, reasons: ["Only students can apply"] };
  const isEligible = eligibility.eligible;

  const isClosed = drive.status === "closed";

  const handleToggleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onToggleStatus) {
      onToggleStatus(drive.id, isClosed ? "open" : "closed");
    }
  };

  return (
    <Link href={`/drives/${drive.id}`}>
      <Card hover className="h-full flex flex-col justify-between">
        <div>
          {/* Top row */}
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center shrink-0">
              <span className="text-primary font-bold">
                {drive.companyName.slice(0, 2).toUpperCase()}
              </span>
            </div>
            <div className="flex flex-col items-end gap-1">
              <Badge
                variant={
                  isClosed
                    ? "default"
                    : drive.status === "ongoing"
                      ? "warning"
                      : "success"
                }
                size="sm"
                dot={!isClosed}
              >
                {isClosed ? "Closed" : drive.status === "ongoing" ? "Ongoing" : "Open"}
              </Badge>
              <Badge variant={drive.roleType === "Internship" ? "info" : "default"} size="sm">
                {drive.roleType}
              </Badge>
            </div>
          </div>

          {/* Company & Role */}
          <h3 className="text-base font-semibold text-foreground">
            {drive.companyName}
          </h3>
          <p className="text-sm text-muted-foreground mt-0.5">{drive.role}</p>

          {/* Details */}
          <div className="mt-4 space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">CTC:</span>
              <span className="font-semibold text-foreground">
                {formatCTC(drive.ctcLakh)}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Deadline:</span>
              <span
                className={`font-medium ${
                  deadlineCountdown(drive.deadline) === "Closed"
                    ? "text-danger"
                    : "text-foreground"
                }`}
              >
                {deadlineCountdown(drive.deadline)}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Rounds:</span>
              <span className="text-foreground">{drive.rounds.length} stages</span>
            </div>
          </div>
        </div>

        {/* Footer info & role actions */}
        <div className="mt-4 pt-4 border-t border-border">
          {isFaculty ? (
            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={handleToggleClick}
                className={`
                  px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors cursor-pointer
                  ${
                    isClosed
                      ? "bg-success/10 text-success border-success/30 hover:bg-success/20"
                      : "bg-danger/10 text-danger border-danger/30 hover:bg-danger/20"
                  }
                `}
              >
                {isClosed ? "Reopen Drive" : "Close Drive"}
              </button>

              <span className="text-xs text-primary font-medium flex items-center gap-1">
                Manage Applicants →
              </span>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              {isEligible ? (
                <Badge variant="success" size="sm">
                  ✓ Eligible
                </Badge>
              ) : (
                <Badge
                  variant="danger"
                  size="sm"
                  className="max-w-[180px] truncate"
                  title={eligibility.reasons.join(", ")}
                >
                  ✗ Not Eligible
                </Badge>
              )}
              <span className="text-xs text-muted-foreground">
                {drive.registeredCount} applied
              </span>
            </div>
          )}
        </div>
      </Card>
    </Link>
  );
}
