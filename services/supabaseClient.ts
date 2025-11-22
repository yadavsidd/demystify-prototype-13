
import { createClient } from '@supabase/supabase-js';

// Hardcoded credentials to fix environment-specific loading issues.
// NOTE: In a real-world production environment, these should always be loaded from secure environment variables.
const supabaseUrl = "https://ulgvahvtzvrovhxslvsb.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVsZ3ZhaHZ0enZyb3ZoeHNsdnNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1ODI3ODQsImV4cCI6MjA3OTE1ODc4NH0.k0fGstfXK-Pm4IOQ2y4TIbi-uULSBE8fXROc6PCRcuU";

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL and Anon Key must be defined.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Custom type definitions are no longer needed here.
// User and Session types are now imported directly from '@supabase/supabase-js' in the central types.ts file.
