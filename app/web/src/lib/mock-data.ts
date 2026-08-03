// ============================================================
// Mock Data — Single source of truth for all Phase 1 dummy data
// TODO: Replace each export with real API calls when backend is ready
// ============================================================

// ── Types ────────────────────────────────────────────────────

export type UserRole = "student" | "faculty";

export interface User {
  id: string;
  name: string;
  email: string;
  rollNumber: string;
  branch: string;
  cgpa: number;
  year: number;
  skills: string[];
  role: UserRole;
  avatarUrl?: string;
  resumeUploaded: boolean;
  onboardingComplete: boolean;
}

export interface Drive {
  id: string;
  companyName: string;
  companyLogoUrl?: string;
  role: string;
  description: string;
  ctcLakh: number; // in LPA
  ctcBreakdown?: string;
  roleType: "Full-time" | "Internship" | "PPO";
  eligibility: {
    minCgpa: number;
    branches: string[];
    maxBacklogs: number;
  };
  deadline: string; // ISO date string
  postedDate: string;
  status: "open" | "closed" | "ongoing";
  rounds: RoundInfo[];
  registeredCount: number;
}

export interface RoundInfo {
  id: string;
  name: string;
  type: "OA" | "Technical" | "HR" | "GD" | "Coding" | "Final";
  order: number;
  scheduledDate?: string;
}

export type ApplicationStage =
  | "applied"
  | "shortlisted"
  | "round-1"
  | "round-2"
  | "round-3"
  | "offered"
  | "rejected";

export interface Application {
  id: string;
  driveId: string;
  companyName: string;
  role: string;
  currentStage: ApplicationStage;
  appliedDate: string;
  lastUpdated: string;
  roundResults: RoundResult[];
}

export interface RoundResult {
  roundName: string;
  status: "passed" | "failed" | "pending" | "upcoming";
  date?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "deadline";
  read: boolean;
  timestamp: string;
  link?: string;
}

// ── Mock Users ───────────────────────────────────────────────

export const mockStudent: User = {
  id: "stu-001",
  name: "Arjun Mehta",
  email: "arjun.mehta@college.edu",
  rollNumber: "21CS048",
  branch: "CSE",
  cgpa: 8.4,
  year: 4,
  skills: ["React", "TypeScript", "Node.js", "Python", "SQL", "Docker"],
  role: "student",
  resumeUploaded: true,
  onboardingComplete: true,
};

export const mockFaculty: User = {
  id: "fac-001",
  name: "Dr. Priya Sharma",
  email: "priya.sharma@college.edu",
  rollNumber: "FAC-112",
  branch: "CSE",
  cgpa: 0,
  year: 0,
  skills: [],
  role: "faculty",
  resumeUploaded: false,
  onboardingComplete: true,
};

// ── Mock Drives ──────────────────────────────────────────────

