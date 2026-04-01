import { createClient } from "@supabase/supabase-js";

/**
 * Service Role Client for Administrative Tasks.
 * This client bypasses ALL Row Level Security (RLS) policies.
 * ONLY use this in Server Components or Server Actions where security 
 * is manually validated, strictly for internal system checks.
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  
  if (!supabaseUrl || !supabaseServiceRole) {
    console.error("RBAC: Missing environment variables for Admin Client.");
  }

  return createClient(supabaseUrl, supabaseServiceRole, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}
