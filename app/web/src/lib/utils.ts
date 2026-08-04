import { type ApplicationStage } from "./types";

/** Format LPA to display string */
export function formatCTC(ctcLakh: number | null | undefined): string {
  if (!ctcLakh) return "Not specified";
  if (ctcLakh >= 100) return `₹${(ctcLakh / 100).toFixed(1)} Cr`;
  return `₹${ctcLakh} LPA`;
}

/** Get human-readable stage label */
export function getStageLabel(stage: ApplicationStage): string {
  const labels: Record<ApplicationStage, string> = {
    pending_review: "Pending Review",
    applied: "Applied",
    shortlisted: "Shortlisted",
    "round-1": "Round 1",
    "round-2": "Round 2",
    "round-3": "Round 3",
    offered: "Offered",
    rejected: "Rejected",
    withdrawn: "Withdrawn",
  };
  return labels[stage];
}

/** Deadline countdown — returns human-readable string */
export function deadlineCountdown(deadline: string | Date): string {
  const now = new Date();
  const dl = typeof deadline === "string" ? new Date(deadline) : deadline;
  const diffMs = dl.getTime() - now.getTime();

  if (diffMs < 0) return "Closed";

  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  if (days > 7) return `${days} days left`;
  if (days > 0) return `${days}d ${hours}h left`;
  return `${hours}h left`;
}

/** Check if a student is eligible for a drive */
export function checkEligibility(
  user: { cgpa?: number | null; branch?: string | null },
  drive: { eligibility?: { minCgpa?: number; branches?: string[] } }
): { eligible: boolean; reasons: string[] } {
  const reasons: string[] = [];
  
  if (!user || !drive || !drive.eligibility) return { eligible: true, reasons: [] };

  const minCgpa = drive.eligibility.minCgpa || 0;
  const branches = drive.eligibility.branches || [];
  
  const userCgpa = user.cgpa || 0;
  const userBranch = user.branch || "";

  if (minCgpa > 0 && userCgpa < minCgpa) {
    reasons.push(`CGPA ${userCgpa} below minimum ${minCgpa}`);
  }
  if (branches.length > 0 && !branches.includes(userBranch)) {
    reasons.push(`Branch ${userBranch} not in eligible branches: ${branches.join(", ")}`);
  }

  return { eligible: reasons.length === 0, reasons };
}
