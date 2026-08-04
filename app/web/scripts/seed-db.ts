import { PrismaClient, Role, ApplicationStatus, RoundType } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env.local") });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is required");
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function seed() {
  console.log("Seeding Database...");

  // 1. Create or ensure profiles for our seeded Supabase users
  // We seeded these in seed-users.mjs:
  // arjun.mehta@college.edu (STUDENT)
  // priya.sharma@college.edu (FACULTY)

  // Find user records created by Supabase Auth (the trigger creates them in public.User)
  const users = await prisma.user.findMany();
  let arjunUser = users.find((u) => u.email === "arjun.mehta@college.edu");
  let priyaUser = users.find((u) => u.email === "priya.sharma@college.edu");

  if (!arjunUser || !priyaUser) {
    console.log("Users not found in DB. Did you run seed-users.mjs?");
    // create dummy users if they don't exist for some reason
    arjunUser = await prisma.user.upsert({
      where: { email: "arjun.mehta@college.edu" },
      update: {},
      create: {
        email: "arjun.mehta@college.edu",
        supabaseUid: "mock-uid-arjun",
        role: "STUDENT",
        fullName: "Arjun Mehta",
      },
    });
    priyaUser = await prisma.user.upsert({
      where: { email: "priya.sharma@college.edu" },
      update: {},
      create: {
        email: "priya.sharma@college.edu",
        supabaseUid: "mock-uid-priya",
        role: "FACULTY",
        fullName: "Dr. Priya Sharma",
      },
    });
  }

  // Create Profiles
  const student = await prisma.studentProfile.upsert({
    where: { userId: arjunUser.id },
    update: {},
    create: {
      userId: arjunUser.id,
      rollNumber: "21CS048",
      branch: "CSE",
      graduationYear: 2025,
      cgpa: 8.4,
      skills: ["React", "TypeScript", "Node.js", "Python"],
    },
  });

  const faculty = await prisma.facultyProfile.upsert({
    where: { userId: priyaUser.id },
    update: {},
    create: {
      userId: priyaUser.id,
      department: "CSE",
      isWhitelisted: true,
    },
  });

  // 2. Create Drives
  console.log("Creating Drives...");
  const googleDrive = await prisma.drive.create({
    data: {
      companyName: "Google",
      role: "SDE Intern",
      description: "Join Google's engineering team as a Software Development Engineer Intern.",
      ctc: 18,
      eligibleBranches: ["CSE", "ISE", "ECE"],
      minCgpa: 8.0,
      maxBacklogs: 0,
      deadline: new Date("2026-08-20T23:59:00Z"),
      postedById: faculty.id,
      rounds: {
        create: [
          { sequence: 1, type: "OA", name: "Online Assessment" },
          { sequence: 2, type: "TECHNICAL", name: "Technical Interview 1" },
          { sequence: 3, type: "TECHNICAL", name: "Technical Interview 2" },
          { sequence: 4, type: "HR", name: "HR Round" },
        ],
      },
    },
  });

  const microsoftDrive = await prisma.drive.create({
    data: {
      companyName: "Microsoft",
      role: "Software Engineer",
      description: "Full-time Software Engineer position at Microsoft India Development Center.",
      ctc: 42,
      eligibleBranches: ["CSE", "ISE", "ECE", "EEE"],
      minCgpa: 7.5,
      maxBacklogs: 0,
      deadline: new Date("2026-08-15T23:59:00Z"),
      postedById: faculty.id,
      rounds: {
        create: [
          { sequence: 1, type: "OA", name: "Online Coding Round" },
          { sequence: 2, type: "TECHNICAL", name: "Technical Interview" },
          { sequence: 3, type: "TECHNICAL", name: "Design Round" },
          { sequence: 4, type: "HR", name: "HR / Managerial" },
        ],
      },
    },
  });

  // 3. Create Applications
  console.log("Creating Applications...");
  await prisma.application.create({
    data: {
      studentId: student.id,
      driveId: googleDrive.id,
      status: "APPLIED",
    },
  });

  const msApp = await prisma.application.create({
    data: {
      studentId: student.id,
      driveId: microsoftDrive.id,
      status: "IN_PROGRESS",
    },
  });

  // Fetch rounds to attach updates
  const msRounds = await prisma.driveRound.findMany({ where: { driveId: microsoftDrive.id } });
  
  await prisma.roundStatusUpdate.create({
    data: {
      applicationId: msApp.id,
      driveRoundId: msRounds.find(r => r.sequence === 1)!.id,
      status: "PASSED",
      updatedById: faculty.id,
    }
  });

  // 4. Create Documents (Credentials)
  console.log("Creating Credentials...");
  await prisma.credential.create({
    data: {
      studentId: student.id,
      docType: "RESUME",
      fileUrl: "https://example.com/arjun_resume.pdf",
      fileHash: "dummy-hash-123",
      status: "PENDING",
      fileName: "arjun_mehta_resume.pdf",
      fileSize: "245 KB"
    } as any // bypass strict type if missing fileName/fileSize in schema (wait, schema doesn't have fileName/fileSize!)
  }).catch(e => {
    // schema only has docType, fileUrl, fileHash, status
    return prisma.credential.create({
      data: {
        studentId: student.id,
        docType: "RESUME",
        fileUrl: "arjun_mehta_resume.pdf",
        fileHash: "dummy-hash-123",
        status: "PENDING"
      }
    });
  });

  console.log("Database Seeded Successfully!");
  process.exit(0);
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
