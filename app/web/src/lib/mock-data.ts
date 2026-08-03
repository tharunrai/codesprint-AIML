// ============================================================
// Mock Data — Single source of truth for all Phase 1 dummy data
// TODO: Replace each export with real API calls when backend is ready
// ============================================================

// ── Types ────────────────────────────────────────────────────

export type UserRole = "student" | "faculty";

export type DocumentType = "resume" | "marksheet" | "certificate";
export type DocumentStatus = "pending" | "verified" | "rejected";

export interface StudentDocument {
  id: string;
  studentId: string;
  studentName: string;
  rollNumber: string;
  branch: string;
  type: DocumentType;
  fileName: string;
  fileSize?: string;
  status: DocumentStatus;
  uploadedAt: string;
  remarks?: string;
  verifiedAt?: string;
}

export type CalendarEventType =
  | "interview"
  | "assessment"
  | "offer-deadline"
  | "campus-drive"
  | "placement-event";

export interface CalendarEvent {
  id: string;
  title: string;
  type: CalendarEventType;
  date: string; // YYYY-MM-DD date string
  time?: string;
  durationMins?: number;
  company?: string;
  driveId?: string;
  description?: string;
  location?: string;
  targetRole: "student" | "faculty" | "both";
}

export type OfferStatus = "received" | "uploaded" | "verified" | "accepted" | "declined";

export interface OfferLetter {
  id: string;
  studentId: string;
  studentName: string;
  rollNumber: string;
  branch: string;
  driveId: string;
  companyName: string;
  role: string;
  packageLPA: number;
  location: string;
  offerDate: string;
  joiningDate?: string;
  status: OfferStatus;
  fileName?: string;
  fileSize?: string;
  uploadedAt?: string;
  remarks?: string;
  verifiedAt?: string;
}

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
  studentId: string;
  studentName: string;
  rollNumber: string;
  branch: string;
  cgpa: number;
  email: string;
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

// ── Mock Student Pool & Generator ────────────────────────────

interface StudentProfileSeed {
  name: string;
  rollNumber: string;
  branch: string;
  cgpa: number;
}

const mockStudentSeeds: StudentProfileSeed[] = [
  { name: "Pooja Hegde", rollNumber: "21CS012", branch: "CSE", cgpa: 9.1 },
  { name: "Rahul Verma", rollNumber: "21IS045", branch: "ISE", cgpa: 8.7 },
  { name: "Sneha Rao", rollNumber: "21EC089", branch: "ECE", cgpa: 8.2 },
  { name: "Karthik Nair", rollNumber: "21CS094", branch: "CSE", cgpa: 7.9 },
  { name: "Ananya Deshmukh", rollNumber: "21IS019", branch: "ISE", cgpa: 8.5 },
  { name: "Vikram Patil", rollNumber: "21EE033", branch: "EEE", cgpa: 7.4 },
  { name: "Divya Menon", rollNumber: "21CS071", branch: "CSE", cgpa: 9.4 },
  { name: "Rohan Das", rollNumber: "21ME056", branch: "ME", cgpa: 7.1 },
  { name: "Meera Sen", rollNumber: "21EC024", branch: "ECE", cgpa: 8.8 },
  { name: "Sanjay Gupta", rollNumber: "21CS110", branch: "CSE", cgpa: 7.6 },
  { name: "Aditi Rao", rollNumber: "21IS088", branch: "ISE", cgpa: 8.0 },
  { name: "Nikhil Joshi", rollNumber: "21CE015", branch: "CE", cgpa: 6.9 },
];

/** Helper to generate realistic round results based on target stage */
export function buildRoundResultsForStage(rounds: RoundInfo[], stage: ApplicationStage): RoundResult[] {
  return rounds.map((r, idx) => {
    if (stage === "applied") {
      return { roundName: r.name, status: "upcoming" };
    }
    if (stage === "shortlisted") {
      return idx === 0
        ? { roundName: r.name, status: "pending" }
        : { roundName: r.name, status: "upcoming" };
    }
    if (stage === "round-1") {
      if (idx === 0) return { roundName: r.name, status: "passed", date: "2026-08-01T10:00:00Z" };
      if (idx === 1) return { roundName: r.name, status: "pending" };
      return { roundName: r.name, status: "upcoming" };
    }
    if (stage === "round-2") {
      if (idx <= 1) return { roundName: r.name, status: "passed", date: "2026-08-02T14:00:00Z" };
      if (idx === 2) return { roundName: r.name, status: "pending" };
      return { roundName: r.name, status: "upcoming" };
    }
    if (stage === "round-3") {
      if (idx <= 2) return { roundName: r.name, status: "passed", date: "2026-08-03T11:00:00Z" };
      if (idx === 3) return { roundName: r.name, status: "pending" };
      return { roundName: r.name, status: "upcoming" };
    }
    if (stage === "offered") {
      return { roundName: r.name, status: "passed", date: "2026-08-01T16:00:00Z" };
    }
    if (stage === "rejected") {
      if (idx === 0) return { roundName: r.name, status: "failed" };
      return { roundName: r.name, status: "upcoming" };
    }
    return { roundName: r.name, status: "upcoming" };
  });
}

