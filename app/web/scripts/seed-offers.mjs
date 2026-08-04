import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env.local') });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL is missing in .env.local");
  process.exit(1);
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding Mock Offer Letters for Arjun Mehta...\n");

  // 1. Find Arjun's Student Profile (or create if missing)
  let studentUser = await prisma.user.findFirst({
    where: {
      OR: [
        { email: "arjun.mehta@college.edu" },
        { fullName: { contains: "Arjun", mode: "insensitive" } }
      ]
    },
    include: { student: true }
  });

  if (!studentUser || !studentUser.student) {
    console.log("Creating Arjun Mehta user & profile...");
    studentUser = await prisma.user.create({
      data: {
        email: "arjun.mehta@college.edu",
        supabaseUid: "seed-stu-arjun-001",
        fullName: "Arjun Mehta",
        role: "STUDENT",
        student: {
          create: {
            rollNumber: "21CS048",
            branch: "CSE",
            graduationYear: 2026,
            cgpa: 8.4,
            skills: ["React", "TypeScript", "Node.js", "Python", "SQL", "Docker"],
          }
        }
      },
      include: { student: true }
    });
  }

  const studentId = studentUser.student.id;
  console.log(`Found Student: ${studentUser.fullName} (ID: ${studentId})`);

  // 2. Find Faculty User for issuing
  let facultyUser = await prisma.user.findFirst({
    where: { role: "FACULTY" },
    include: { faculty: true }
  });

  if (!facultyUser || !facultyUser.faculty) {
    console.log("Creating default Faculty profile...");
    facultyUser = await prisma.user.create({
      data: {
        email: "priya.sharma@college.edu",
        supabaseUid: "seed-fac-priya-001",
        fullName: "Dr. Priya Sharma",
        role: "FACULTY",
        faculty: {
          create: {
            department: "Computer Science",
            isWhitelisted: true,
          }
        }
      },
      include: { faculty: true }
    });
  }
  const facultyProfileId = facultyUser.faculty.id;

  // 3. Create / Ensure Drives exist for Google, Microsoft, and Razorpay
  const mockOffersData = [
    {
      companyName: "Microsoft",
      role: "Software Engineer",
      description: "Full-time Software Engineer position at Microsoft India.",
      ctc: 42,
      eligibleBranches: ["CSE", "ISE", "ECE"],
      minCgpa: 7.5,
      maxBacklogs: 0,
    },
    {
      companyName: "Google",
      role: "Software Development Engineer",
      description: "Google India full-time engineering role.",
      ctc: 32,
      eligibleBranches: ["CSE", "ISE"],
      minCgpa: 8.0,
      maxBacklogs: 0,
    },
    {
      companyName: "Razorpay",
      role: "Backend Engineer",
      description: "Payment Gateway engineering team position.",
      ctc: 28,
      eligibleBranches: ["CSE", "ISE"],
      minCgpa: 7.0,
      maxBacklogs: 1,
    }
  ];

  for (const item of mockOffersData) {
    let drive = await prisma.drive.findFirst({
      where: { companyName: item.companyName, role: item.role }
    });

    if (!drive) {
      console.log(`Creating Drive for ${item.companyName}...`);
      drive = await prisma.drive.create({
        data: {
          companyName: item.companyName,
          role: item.role,
          description: item.description,
          ctc: item.ctc,
          eligibleBranches: item.eligibleBranches,
          minCgpa: item.minCgpa,
          maxBacklogs: item.maxBacklogs,
          deadline: new Date(Date.now() + 30 * 86400000),
          postedById: facultyProfileId,
        }
      });
    }

    // 4. Create/Upsert Application with status = "OFFERED"
    const application = await prisma.application.upsert({
      where: {
        studentId_driveId: {
          studentId: studentId,
          driveId: drive.id
        }
      },
      update: {
        status: "OFFERED"
      },
      create: {
        studentId: studentId,
        driveId: drive.id,
        status: "OFFERED"
      }
    });

    console.log(`✅ Offer Application updated/created for ${item.companyName} (${item.ctc} LPA)`);

    // 5. Create Credential record with docType = "OFFER_LETTER"
    const existingCred = await prisma.credential.findFirst({
      where: {
        studentId: studentId,
        docType: "OFFER_LETTER",
        fileUrl: { contains: item.companyName.toLowerCase() }
      }
    });

    if (!existingCred) {
      await prisma.credential.create({
        data: {
          studentId: studentId,
          docType: "OFFER_LETTER",
          fileUrl: `https://example.com/offers/arjun_mehta_${item.companyName.toLowerCase()}.pdf`,
          fileHash: `0x${Math.random().toString(16).substring(2)}${Math.random().toString(16).substring(2)}`,
          status: "VERIFIED",
          issuedById: facultyProfileId,
          txStatus: "CONFIRMED",
          chainTimestamp: new Date(),
        }
      });
      console.log(`📜 Offer Letter Credential created for ${item.companyName}`);
    }
  }

  console.log("\n🎉 Successfully added mock offer letters for Arjun Mehta to the database!");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding offer letters:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
