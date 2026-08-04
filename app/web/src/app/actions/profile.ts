"use server";

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export async function getFacultyProfile() {
  try {
    let faculty = null;

    try {
      const cookieStore = await cookies();
      const supabase = createClient(cookieStore);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        faculty = await prisma.facultyProfile.findUnique({
          where: { userId: user.id },
          include: { user: true },
        });
      }
    } catch (e) {
      console.warn("Supabase auth check in getFacultyProfile:", e);
    }

    // Fallback to first faculty in DB if specific user not found
    if (!faculty) {
      faculty = await prisma.facultyProfile.findFirst({
        include: { user: true },
      });
    }

    if (!faculty) {
      return {
        id: "mock-faculty-1",
        department: "Computer Science & Engineering",
        fullName: "Dr. Faculty Coordinator",
        email: "faculty@university.edu",
      };
    }

    return {
      id: faculty.id,
      department: faculty.department,
      fullName: faculty.user?.fullName || "Faculty Coordinator",
      email: faculty.user?.email || "faculty@university.edu",
    };
  } catch (error) {
    console.error("Database query failed in getFacultyProfile, returning fallback:", error);
    return {
      id: "mock-faculty-1",
      department: "Computer Science & Engineering",
      fullName: "Dr. Faculty Coordinator",
      email: "faculty@university.edu",
    };
  }
}

export async function getStudentProfile(userId?: string) {
  try {
    let student = null;

    if (userId) {
      student = await prisma.studentProfile.findUnique({
        where: { userId },
        include: { user: true },
      });
    }

    if (!student) {
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
        console.warn("Supabase auth check in getStudentProfile:", e);
      }
    }

    // Fallback to first student in DB if specific user not found
    if (!student) {
      student = await prisma.studentProfile.findFirst({
        include: { user: true },
      });
    }

    if (!student) {
      return {
        id: "mock-student-1",
        cgpa: 8.5,
        branch: "CSE",
        rollNumber: "21CS048",
        fullName: "Arjun Mehta",
        email: "arjun.mehta@college.edu",
      };
    }

    return {
      id: student.id,
      userId: student.userId,
      cgpa: student.cgpa ?? 8.5,
      branch: student.branch || "CSE",
      rollNumber: student.rollNumber,
      fullName: student.user?.fullName || "Arjun Mehta",
      email: student.user?.email || "arjun.mehta@college.edu",
      skills: student.skills,
    };
  } catch (error) {
    console.error("Database query failed in getStudentProfile:", error);
    return {
      id: "mock-student-1",
      cgpa: 8.5,
      branch: "CSE",
      rollNumber: "21CS048",
      fullName: "Arjun Mehta",
      email: "arjun.mehta@college.edu",
    };
  }
}