/** Programmatic factory to generate 8-12 applicants per drive */
export function generateMockApplications(drives: Drive[]): Application[] {
  const stageDistribution: ApplicationStage[] = [
    "applied",
    "shortlisted",
    "round-1",
    "round-2",
    "offered",
    "rejected",
    "shortlisted",
    "round-1",
    "applied",
    "offered",
  ];

  const applications: Application[] = [];

  // Seed Arjun Mehta's known applications first
  const arjunApps: { driveId: string; stage: ApplicationStage }[] = [
    { driveId: "drv-002", stage: "round-1" },
    { driveId: "drv-004", stage: "shortlisted" },
    { driveId: "drv-006", stage: "offered" },
    { driveId: "drv-001", stage: "applied" },
  ];

  for (const a of arjunApps) {
    const drive = drives.find((d) => d.id === a.driveId);
    if (!drive) continue;
    applications.push({
      id: `app-arjun-${drive.id}`,
      driveId: drive.id,
      companyName: drive.companyName,
      role: drive.role,
      studentId: mockStudent.id,
      studentName: mockStudent.name,
      rollNumber: mockStudent.rollNumber,
      branch: mockStudent.branch,
      cgpa: mockStudent.cgpa,
      email: mockStudent.email,
      currentStage: a.stage,
      appliedDate: "2026-07-26T14:30:00Z",
      lastUpdated: "2026-08-03T09:00:00Z",
      roundResults: buildRoundResultsForStage(drive.rounds, a.stage),
    });
  }

  // Programmatically generate applicants for every drive
  drives.forEach((drive, driveIdx) => {
    // Select 8 to 11 students per drive
    mockStudentSeeds.forEach((seed, seedIdx) => {
      // Exclude if branch not eligible
      if (!drive.eligibility.branches.includes(seed.branch)) return;

      const stage = stageDistribution[(seedIdx + driveIdx) % stageDistribution.length];
      const appId = `app-${drive.id}-${seed.rollNumber.toLowerCase()}`;

      applications.push({
        id: appId,
        driveId: drive.id,
        companyName: drive.companyName,
        role: drive.role,
        studentId: `stu-${seed.rollNumber}`,
        studentName: seed.name,
        rollNumber: seed.rollNumber,
        branch: seed.branch,
        cgpa: seed.cgpa,
        email: `${seed.name.toLowerCase().replace(/\s+/g, ".")}@college.edu`,
        currentStage: stage,
        appliedDate: new Date(Date.now() - (seedIdx + 1) * 86400000 * 2).toISOString(),
        lastUpdated: new Date(Date.now() - seedIdx * 3600000 * 4).toISOString(),
        roundResults: buildRoundResultsForStage(drive.rounds, stage),
      });
    });
  });

  return applications;
}

// ── Default Mock Applications ────────────────────────────────

export const mockApplications: Application[] = generateMockApplications(mockDrives);

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

// ── Mock Documents ───────────────────────────────────────────

