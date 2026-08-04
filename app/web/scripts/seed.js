require('dotenv').config();
require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding minimal required mock data...');

  // Create a mock Drive if none exist
  const existingDrives = await prisma.drive.findMany();
  let drive;
  
  if (existingDrives.length === 0) {
    let facultyUser = await prisma.user.findFirst({ where: { role: 'FACULTY' } });
    if (!facultyUser) {
      facultyUser = await prisma.user.create({
        data: {
          email: 'faculty@example.com',
          supabaseUid: 'mock-faculty-uid',
          fullName: 'Prof. Sharma',
          role: 'FACULTY',
        }
      });
    }

    drive = await prisma.drive.create({
      data: {
        companyName: 'Infosys',
        role: 'Systems Engineer',
        description: 'Hiring from 2026 batch.',
        ctc: 3.6,
        minCgpa: 6.0,
        maxBacklogs: 0,
        eligibleBranches: ['CSE', 'ISE', 'ECE'],
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        postedById: facultyUser.id,
        rounds: {
          create: [
            { name: 'Online Assessment', sequence: 1, type: 'APTITUDE', scheduledAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) }
          ]
        }
      },
      include: { rounds: true }
    });
    console.log(`Created mock Drive: ${drive.companyName}`);
  } else {
    drive = existingDrives[0];
    console.log(`Drive already exists: ${drive.companyName}`);
  }

  // Create a mock Student Application if none exist
  const existingApps = await prisma.application.findMany();
  
  if (existingApps.length === 0) {
    let studentUser = await prisma.user.findFirst({ where: { role: 'STUDENT' } });
    if (!studentUser) {
      studentUser = await prisma.user.create({
        data: {
          email: 'student@example.com',
          supabaseUid: 'mock-student-uid',
          fullName: 'Rahul Kumar',
          role: 'STUDENT',
        }
      });
    }

    let studentProfile = await prisma.studentProfile.findUnique({ where: { userId: studentUser.id } });
    if (!studentProfile) {
      studentProfile = await prisma.studentProfile.create({
        data: {
          userId: studentUser.id,
          rollNumber: '1MS20CS001',
          branch: 'CSE',
          graduationYear: 2024,
          cgpa: 8.5,
          skills: ['React', 'Node.js']
        }
      });
    }

    const app = await prisma.application.create({
      data: {
        driveId: drive.id,
        studentId: studentProfile.id,
        status: 'APPLIED'
      }
    });

    console.log(`Created mock Application for ${studentUser.fullName}`);
  } else {
    console.log(`Application already exists.`);
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
