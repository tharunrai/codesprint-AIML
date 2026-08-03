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

export async function createCredential(data: {
  docType: DocumentType;
  fileUrl: string;
  fileHash: string;
}) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Authenticate user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  // Get student profile
  const student = await prisma.studentProfile.findUnique({
    where: { userId: user.id },
  });

  if (!student) {
    throw new Error("Student profile not found");
  }

  // Create credential record in DB
  const credential = await prisma.credential.create({
    data: {
      studentId: student.id,
      docType: data.docType,
      fileUrl: data.fileUrl,
      fileHash: data.fileHash,
      status: "PENDING", // Initial status awaiting institute verification
    },
  });

  // Revalidate the credentials page
  revalidatePath("/credentials");

  return credential;
}

export async function getStudentCredentials() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const student = await prisma.studentProfile.findUnique({
    where: { userId: user.id },
  });

  if (!student) {
    return [];
  }

  // Fetch all credentials for this student, ordered by newest first
  const credentials = await prisma.credential.findMany({
    where: { studentId: student.id },
    orderBy: { createdAt: "desc" },
  });

  return credentials;
}