export const mockDocuments: StudentDocument[] = [
  {
    id: "doc-001",
    studentId: "stu-001",
    studentName: "Arjun Mehta",
    rollNumber: "21CS048",
    branch: "CSE",
    type: "resume",
    fileName: "arjun_mehta_resume.pdf",
    fileSize: "245 KB",
    status: "verified",
    uploadedAt: "2026-08-01T10:00:00Z",
    verifiedAt: "2026-08-02T11:00:00Z",
    remarks: "All credentials verified matching college database.",
  },
  {
    id: "doc-002",
    studentId: "stu-001",
    studentName: "Arjun Mehta",
    rollNumber: "21CS048",
    branch: "CSE",
    type: "marksheet",
    fileName: "sem6_marksheet.pdf",
    fileSize: "1.2 MB",
    status: "pending",
    uploadedAt: "2026-08-03T15:30:00Z",
  },
  {
    id: "doc-003",
    studentId: "stu-21CS012",
    studentName: "Pooja Hegde",
    rollNumber: "21CS012",
    branch: "CSE",
    type: "resume",
    fileName: "pooja_hegde_resume_v2.pdf",
    fileSize: "189 KB",
    status: "pending",
    uploadedAt: "2026-08-03T16:00:00Z",
  },
  {
    id: "doc-004",
    studentId: "stu-21IS045",
    studentName: "Rahul Verma",
    rollNumber: "21IS045",
    branch: "ISE",
    type: "certificate",
    fileName: "cloud_computing_nptel.pdf",
    fileSize: "512 KB",
    status: "rejected",
    uploadedAt: "2026-08-02T09:00:00Z",
    remarks: "The certificate certificate does not list your grade. Please upload the full grade sheet.",
    verifiedAt: "2026-08-02T14:00:00Z",
  }
];

// ── Mock Calendar Events ──────────────────────────────────────

export const mockCalendarEvents: CalendarEvent[] = [
  {
    id: "evt-001",
    title: "TCS NQT — Online Assessment",
    type: "assessment",
    date: "2026-07-30",
    time: "10:00 AM",
    durationMins: 120,
    company: "Tata Consultancy Services",
    driveId: "drv-006",
    description: "National Qualifier Test for TCS Digital hiring.",
    location: "Online — iON Assessment Portal",
    targetRole: "both",
  },
  {
    id: "evt-002",
    title: "Deloitte Aptitude Test",
    type: "assessment",
    date: "2026-08-05",
    time: "09:00 AM",
    durationMins: 90,
    company: "Deloitte",
    driveId: "drv-004",
    description: "Quantitative, Logical Reasoning, and Verbal Aptitude test.",
    location: "Computer Center Lab 1 & 2",
    targetRole: "both",
  },
  {
    id: "evt-003",
    title: "Deloitte Group Discussion",
    type: "placement-event",
    date: "2026-08-08",
    time: "02:00 PM",
    durationMins: 60,
    company: "Deloitte",
    driveId: "drv-004",
    description: "Shortlisted candidates from Aptitude test participate in case-study GDs.",
    location: "Seminar Hall B",
    targetRole: "both",
  },
  {
    id: "evt-004",
    title: "Deloitte Offer Acceptance Deadline",
    type: "offer-deadline",
    date: "2026-08-10",
    time: "11:59 PM",
    company: "Deloitte",
    driveId: "drv-004",
    description: "Final date for extended candidates to upload verified offer acceptance.",
    location: "PlaceMe Portal",
    targetRole: "student",
  },
  {
    id: "evt-005",
    title: "TCS Application Deadline",
    type: "offer-deadline",
    date: "2026-08-12",
    time: "11:59 PM",
    company: "Tata Consultancy Services",
    driveId: "drv-006",
    description: "Registration deadline for TCS Systems Engineer role.",
    location: "PlaceMe Portal",
    targetRole: "student",
  },
  {
    id: "evt-006",
    title: "Microsoft Application Deadline",
    type: "offer-deadline",
    date: "2026-08-15",
    time: "11:59 PM",
    company: "Microsoft",
    driveId: "drv-002",
    description: "Last day to apply for Microsoft Software Engineer position.",
    location: "PlaceMe Portal",
    targetRole: "student",
  },
  {
    id: "evt-007",
    title: "Microsoft Online Coding Round",
    type: "assessment",
    date: "2026-08-18",
    time: "02:00 PM",
    durationMins: 90,
    company: "Microsoft",
    driveId: "drv-002",
    description: "3 algorithmic coding problems on Codility platform.",
    location: "Online — Codility link sent via email",
    targetRole: "both",
  },
  {
    id: "evt-008",
    title: "Google Campus Drive Arrival",
    type: "campus-drive",
    date: "2026-08-20",
    time: "09:30 AM",
    company: "Google",
    driveId: "drv-001",
    description: "Google HR & Technical recruitment team campus visit and briefing.",
    location: "Auditorium Main Complex",
    targetRole: "faculty",
  },
  {
    id: "evt-009",
    title: "Google Online Assessment",
    type: "assessment",
    date: "2026-08-22",
    time: "10:00 AM",
    durationMins: 120,
    company: "Google",
    driveId: "drv-001",
    description: "HackerRank OA for SDE Intern candidates.",
    location: "Online",
    targetRole: "both",
  },
  {
    id: "evt-010",
    title: "Microsoft Technical Interview",
    type: "interview",
    date: "2026-08-25",
    time: "11:00 AM",
    durationMins: 45,
    company: "Microsoft",
    driveId: "drv-002",
    description: "1-on-1 Data Structures & Algorithms virtual interview.",
    location: "Microsoft Teams (Link in portal)",
    targetRole: "student",
  },
  {
    id: "evt-011",
    title: "Pre-Placement Talk — Atlassian",
    type: "placement-event",
    date: "2026-08-26",
    time: "04:00 PM",
    durationMins: 90,
    company: "Atlassian",
    driveId: "drv-005",
    description: "Company overview, engineering culture, and QA session with Atlassian engineers.",
    location: "Virtual — Zoom Webinar",
    targetRole: "both",
  },
  {
    id: "evt-012",
    title: "Razorpay Online Assessment",
    type: "assessment",
    date: "2026-08-28",
    time: "10:00 AM",
    durationMins: 105,
    company: "Razorpay",
    driveId: "drv-003",
    description: "Backend engineering coding screen and SQL challenge.",
    location: "Online — DoSelect Platform",
    targetRole: "both",
  },
  {
    id: "evt-013",
    title: "Atlassian Application Deadline",
    type: "offer-deadline",
    date: "2026-08-30",
    time: "11:59 PM",
    company: "Atlassian",
    driveId: "drv-005",
    description: "Registration deadline for Frontend Engineer drive.",
    location: "PlaceMe Portal",
    targetRole: "student",
  },
];

