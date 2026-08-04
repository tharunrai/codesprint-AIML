"use server";

import { PrismaClient, DocumentType } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export async function getStudentProfileAndCredentials() {
  let student = null;

  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      student = await prisma.studentProfile.findUnique({
        where: { userId: user.id },
        include: { user: true },
      });
    }
  } catch (e) {
    console.warn("Supabase auth check failed in getStudentProfileAndCredentials:", e);
  }

  // Fallback to first student in DB
  if (!student) {
    student = await prisma.studentProfile.findFirst({
      include: { user: true },
    });
  }

  if (!student) {
    return { student: null, credentials: [] };
  }

  const credentials = await prisma.credential.findMany({
    where: { studentId: student.id },
    orderBy: { createdAt: "desc" },
  });

  return {
    student: {
      id: student.id,
      rollNumber: student.rollNumber,
      branch: student.branch,
      fullName: student.user.fullName,
    },
    credentials,
  };
}

export async function createCredentialBundle(
  items: { docType: DocumentType; fileUrl: string; fileHash: string }[]
) {
  let studentId: string | null = null;

  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const student = await prisma.studentProfile.findUnique({
        where: { userId: user.id },
      });
      if (student) {
        studentId = student.id;
      }
    }
  } catch (e) {
    console.warn("Auth check failed in createCredentialBundle:", e);
  }

  if (!studentId) {
    const demoStudent = await prisma.studentProfile.findFirst();
    if (demoStudent) {
      studentId = demoStudent.id;
    }
  }

  if (!studentId) {
    throw new Error("Student profile not found. Please log in.");
  }

  const createdCredentials = await prisma.$transaction(
    items.map((item) =>
      prisma.credential.create({
        data: {
          studentId: studentId!,
          docType: item.docType,
          fileUrl: item.fileUrl,
          fileHash: item.fileHash,
          status: "PENDING",
        },
      })
    )
  );

  revalidatePath("/credentials");
  return createdCredentials;
}

export async function createCredential(data: {
  docType: DocumentType;
  fileUrl: string;
  fileHash: string;
}) {
  return (await createCredentialBundle([data]))[0];
}

export async function getStudentCredentials() {
  const { credentials } = await getStudentProfileAndCredentials();
  return credentials;
}

export async function getBundleVerificationDetails(identifier: string) {
  // Try finding by studentId first
  let student = await prisma.studentProfile.findUnique({
    where: { id: identifier },
    include: { user: true },
  });

  // Try finding by single credential eduId or credential id
  if (!student) {
    const singleCred = await prisma.credential.findFirst({
      where: {
        OR: [{ id: identifier }, { eduId: identifier }],
      },
      include: {
        student: {
          include: { user: true },
        },
      },
    });
    if (singleCred) {
      student = singleCred.student;
    }
  }

  // Fallback to first student if not found
  if (!student) {
    student = await prisma.studentProfile.findFirst({
      include: { user: true },
    });
  }

  if (!student) {
    return null;
  }

  const credentials = await prisma.credential.findMany({
    where: { studentId: student.id },
    orderBy: { createdAt: "desc" },
  });

  return {
    student: {
      id: student.id,
      rollNumber: student.rollNumber,
      branch: student.branch,
      fullName: student.user.fullName,
      email: student.user.email,
    },
    credentials,
  };
}

export async function getAllCredentials() {
  const credentials = await prisma.credential.findMany({
    include: {
      student: {
        include: { user: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return credentials.map((c) => ({
    id: c.id,
    studentId: c.studentId,
    studentName: c.student.user.fullName,
    rollNumber: c.student.rollNumber,
    branch: c.student.branch,
    type: c.docType.toLowerCase(),
    fileName: (c as any).fileName || "document.pdf",
    fileSize: (c as any).fileSize || "Unknown size",
    status: c.status.toLowerCase(),
    uploadedAt: c.createdAt.toISOString(),
    remarks: c.revokedReason || "",
    verifiedAt: c.updatedAt.toISOString(),
  }));
}

export async function updateCredentialStatus(id: string, status: "VERIFIED" | "REJECTED", remarks?: string) {
  const updated = await prisma.credential.update({
    where: { id },
    data: {
      status,
      revokedReason: remarks,
    },
  });
  revalidatePath("/faculty/documents");
  return updated;
}
