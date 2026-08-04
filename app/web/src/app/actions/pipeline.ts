"use server";

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { getUser } from "@/utils/supabase/server";

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const AGENT_URL = process.env.AGENT_URL || "http://127.0.0.1:8000";

export async function buildProfile(studentId: string) {
  // 1. Fetch raw data from Prisma
  const student = await prisma.studentProfile.findUnique({
    where: { id: studentId },
    include: { credentials: true },
  });

  if (!student) throw new Error("Student not found");

  // 2. Call Python Agent
  const res = await fetch(`${AGENT_URL}/api/pipeline/build-profile`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ student_data: student }),
  });

  if (!res.ok) throw new Error("Failed to build profile");
  const verifiedProfile = await res.json();

  // 3. Save to DB
  await prisma.studentProfile.update({
    where: { id: studentId },
    data: { verifiedProfile },
  });

  return verifiedProfile;
}

export async function matchJobs(studentId: string) {
  // 1. Get profile (build if missing)
  let student = await prisma.studentProfile.findUnique({ where: { id: studentId } });
  if (!student) throw new Error("Student not found");
  
  if (!student.verifiedProfile) {
    student.verifiedProfile = await buildProfile(studentId) as any;
  }

  // 2. Get open drives
  const drives = await prisma.drive.findMany({
    where: { deadline: { gt: new Date() } }
  });

  // 3. Call Python Agent
  const res = await fetch(`${AGENT_URL}/api/pipeline/match-jobs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ profile: student.verifiedProfile, drives }),
  });

  if (!res.ok) throw new Error("Failed to match jobs");
  const matchResult = await res.json();
  
  return matchResult.matches; // array of matches
}

export async function draftApplication(driveId: string, studentId: string) {
  // 1. Fetch data
  const student = await prisma.studentProfile.findUnique({ where: { id: studentId } });
  const drive = await prisma.drive.findUnique({ where: { id: driveId } });
  
  if (!student || !drive) throw new Error("Student or Drive not found");
  if (!student.verifiedProfile) {
      student.verifiedProfile = await buildProfile(studentId) as any;
  }

  // 2. Call Python Agent
  const res = await fetch(`${AGENT_URL}/api/pipeline/draft-application`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      student_id: studentId,
      profile: student.verifiedProfile,
      drive
    }),
  });

  if (!res.ok) throw new Error("Failed to draft application");
  const draft = await res.json();

  // 3. Save as PENDING_REVIEW in DB
  const application = await prisma.application.upsert({
    where: { studentId_driveId: { studentId, driveId } },
    update: { status: "PENDING_REVIEW" as any },
    create: {
      studentId,
      driveId,
      status: "PENDING_REVIEW" as any,
    },
  });

  // Optionally trigger notification generation here
  // fetch(`${AGENT_URL}/api/pipeline/notification`, ...)

  return { draft, application };
}

export async function confirmApplication(applicationId: string) {
  const application = await prisma.application.update({
    where: { id: applicationId },
    data: { status: "APPLIED" as any },
  });

  return application;
}