// ── Mock Offer Letters ────────────────────────────────────────

export const mockOfferLetters: OfferLetter[] = [
  {
    id: "off-001",
    studentId: "stu-001",
    studentName: "Arjun Mehta",
    rollNumber: "21CS048",
    branch: "CSE",
    driveId: "drv-002",
    companyName: "Microsoft",
    role: "Software Engineer",
    packageLPA: 42,
    location: "Bengaluru, India",
    offerDate: "2026-07-28T00:00:00Z",
    joiningDate: "2026-09-01T00:00:00Z",
    status: "verified",
    fileName: "microsoft_offer_arjun.pdf",
    fileSize: "1.4 MB",
    uploadedAt: "2026-07-29T10:00:00Z",
    verifiedAt: "2026-07-30T14:00:00Z",
    remarks: "Official offer letter verified with Microsoft HR coordinator.",
  },
  {
    id: "off-002",
    studentId: "stu-001",
    studentName: "Arjun Mehta",
    rollNumber: "21CS048",
    branch: "CSE",
    driveId: "drv-006",
    companyName: "Tata Consultancy Services",
    role: "Systems Engineer",
    packageLPA: 7,
    location: "Hyderabad, India",
    offerDate: "2026-07-25T00:00:00Z",
    joiningDate: "2026-08-15T00:00:00Z",
    status: "declined",
    fileName: "tcs_offer_arjun.pdf",
    fileSize: "680 KB",
    uploadedAt: "2026-07-26T11:00:00Z",
  },
  {
    id: "off-003",
    studentId: "stu-21CS012",
    studentName: "Pooja Hegde",
    rollNumber: "21CS012",
    branch: "CSE",
    driveId: "drv-003",
    companyName: "Razorpay",
    role: "Backend Engineer",
    packageLPA: 28,
    location: "Bengaluru, India",
    offerDate: "2026-08-01T00:00:00Z",
    joiningDate: "2026-09-15T00:00:00Z",
    status: "received",
  },
  {
    id: "off-004",
    studentId: "stu-21IS045",
    studentName: "Rahul Verma",
    rollNumber: "21IS045",
    branch: "ISE",
    driveId: "drv-004",
    companyName: "Deloitte",
    role: "Analyst — Tech Consulting",
    packageLPA: 12,
    location: "Mumbai, India",
    offerDate: "2026-07-30T00:00:00Z",
    joiningDate: "2026-09-01T00:00:00Z",
    status: "accepted",
    fileName: "deloitte_offer_rahul.pdf",
    fileSize: "920 KB",
    uploadedAt: "2026-08-01T09:00:00Z",
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

/** Get applications submitted by a specific student */
export function getApplicationsForStudent(
  applications: Application[],
  studentId: string
): Application[] {
  return applications.filter((a) => a.studentId === studentId);
}

/** Get applications for a specific drive */
export function getApplicationsForDrive(
  applications: Application[],
  driveId: string
): Application[] {
  return applications.filter((a) => a.driveId === driveId);
}

