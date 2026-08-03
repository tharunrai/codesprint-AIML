import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const { Pool } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env.local
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL is missing in .env.local");
  process.exit(1);
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function seedDatabase() {
  console.log("🌱 Starting Database Seeding...\n");

  try {
    // 1. Create Faculty User & Profile
    console.log("Creating Faculty user...");
    const facultyUser = await prisma.user.upsert({
      where: { email: "priya.sharma@college.edu" },
      update: {},
      create: {
        email: "priya.sharma@college.edu",
        supabaseUid: "seed-fac-priya-001",
        fullName: "Dr. Priya Sharma",
        role: "FACULTY",
        faculty: {
          create: {
            department: "Computer Science",
            isWhitelisted: true,
          },
        },
      },
      include: { faculty: true },
    });

    const facultyProfileId = facultyUser.faculty.id;
    console.log(`Faculty created: ${facultyUser.fullName} (Profile ID: ${facultyProfileId})`);

    // 2. Create Student Users & Profiles
    console.log("\nCreating Student users...");
    const studentsData = [
      {
        email: "arjun.mehta@college.edu",
        uid: "seed-stu-arjun-001",
        name: "Arjun Mehta",
        rollNumber: "21CS048",
        branch: "CSE",
        cgpa: 8.4,
        skills: ["React", "TypeScript", "Node.js", "Python", "SQL", "Docker"],
      },
      {
        email: "pooja.hegde@college.edu",
        uid: "seed-stu-pooja-002",
        name: "Pooja Hegde",
        rollNumber: "21CS012",
        branch: "CSE",
        cgpa: 9.1,
        skills: ["Java", "Spring Boot", "AWS", "PostgreSQL"],
      },
      {
        email: "rahul.verma@college.edu",
        uid: "seed-stu-rahul-003",
        name: "Rahul Verma",
        rollNumber: "21IS045",
        branch: "ISE",
        cgpa: 8.7,
        skills: ["Python", "Machine Learning", "FastAPI", "MongoDB"],
      },
      {
        email: "sneha.rao@college.edu",
        uid: "seed-stu-sneha-004",
        name: "Sneha Rao",
        rollNumber: "21EC089",
        branch: "ECE",
        cgpa: 8.2,
        skills: ["C++", "Embedded Systems", "Verilog", "Python"],
      },
    ];

    const createdStudents = [];
    for (const s of studentsData) {
      const studentUser = await prisma.user.upsert({
        where: { email: s.email },
        update: {},
        create: {
          email: s.email,
          supabaseUid: s.uid,
          fullName: s.name,
          role: "STUDENT",
          student: {
            create: {
              rollNumber: s.rollNumber,
              branch: s.branch,
              graduationYear: 2026,
              cgpa: s.cgpa,
              skills: s.skills,
            },
          },
        },
        include: { student: true },
      });
      createdStudents.push(studentUser);
      console.log(`Student created: ${studentUser.fullName}`);
    }

    // 3. Create Drives & Rounds
    console.log("\nCreating Placement Drives...");
    const drivesData = [
      {
        companyName: "Google",
        role: "SDE Intern",
        description: "Join Google's engineering team as a Software Development Engineer Intern.",
        ctc: 18,
        eligibleBranches: ["CSE", "ISE", "ECE"],
        minCgpa: 8.0,
        maxBacklogs: 0,
        deadline: new Date(Date.now() + 14 * 86400000),
        rounds: [
          { sequence: 1, type: "OA", name: "Online Assessment" },
          { sequence: 2, type: "TECHNICAL", name: "Technical Interview 1" },
          { sequence: 3, type: "TECHNICAL", name: "Technical Interview 2" },
          { sequence: 4, type: "HR", name: "HR Round" },
        ],
      },
      {
        companyName: "Microsoft",
        role: "Software Engineer",
        description: "Full-time Software Engineer position at Microsoft India Development Center.",
        ctc: 42,
        eligibleBranches: ["CSE", "ISE", "ECE", "EEE"],
        minCgpa: 7.5,
        maxBacklogs: 0,
        deadline: new Date(Date.now() + 10 * 86400000),
        rounds: [
          { sequence: 1, type: "OA", name: "Online Coding Round" },
          { sequence: 2, type: "TECHNICAL", name: "Technical Interview" },
          { sequence: 3, type: "TECHNICAL", name: "System Design Round" },
          { sequence: 4, type: "HR", name: "HR / Managerial" },
        ],
      },
      {
        companyName: "Razorpay",
        role: "Backend Engineer",
        description: "Build the payment infrastructure that powers millions of businesses in India.",
        ctc: 28,
        eligibleBranches: ["CSE", "ISE"],
        minCgpa: 7.0,
        maxBacklogs: 1,
        deadline: new Date(Date.now() + 20 * 86400000),
        rounds: [
          { sequence: 1, type: "OA", name: "Online Assessment" },
          { sequence: 2, type: "TECHNICAL", name: "Technical Interview" },
          { sequence: 3, type: "HR", name: "Culture Fit Round" },
        ],
      },
      {
        companyName: "Deloitte",
        role: "Analyst — Technology Consulting",
        description: "Join Deloitte's Technology Consulting practice.",
        ctc: 12,
        eligibleBranches: ["CSE", "ISE", "ECE", "EEE", "ME", "CE"],
        minCgpa: 6.5,
        maxBacklogs: 2,
        deadline: new Date(Date.now() + 5 * 86400000),
        rounds: [
          { sequence: 1, type: "OA", name: "Aptitude Test" },
          { sequence: 2, type: "GROUP_DISCUSSION", name: "Group Discussion" },
          { sequence: 3, type: "HR", name: "Technical + HR" },
        ],
      },
    ];

    const createdDrives = [];
    for (const d of drivesData) {
      const drive = await prisma.drive.create({
        data: {
          companyName: d.companyName,
          role: d.role,
          description: d.description,
          ctc: d.ctc,
          eligibleBranches: d.eligibleBranches,
          minCgpa: d.minCgpa,
          maxBacklogs: d.maxBacklogs,
          deadline: d.deadline,
          postedById: facultyProfileId,
          rounds: {
            create: d.rounds,
          },
        },
        include: { rounds: true },
      });
      createdDrives.push(drive);
      console.log(`Drive created: ${drive.companyName} - ${drive.role}`);
    }

    // 4. Create Applications for Arjun Mehta
    console.log("\nCreating Applications...");
    const arjunStudentId = createdStudents[0].student.id;
    const msDrive = createdDrives.find((d) => d.companyName === "Microsoft");
    const googleDrive = createdDrives.find((d) => d.companyName === "Google");

    if (msDrive) {
      await prisma.application.create({
        data: {
          studentId: arjunStudentId,
          driveId: msDrive.id,
          status: "IN_PROGRESS",
          roundUpdates: {
            create: {
              driveRoundId: msDrive.rounds[0].id,
              status: "PASSED",
              updatedById: facultyProfileId,
              notes: "Cleared coding round with 100% score.",
            },
          },
        },
      });
      console.log("Application created: Arjun Mehta -> Microsoft (In Progress)");
    }

    if (googleDrive) {
      await prisma.application.create({
        data: {
          studentId: arjunStudentId,
          driveId: googleDrive.id,
          status: "APPLIED",
        },
      });
      console.log("Application created: Arjun Mehta -> Google (Applied)");
    }

    // 5. Create Credentials for Arjun Mehta
    console.log("\nCreating Credentials...");
    await prisma.credential.create({
      data: {
        studentId: arjunStudentId,
        docType: "RESUME",
        fileUrl: "https://example.com/resumes/arjun_mehta.pdf",
        fileHash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        status: "VERIFIED",
        issuedById: facultyProfileId,
        eduId: "0x7a8b9c1d2e3f4a5b",
        txHash: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
        txStatus: "CONFIRMED",
        chainTimestamp: new Date(),
      },
    });
    console.log("Credential created: Resume for Arjun Mehta (Verified)");

    // 6. Create Notifications
    console.log("\nCreating Notifications...");
    await prisma.notification.create({
      data: {
        userId: createdStudents[0].id,
        type: "DRIVE_UPDATE",
        payload: {
          title: "Microsoft Round 1 Cleared!",
          message: "Congratulations! You have passed the Online Coding Round.",
        },
      },
    });
    console.log("Notification created for Arjun Mehta");

    console.log("\n🎉 Database Seeding Completed Successfully!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

seedDatabase();
