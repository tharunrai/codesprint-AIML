"use server";

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { OfferLetter } from "@/lib/types";

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export async function getStudentOffers(userId: string): Promise<OfferLetter[]> {
  const student = await prisma.studentProfile.findUnique({
    where: { userId },
  });
  if (!student) return [];

  const applications = await prisma.application.findMany({
    where: {
      studentId: student.id,
      status: "OFFERED"
    },
    include: {
      drive: true
    }
  });

  return applications.map(app => ({
    id: app.id,
    studentId: userId,
    companyName: app.drive.companyName,
    role: app.drive.role,
    packageLPA: app.drive.ctc || 0,
    location: "Remote/Office", 
    offerDate: app.updatedAt.toISOString(),
    status: "verified", 
  }));
}

export async function getAllOffers(): Promise<OfferLetter[]> {
  const applications = await prisma.application.findMany({
    where: {
      status: "OFFERED"
    },
    include: {
      drive: true,
      student: {
        include: {
          user: true
        }
      }
    }
  });

  return applications.map(app => ({
    id: app.id,
    studentId: app.student.userId,
    studentName: app.student.user.fullName,
    rollNumber: app.student.rollNumber,
    branch: app.student.branch,
    companyName: app.drive.companyName,
    role: app.drive.role,
    packageLPA: app.drive.ctc || 0,
    location: "Remote/Office",
    offerDate: app.updatedAt.toISOString(),
    status: "verified",
  }));
}

export async function updateOfferStatus(applicationId: string, newStatus: string) {
  return { success: true };
}
