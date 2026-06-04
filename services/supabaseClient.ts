
import { createClient } from '@supabase/supabase-js';

// Try loading credentials from environment variables first (recommended for Vercel/production),
// and fall back to the hardcoded keys if environment variables are not defined.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://cfwaeygjhvccunbxmgtm.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmd2FleWdqaHZjY3VuYnhtZ3RtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA1MjgyNDEsImV4cCI6MjA5NjEwNDI0MX0.wX2hLdXq1zlo3u_X9qvkpMdW-xx1lkb6CUohe8gW9l8";

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL and Anon Key must be defined.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Custom type definitions are no longer needed here.
// User and Session types are now imported directly from '@supabase/supabase-js' in the central types.ts file.
