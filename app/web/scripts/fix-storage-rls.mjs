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

async function fixStorageRLS() {
  console.log("Fixing Supabase Storage RLS policies via Direct Postgres Connection...\n");

  try {
    // 1. Ensure 'credentials' bucket exists in storage.buckets
    console.log("Ensuring 'credentials' bucket exists in database...");
    await pool.query(`
      INSERT INTO storage.buckets (id, name, public)
      VALUES ('credentials', 'credentials', true)
      ON CONFLICT (id) DO UPDATE SET public = true;
    `);
    console.log("✅ Bucket 'credentials' created/verified as public.");

    // 2. Drop existing restrictive policies on storage.objects if any
    console.log("Adding RLS policies for uploads and downloads...");
    await pool.query(`
      DO $$
      BEGIN
        IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow Public Uploads credentials') THEN
          DROP POLICY "Allow Public Uploads credentials" ON storage.objects;
        END IF;
        IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow Public Reads credentials') THEN
          DROP POLICY "Allow Public Reads credentials" ON storage.objects;
        END IF;
      END $$;
    `);

    // 3. Create permissive policies for 'credentials' bucket
    await pool.query(`
      CREATE POLICY "Allow Public Uploads credentials"
      ON storage.objects
      FOR INSERT
      WITH CHECK (bucket_id = 'credentials');
    `);

    await pool.query(`
      CREATE POLICY "Allow Public Reads credentials"
      ON storage.objects
      FOR SELECT
      USING (bucket_id = 'credentials');
    `);

    console.log("✅ RLS policies applied successfully! Public upload and read access granted for 'credentials' bucket.");

  } catch (error) {
    console.error("❌ Error applying storage RLS policy:", error.message);
  } finally {
    await pool.end();
  }
}

fixStorageRLS();
