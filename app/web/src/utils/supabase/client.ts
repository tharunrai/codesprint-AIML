import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://yhzapsiyqoradqjauoed.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_vg5JAYUOf5tJQ0tJ-J3SpQ_Apa6G9sK";

let client: ReturnType<typeof createBrowserClient> | null = null;

export const createClient = () => {
  if (client) return client;
  client = createBrowserClient(
    supabaseUrl,
    supabaseKey
  );
  return client;
};
