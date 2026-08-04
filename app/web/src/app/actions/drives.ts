"use server";

import { PrismaClient, Drive, RoundType } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export async function getDrives() {
  const drives = await prisma.drive.findMany({
    include: {
      rounds: {
        orderBy: { sequence: "asc" },
      },
      postedBy: {
        include: { user: true },
      },
      applications: true,
    },
    orderBy: { deadline: "asc" },
  });

  return drives.map((d) => ({
    id: d.id,
    companyName: d.companyName,
    role: d.role,
    description: d.description || "",
    ctcLakh: d.ctc || 0,
    roleType: "Full-time", // hardcoded mapping for now
    eligibility: {
      minCgpa: d.minCgpa || 0,
      branches: d.eligibleBranches,
      maxBacklogs: d.maxBacklogs || 0,
    },
    deadline: d.deadline.toISOString(),
    postedDate: d.createdAt.toISOString(),
    status: d.deadline > new Date() ? "open" : "closed",
    rounds: d.rounds.map((r) => ({
      id: r.id,
      name: r.name,
      type: r.type,
      order: r.sequence,
      scheduledDate: r.scheduledAt?.toISOString(),
    })),
    registeredCount: d.applications.length,
  }));
}

export async function getDriveById(id: string) {
  const d = await prisma.drive.findUnique({
    where: { id },
    include: {
      rounds: {
        orderBy: { sequence: "asc" },
      },
      postedBy: {
        include: { user: true },
      },
      applications: true,
    },
  });

  if (!d) return null;

  return {
    id: d.id,
    companyName: d.companyName,
    role: d.role,
    description: d.description || "",
    ctcLakh: d.ctc || 0,
    roleType: "Full-time",
    eligibility: {
      minCgpa: d.minCgpa || 0,
      branches: d.eligibleBranches,
      maxBacklogs: d.maxBacklogs || 0,
    },
    deadline: d.deadline.toISOString(),
    postedDate: d.createdAt.toISOString(),
    status: d.deadline > new Date() ? "open" : "closed",
    rounds: d.rounds.map((r) => ({
      id: r.id,
      name: r.name,
      type: r.type,
      order: r.sequence,
      scheduledDate: r.scheduledAt?.toISOString(),
    })),
    registeredCount: d.applications.length,
  };
}

export async function updateDriveStatus(driveId: string, status: "open" | "closed" | "ongoing") {
  const d = await prisma.drive.findUnique({ where: { id: driveId } });
  if (!d) throw new Error("Drive not found");
  
  // Actually mapped to a realistic update in Prisma
  // We don't have a status field in the schema, it's inferred from deadline
  if (status === "closed") {
    await prisma.drive.update({
      where: { id: driveId },
      data: { deadline: new Date(Date.now() - 1000) } // Set deadline to past
    });
  } else {
    await prisma.drive.update({
      where: { id: driveId },
      data: { deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) } // +1 week
    });
  }
}

export async function createDrive(data: any, facultyUserId: string) {
  const faculty = await prisma.facultyProfile.findUnique({
    where: { userId: facultyUserId }
  });
  
  if (!faculty) throw new Error("Faculty profile not found");

  const newDrive = await prisma.drive.create({
    data: {
      companyName: data.companyName,
      role: data.role,
      description: data.description,
      ctc: data.ctcLakh,
      minCgpa: data.eligibility.minCgpa,
      maxBacklogs: data.eligibility.maxBacklogs,
      eligibleBranches: data.eligibility.branches,
      deadline: new Date(data.deadline),
      postedById: faculty.id,
      rounds: {
        create: data.rounds.map((r: any, idx: number) => ({
          name: r.name,
          sequence: idx + 1,
          type: "TECHNICAL", // simplified
          scheduledAt: r.scheduledDate ? new Date(r.scheduledDate) : null
        }))
      }
    }
  });

  return newDrive.id;
}
