export type ApplicationStage =
  | "pending_review"
  | "applied"
  | "shortlisted"
  | "round-1"
  | "round-2"
  | "round-3"
  | "offered"
  | "rejected"
  | "withdrawn";

export interface Drive {
  id: string;
  companyName: string;
  companyLogoUrl?: string;
  role: string;
  description: string;
  ctcLakh: number;
  ctcBreakdown?: string;
  roleType: "Full-time" | "Internship" | "PPO";
  eligibility: {
    minCgpa: number;
    branches: string[];
    maxBacklogs: number;
  };
  deadline: string;
  postedDate: string;
  status: "open" | "closed" | "ongoing";
  rounds: RoundInfo[];
  registeredCount: number;
}

export interface RoundInfo {
  id: string;
  name: string;
  type: string;
  order: number;
  scheduledDate?: string;
}

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

export type OfferStatus = "received" | "uploaded" | "verified" | "accepted" | "declined";

export interface OfferLetter {
  id: string;
  studentId: string;
  studentName?: string;
  rollNumber?: string;
  branch?: string;
  driveId?: string;
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

export type DocumentType = "resume" | "marksheet" | "certificate" | "other";
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


