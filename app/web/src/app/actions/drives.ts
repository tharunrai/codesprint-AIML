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
