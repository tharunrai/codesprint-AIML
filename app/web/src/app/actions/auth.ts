"use server";

import { PrismaClient, Role } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export async function syncPrismaUser(supabaseUser: { id: string; email: string }, role: Role, name: string) {
  // Ensure the user exists in Prisma
  let user = await prisma.user.findUnique({
    where: { supabaseUid: supabaseUser.id },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        supabaseUid: supabaseUser.id,
        email: supabaseUser.email,
        fullName: name,
        role: role,
      },
    });

    if (role === "STUDENT") {
      await prisma.studentProfile.create({
        data: {
          userId: user.id,
          rollNumber: "STU-" + Math.floor(Math.random() * 10000),
          graduationYear: 2026,
          branch: "Computer Science",
        },
      });
    } else {
      await prisma.facultyProfile.create({
        data: {
          userId: user.id,
          department: "Computer Science",
        },
      });
    }
  }

  return user;
}

export async function seedTestUsers() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const testUsers = [
    {
      email: "student@example.com",
      password: "password123",
      role: "STUDENT",
      name: "Test Student",
    },
    {
      email: "faculty@example.com",
      password: "password123",
      role: "FACULTY",
      name: "Test Faculty",
    },
  ];

  const results = [];

  for (const tu of testUsers) {
    // 1. Check if user already exists in Prisma DB
    const existingUser = await prisma.user.findUnique({
      where: { email: tu.email },
    });

    if (existingUser) {
      results.push(`User ${tu.email} already exists in DB.`);
      continue;
    }

    // 2. Create user in Supabase Auth
    // Because we don't have the service_role key, we will use signUp.
    // NOTE: This assumes Email Confirmation is disabled in Supabase!
    const { data, error } = await supabase.auth.signUp({
      email: tu.email,
      password: tu.password,
    });

    if (error || !data.user) {
      results.push(`Failed to sign up ${tu.email} in Supabase: ${error?.message}`);
      continue;
    }

    // 3. Create user in Prisma DB, mapped to Supabase ID
    try {
      const newUser = await prisma.user.create({
        data: {
          supabaseUid: data.user.id,
          email: tu.email,
          fullName: tu.name,
          role: tu.role as any,
        },
      });

      // 4. Create related profile
      if (tu.role === "STUDENT") {
        await prisma.studentProfile.create({
          data: {
            userId: newUser.id,
            rollNumber: "STU-001",
            branch: "Computer Science",
            graduationYear: 2026,
            cgpa: 8.5,
          },
        });
      } else if (tu.role === "FACULTY") {
        await prisma.facultyProfile.create({
          data: {
            userId: newUser.id,
            department: "Computer Science",
          },
        });
      }

      results.push(`Successfully seeded ${tu.email}`);
    } catch (dbError: any) {
      results.push(`Failed to seed DB for ${tu.email}: ${dbError.message}`);
    }
  }
  
  // Since we called signUp, Supabase automatically logs in as the last created user.
  // Let's sign out to ensure a clean state for the actual user testing.
  await supabase.auth.signOut();

  return results;
}
