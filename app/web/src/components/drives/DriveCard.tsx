import Link from "next/link";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import {
  type Drive,
  type User,
  checkEligibility,
  formatCTC,
  deadlineCountdown,
} from "@/lib/mock-data";

interface DriveCardProps {
  drive: Drive;
  currentUser: User | null;
}

export default function DriveCard({ drive, currentUser }: DriveCardProps) {
  const eligibility = currentUser
    ? checkEligibility(currentUser, drive)
    : { eligible: false, reasons: ["Not logged in"] };

  const isClosed = drive.status === "closed";

  return (
    <Link href={`/drives/${drive.id}`}>
      <Card hover className="h-full flex flex-col">
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
        <div className="mt-4 space-y-2 flex-1">
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
            <span className="text-foreground">{drive.rounds.length}</span>
          </div>
        </div>

        {/* Eligibility */}
        <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
          {eligibility.eligible ? (
            <Badge variant="success" size="sm">
              ✓ Eligible
            </Badge>
          ) : (
            <Badge variant="danger" size="sm" className="max-w-[180px] truncate" title={eligibility.reasons.join(", ")}>
              ✗ Not Eligible
            </Badge>
          )}
          <span className="text-xs text-muted-foreground">
            {drive.registeredCount} applied
          </span>
        </div>
      </Card>
    </Link>
  );
}
