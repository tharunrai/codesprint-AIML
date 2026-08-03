import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase URL or Publishable Key");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createCredentialsBucket() {
  console.log("Checking/creating 'credentials' storage bucket...");

  // Try creating the public bucket 'credentials'
  const { data, error } = await supabase.storage.createBucket('credentials', {
    public: true,
    fileSizeLimit: 10485760, // 10MB limit
    allowedMimeTypes: ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg']
  });

  if (error) {
    if (error.message.includes('already exists') || error.message.includes('Duplicate')) {
      console.log("Bucket 'credentials' already exists!");
    } else {
      console.log("Bucket status/notice:", error.message);
    }
  } else {
    console.log("Bucket 'credentials' successfully created!", data);
  }
}

createCredentialsBucket();
