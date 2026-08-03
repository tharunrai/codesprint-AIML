"use client";

import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { type Drive, formatCTC } from "@/lib/mock-data";

interface ApplyModalProps {
  drive: Drive;
  eligible: boolean;
  reasons: string[];
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function ApplyModal({
  drive,
  eligible,
  reasons,
  onConfirm,
  onCancel,
  loading = false,
}: ApplyModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="relative bg-surface border border-border rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in">
        {/* Header */}
        <div className="px-6 pt-6 pb-4">
          <h2 className="text-lg font-bold text-foreground">
            Confirm Application
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            You&apos;re about to apply for the following position
          </p>
        </div>

        {/* Drive summary */}
        <div className="mx-6 p-4 bg-surface-hover rounded-xl space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <span className="text-primary font-bold text-sm">
                {drive.companyName.slice(0, 2).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="font-semibold text-foreground">
                {drive.companyName}
              </p>
              <p className="text-sm text-muted-foreground">{drive.role}</p>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Badge variant="info" size="sm">
              {formatCTC(drive.ctcLakh)}
            </Badge>
            <Badge variant="default" size="sm">
              {drive.roleType}
            </Badge>
            <Badge variant="default" size="sm">
              {drive.rounds.length} rounds
            </Badge>
          </div>
        </div>

        {/* Eligibility */}
        <div className="px-6 py-4">
          {eligible ? (
            <div className="flex items-center gap-2 p-3 bg-success/10 rounded-lg">
              <svg className="w-5 h-5 text-success shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <span className="text-sm font-medium text-success">
                You meet all eligibility criteria
              </span>
            </div>
          ) : (
            <div className="p-3 bg-danger/10 rounded-lg space-y-1">
              <p className="text-sm font-medium text-danger">
                Eligibility not met:
              </p>
              {reasons.map((r, i) => (
                <p key={i} className="text-xs text-danger/80">
                  • {r}
                </p>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 px-6 pb-6">
          <Button variant="secondary" onClick={onCancel} className="flex-1">
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={!eligible}
            loading={loading}
            className="flex-1"
          >
            {eligible ? "Confirm & Apply" : "Not Eligible"}
          </Button>
        </div>
      </div>
    </div>
  );
}
