"use server";

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export async function getApplications() {
  const applications = await prisma.application.findMany({
    include: {
      drive: {
        include: { rounds: { orderBy: { sequence: "asc" } } },
      },
      student: {
        include: { user: true },
      },
      roundUpdates: true,
    },
    orderBy: { appliedAt: "desc" },
  });

  return applications.map((a) => {
    // Determine the current stage based on the latest round updates
    let currentStage = a.status.toLowerCase();
    if (a.status === "APPLIED") currentStage = "applied";
    else if (a.status === "SHORTLISTED") currentStage = "shortlisted";
    else if (a.status === "IN_PROGRESS") {
      const lastRound = a.roundUpdates[a.roundUpdates.length - 1];
      if (lastRound) {
        const roundNum = a.drive.rounds.find((r) => r.id === lastRound.driveRoundId)?.sequence;
        currentStage = `round-${roundNum}`;
      }
    } else if (a.status === "OFFERED") currentStage = "offered";
    else if (a.status === "REJECTED") currentStage = "rejected";
    else if (a.status === "WITHDRAWN") currentStage = "withdrawn";

    const roundResults = a.drive.rounds.map((r) => {
      const update = a.roundUpdates.find((ru) => ru.driveRoundId === r.id);
      return {
        roundName: r.name,
        status: update ? update.status.toLowerCase() : "upcoming",
        date: update?.createdAt.toISOString(),
      };
    });

    return {
      id: a.id,
      driveId: a.drive.id,
      companyName: a.drive.companyName,
      role: a.drive.role,
      studentId: a.student.id,
      studentName: a.student.user.fullName,
      rollNumber: a.student.rollNumber,
      branch: a.student.branch,
      cgpa: a.student.cgpa || 0,
      email: a.student.user.email,
      currentStage: currentStage as any, // casting to ApplicationStage
      appliedDate: a.appliedAt.toISOString(),
      lastUpdated: a.updatedAt.toISOString(),
      roundResults: roundResults as any[],
    };
  });
}
