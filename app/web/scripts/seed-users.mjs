import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env.local
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase URL or Publishable Key");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const usersToSeed = [
  {
    email: "arjun.mehta@college.edu",
    password: "password123",
    role: "STUDENT",
    name: "Arjun Mehta"
  },
  {
    email: "priya.sharma@college.edu",
    password: "password123",
    role: "FACULTY",
    name: "Dr. Priya Sharma"
  },
  {
    email: "student@example.com",
    password: "password123",
    role: "STUDENT",
    name: "Test Student"
  },
  {
    email: "faculty@example.com",
    password: "password123",
    role: "FACULTY",
    name: "Test Faculty"
  }
];

async function seed() {
  console.log("Seeding real Supabase Auth users...");

  for (const user of usersToSeed) {
    const { data, error } = await supabase.auth.signUp({
      email: user.email,
      password: user.password,
      options: {
        data: {
          role: user.role,
          name: user.name
        }
      }
    });

    if (error) {
      console.log(`User ${user.email}: ${error.message}`);
    } else {
      console.log(`User ${user.email}: Created/Signed up successfully (ID: ${data.user?.id})`);
    }
  }

  // Sign out cleanly
  await supabase.auth.signOut();
  console.log("\nDone seeding real Supabase Auth users!");
}

seed();
