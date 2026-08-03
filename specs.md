# PS-1: Smart Placement & Career Tracking Portal
## Technical Specification Sheet

---

## 1. Problem Statement

Placement information at most colleges is scattered across Google Forms, WhatsApp groups, emails, and spreadsheets. This makes it hard for the Training & Placement Cell (TPC) and faculty coordinators to maintain accurate, real-time records of student applications, interview progress, and document verification.

**Goal:** Build a centralized web/mobile application where students can manage their placement journey end-to-end, and faculty/TPC can monitor statistics, verify documents, and generate reports from a single dashboard.

---

## 2. Proposed Solution — Overview

A unified platform with two user roles — **Student** and **Faculty/TPC Admin** — built around four pillars:

1. **Centralized Drive Management** — single source of truth for all placement drives
2. **End-to-end Application Tracking** — from applying to final offer, round by round
3. **Blockchain-backed Credential Verification** — tamper-proof, faculty-attested student records
4. **AI-powered Preparation Assistant** — resume analysis, company research, and round-specific coaching

---

## 3. User Roles

| Role | Access |
|---|---|
| **Student** | Login via college credentials, view/apply to drives, track application/round status, use AI tools, view verified credential badge |
| **Faculty / TPC Admin** | Post drives, view real-time analytics, verify/approve student documents & credentials, generate reports |

---

## 4. Core Modules

### 4.1 Authentication & Onboarding
- Login via institutional credentials (college email/roll number + SSO or LDAP integration, if available)
- Role-based access control (Student vs Faculty/Admin)
- One-time profile setup: academic details, resume upload, skill tags

### 4.2 Placement Drive Dashboard (Student-facing)
- List of all active drives posted by TPC — company name, role, eligibility criteria, CTC, deadline
- Filter/sort by eligibility, package, role type, deadline
- One-click "Apply" (validates eligibility automatically against student profile)

### 4.3 Application & Round Tracking
- Per-drive pipeline view: Applied → Shortlisted → Round 1 → Round 2 → ... → Offer/Reject
- Status updates pushed by faculty/admin (manual update or bulk CSV upload)
- Notifications on status change
- Personal dashboard aggregating all active applications across companies

### 4.4 Blockchain-based Credential Verification
- Student academic/document records (marksheets, certificates, resume) hashed and stored on-chain (or anchored via a permissioned ledger such as Hyperledger Fabric / Polygon testnet for a hackathon-scale build)
- Faculty acts as the **verifying authority** — digitally signs/attests a record, which is then written immutably
- Verified badge shown on student profile — recruiters/faculty can confirm authenticity without re-checking paperwork
- Prevents tampering of academic history or fake credential claims

### 4.5 AI Suite

**a) Resume Analyzer**
- Parses uploaded resume (PDF/DOCX)
- Scores against ATS-friendliness, formatting, keyword match for a target role
- Suggests specific edits (missing skills, weak bullet points, formatting issues)

**b) Company Research Assistant**
- Given a company + role the student applied to, auto-generates a briefing: company overview, recent news, tech stack/domain focus, interview process patterns (from public data), culture notes

**c) Round-wise Preparation Coach**
- Based on which round the student is currently in (OA, technical, HR, etc.), suggests targeted prep material — topic checklist, likely question types, curated practice resources
- Can optionally pull from a repository of past interview experiences (alumni-submitted) for that specific company/role

---

## 5. Suggested Additions (to strengthen the pitch)

These aren't in your original list but are cheap to add and make the platform feel more complete for judges:

- **Faculty analytics dashboard** — placement % by branch, package trends, drive-wise conversion funnel, exportable reports (PDF/Excel)
- **Alumni interview-experience repository** — crowdsourced, feeds the AI prep coach
- **Notification system** — email/push alerts for new drives, deadlines, round updates
- **Calendar integration** — sync interview dates to Google Calendar
- **Offer letter management** — students upload/confirm offers; auto-updates placement stats
- **Leaderboard/gamification** (optional) — resume score, prep completion streaks

---

## 6. Suggested Tech Stack

Frontend	Next.js (React, TypeScript) — App Router
Backend	Next.js API Routes / Route Handlers (no separate backend)
ORM	Prisma
Database	Supabase (Postgres)
Auth	Supabase Auth (JWT)
File Storage	Supabase Storage (resumes, certificates)
AI	Anthropic SDK (@anthropic-ai/sdk) — resume analyzer, company research, prep coach
Resume Parsing	pdf-parse (PDF), mammoth (DOCX)
Blockchain	Testnet hash-anchoring (Polygon Mumbai) — simplified proof-of-concept, not full Hyperledger Fabric
Deployment	Vercel

---

## 7. High-Level System Architecture

```
[Student App] ── [API Gateway] ── [Auth Service]
                        │
        ┌───────────────┼───────────────┐
        │               │               │
 [Drive & Application] [AI Service]  [Blockchain Service]
   Service (CRUD)      (Resume/       (Credential hash +
        │              Research/       faculty attestation)
        │              Prep Coach)          │
        └──────► [PostgreSQL] ◄─────────────┘
                        │
                [Faculty Admin Dashboard]
```

---

## 8. Core User Journey (Student)

1. Login with college credentials → profile setup
2. Browse drives → apply to eligible ones
3. Get shortlisted → track round-by-round status
4. Before each round → open AI Prep Coach for that round + company research brief
5. Upload resume once → AI Analyzer gives continuous feedback
6. On offer → faculty verifies credentials/offer via blockchain-backed record → student profile marked "Verified & Placed"

---

## 9. Evaluation / Demo Priorities (for hackathon judging)

Given time constraints, prioritize a working demo in this order:
1. Auth + Drive listing + Apply flow (core CRUD)
2. Round tracking dashboard (student + faculty views)
3. One working AI feature end-to-end (Resume Analyzer is the most demo-friendly)
4. A simplified blockchain proof-of-concept (even a single hash-anchoring transaction on a testnet is enough to show the concept)
5. Company research + round prep as a stretch goal if time permits