export const mockDrives: Drive[] = [
  {
    id: "drv-001",
    companyName: "Google",
    role: "SDE Intern",
    description:
      "Join Google's engineering team as a Software Development Engineer Intern. Work on large-scale distributed systems, collaborate with world-class engineers, and contribute to products used by billions of people worldwide.",
    ctcLakh: 18,
    ctcBreakdown: "Base: ₹1.5L/month stipend + housing allowance",
    roleType: "Internship",
    eligibility: { minCgpa: 8.0, branches: ["CSE", "ISE", "ECE"], maxBacklogs: 0 },
    deadline: "2026-08-20T23:59:00Z",
    postedDate: "2026-07-28T10:00:00Z",
    status: "open",
    rounds: [
      { id: "r1", name: "Online Assessment", type: "OA", order: 1, scheduledDate: "2026-08-22T10:00:00Z" },
      { id: "r2", name: "Technical Interview 1", type: "Technical", order: 2 },
      { id: "r3", name: "Technical Interview 2", type: "Technical", order: 3 },
      { id: "r4", name: "HR Round", type: "HR", order: 4 },
    ],
    registeredCount: 142,
  },
  {
    id: "drv-002",
    companyName: "Microsoft",
    role: "Software Engineer",
    description:
      "Full-time Software Engineer position at Microsoft India Development Center. You will design, build, and ship software solutions that empower every person and organization on the planet.",
    ctcLakh: 42,
    ctcBreakdown: "Base: ₹19L + Bonus: ₹5L + RSUs: ₹18L (4yr vest)",
    roleType: "Full-time",
    eligibility: { minCgpa: 7.5, branches: ["CSE", "ISE", "ECE", "EEE"], maxBacklogs: 0 },
    deadline: "2026-08-15T23:59:00Z",
    postedDate: "2026-07-25T09:00:00Z",
    status: "open",
    rounds: [
      { id: "r1", name: "Online Coding Round", type: "Coding", order: 1, scheduledDate: "2026-08-18T14:00:00Z" },
      { id: "r2", name: "Technical Interview", type: "Technical", order: 2 },
      { id: "r3", name: "Design Round", type: "Technical", order: 3 },
      { id: "r4", name: "HR / Managerial", type: "HR", order: 4 },
    ],
    registeredCount: 210,
  },
  {
    id: "drv-003",
    companyName: "Razorpay",
    role: "Backend Engineer",
    description:
      "Build the payment infrastructure that powers millions of businesses in India. Work on high-throughput, low-latency systems handling real money.",
    ctcLakh: 28,
    ctcBreakdown: "Base: ₹18L + ESOPs: ₹10L (4yr vest)",
    roleType: "Full-time",
    eligibility: { minCgpa: 7.0, branches: ["CSE", "ISE"], maxBacklogs: 1 },
    deadline: "2026-08-25T23:59:00Z",
    postedDate: "2026-08-01T12:00:00Z",
    status: "open",
    rounds: [
      { id: "r1", name: "Online Assessment", type: "OA", order: 1, scheduledDate: "2026-08-28T10:00:00Z" },
      { id: "r2", name: "Technical Interview", type: "Technical", order: 2 },
      { id: "r3", name: "System Design", type: "Technical", order: 3 },
      { id: "r4", name: "Culture Fit", type: "HR", order: 4 },
    ],
    registeredCount: 89,
  },
  {
    id: "drv-004",
    companyName: "Deloitte",
    role: "Analyst — Technology Consulting",
    description:
      "Join Deloitte's Technology Consulting practice. Solve complex business problems using cutting-edge technology for Fortune 500 clients across industries.",
    ctcLakh: 12,
    ctcBreakdown: "Base: ₹10L + Performance Bonus: ₹2L",
    roleType: "Full-time",
    eligibility: { minCgpa: 6.5, branches: ["CSE", "ISE", "ECE", "EEE", "ME", "CE"], maxBacklogs: 2 },
    deadline: "2026-08-10T23:59:00Z",
    postedDate: "2026-07-20T08:00:00Z",
    status: "ongoing",
    rounds: [
      { id: "r1", name: "Aptitude Test", type: "OA", order: 1, scheduledDate: "2026-08-05T09:00:00Z" },
      { id: "r2", name: "Group Discussion", type: "GD", order: 2 },
      { id: "r3", name: "Technical + HR", type: "Final", order: 3 },
    ],
    registeredCount: 320,
  },
  {
    id: "drv-005",
    companyName: "Atlassian",
    role: "Frontend Engineer",
    description:
      "Help build the tools that power modern software teams. Work on Jira, Confluence, and Trello — products loved by developers worldwide.",
    ctcLakh: 45,
    ctcBreakdown: "Base: ₹22L + RSUs: ₹15L (4yr vest) + Bonus: ₹8L",
    roleType: "Full-time",
    eligibility: { minCgpa: 8.0, branches: ["CSE", "ISE"], maxBacklogs: 0 },
    deadline: "2026-08-30T23:59:00Z",
    postedDate: "2026-08-02T11:00:00Z",
    status: "open",
    rounds: [
      { id: "r1", name: "Karat Technical Screen", type: "Technical", order: 1 },
      { id: "r2", name: "Values Interview", type: "HR", order: 2 },
      { id: "r3", name: "Technical Deep Dive", type: "Technical", order: 3 },
      { id: "r4", name: "Manager Round", type: "Final", order: 4 },
    ],
    registeredCount: 67,
  },
  {
    id: "drv-006",
    companyName: "Tata Consultancy Services",
    role: "Systems Engineer",
    description:
      "Mass recruitment drive for TCS Digital. Work on enterprise solutions across domains including BFSI, healthcare, and retail.",
    ctcLakh: 7,
    ctcBreakdown: "Base: ₹7L (all-inclusive, first year)",
    roleType: "Full-time",
    eligibility: { minCgpa: 6.0, branches: ["CSE", "ISE", "ECE", "EEE", "ME", "CE", "CV"], maxBacklogs: 1 },
    deadline: "2026-08-12T23:59:00Z",
    postedDate: "2026-07-15T10:00:00Z",
    status: "closed",
    rounds: [
      { id: "r1", name: "TCS NQT", type: "OA", order: 1, scheduledDate: "2026-07-30T10:00:00Z" },
      { id: "r2", name: "Technical Interview", type: "Technical", order: 2 },
      { id: "r3", name: "Managerial + HR", type: "HR", order: 3 },
    ],
    registeredCount: 580,
  },
];

// ── Mock Applications ────────────────────────────────────────

