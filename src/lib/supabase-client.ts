import { createClient, SupabaseClient } from "@supabase/supabase-js";

const DEFAULT_URL = "https://blxsffgrvyarfjlqwvmi.supabase.co";
const DEFAULT_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJseHNmZmdydnlhcmZqbHF3dm1pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5MDY4ODQsImV4cCI6MjA4MDQ4Mjg4NH0.b__MVNXGjXMElg0gS7tbLy3HW_RkuFNf3oaiCUa64Vs";

let cachedClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (cachedClient) return cachedClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_ANON_KEY;

  cachedClient = createClient(url, anonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
    },
  });

  return cachedClient;
}