export const mockApplications: Application[] = [
  {
    id: "app-001",
    driveId: "drv-002",
    companyName: "Microsoft",
    role: "Software Engineer",
    currentStage: "round-1",
    appliedDate: "2026-07-26T14:30:00Z",
    lastUpdated: "2026-08-03T09:00:00Z",
    roundResults: [
      { roundName: "Online Coding Round", status: "passed", date: "2026-08-01T14:00:00Z" },
      { roundName: "Technical Interview", status: "pending" },
      { roundName: "Design Round", status: "upcoming" },
      { roundName: "HR / Managerial", status: "upcoming" },
    ],
  },
  {
    id: "app-002",
    driveId: "drv-004",
    companyName: "Deloitte",
    role: "Analyst — Technology Consulting",
    currentStage: "shortlisted",
    appliedDate: "2026-07-22T10:00:00Z",
    lastUpdated: "2026-08-02T16:00:00Z",
    roundResults: [
      { roundName: "Aptitude Test", status: "passed", date: "2026-08-05T09:00:00Z" },
      { roundName: "Group Discussion", status: "pending" },
      { roundName: "Technical + HR", status: "upcoming" },
    ],
  },
  {
    id: "app-003",
    driveId: "drv-006",
    companyName: "Tata Consultancy Services",
    role: "Systems Engineer",
    currentStage: "offered",
    appliedDate: "2026-07-16T08:00:00Z",
    lastUpdated: "2026-08-01T11:00:00Z",
    roundResults: [
      { roundName: "TCS NQT", status: "passed", date: "2026-07-30T10:00:00Z" },
      { roundName: "Technical Interview", status: "passed", date: "2026-07-31T15:00:00Z" },
      { roundName: "Managerial + HR", status: "passed", date: "2026-08-01T11:00:00Z" },
    ],
  },
  {
    id: "app-004",
    driveId: "drv-001",
    companyName: "Google",
    role: "SDE Intern",
    currentStage: "applied",
    appliedDate: "2026-08-03T12:00:00Z",
    lastUpdated: "2026-08-03T12:00:00Z",
    roundResults: [
      { roundName: "Online Assessment", status: "upcoming" },
      { roundName: "Technical Interview 1", status: "upcoming" },
      { roundName: "Technical Interview 2", status: "upcoming" },
      { roundName: "HR Round", status: "upcoming" },
    ],
  },
];

// ── Mock Notifications ───────────────────────────────────────

export const mockNotifications: Notification[] = [
  {
    id: "notif-001",
    title: "Microsoft — Round 1 Cleared!",
    message: "Congratulations! You've cleared the Online Coding Round. Technical Interview schedule coming soon.",
    type: "success",
    read: false,
    timestamp: "2026-08-03T09:00:00Z",
    link: "/applications",
  },
  {
    id: "notif-002",
    title: "New Drive: Atlassian",
    message: "Atlassian is hiring Frontend Engineers. CTC: ₹45 LPA. Deadline: Aug 30.",
    type: "info",
    read: false,
    timestamp: "2026-08-02T11:00:00Z",
    link: "/drives/drv-005",
  },
  {
    id: "notif-003",
    title: "TCS — Offer Letter Available",
    message: "Your offer letter from TCS is ready. Check your applications for details.",
    type: "success",
    read: true,
    timestamp: "2026-08-01T14:00:00Z",
    link: "/applications",
  },
  {
    id: "notif-004",
    title: "Deadline Approaching: Microsoft",
    message: "Application deadline for Microsoft SDE role is in 12 days.",
    type: "deadline",
    read: true,
    timestamp: "2026-08-01T08:00:00Z",
    link: "/drives/drv-002",
  },
  {
    id: "notif-005",
    title: "Deloitte — GD Scheduled",
    message: "Group Discussion for Deloitte is scheduled for Aug 8. Check your dashboard for details.",
    type: "info",
    read: false,
    timestamp: "2026-08-02T16:30:00Z",
    link: "/applications",
  },
];

// ── Helpers ──────────────────────────────────────────────────

/** Check if a student is eligible for a drive */
export function checkEligibility(
  user: Pick<User, "cgpa" | "branch">,
  drive: Drive
): { eligible: boolean; reasons: string[] } {
  const reasons: string[] = [];

  if (user.cgpa < drive.eligibility.minCgpa) {
    reasons.push(`CGPA ${user.cgpa} below minimum ${drive.eligibility.minCgpa}`);
  }
  if (!drive.eligibility.branches.includes(user.branch)) {
    reasons.push(`Branch ${user.branch} not in eligible branches: ${drive.eligibility.branches.join(", ")}`);
  }

  return { eligible: reasons.length === 0, reasons };
}

/** Format LPA to display string */
export function formatCTC(ctcLakh: number): string {
  if (ctcLakh >= 100) return `₹${(ctcLakh / 100).toFixed(1)} Cr`;
  return `₹${ctcLakh} LPA`;
}

/** Get human-readable stage label */
export function getStageLabel(stage: ApplicationStage): string {
  const labels: Record<ApplicationStage, string> = {
    applied: "Applied",
    shortlisted: "Shortlisted",
    "round-1": "Round 1",
    "round-2": "Round 2",
    "round-3": "Round 3",
    offered: "Offered",
    rejected: "Rejected",
  };
  return labels[stage];
}

/** Deadline countdown — returns human-readable string */
export function deadlineCountdown(deadline: string): string {
  const now = new Date();
  const dl = new Date(deadline);
  const diffMs = dl.getTime() - now.getTime();

  if (diffMs < 0) return "Closed";

  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  if (days > 7) return `${days} days left`;
  if (days > 0) return `${days}d ${hours}h left`;
  return `${hours}h left`;
}
