import { createClient } from "./supabase/server";
import { createAdminClient } from "./supabase/admin";
import { unstable_noStore as noStore } from "next/cache";

export async function getUserRole(): Promise<string> {
  noStore(); 
  const supabase = await createClient(); // For session verification
  const adminClient = createAdminClient(); // For role lookup
  
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.warn("RBAC ERROR: No valid session found.", authError);
      return "cashier";
    }

    // Role lookup using Admin Client to bypass RLS misconfigurations
    let { data: profile, error: dbError } = await adminClient
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    // Fallback: If ID lookup fails, search by email to handle out-of-sync IDs
    if (dbError || !profile) {
      console.warn(`RBAC: ID lookup failed for ${user.email}. Attempting email-based fallback.`);
      const { data: emailMatch } = await adminClient
        .from("profiles")
        .select("role")
        .eq("email", user.email)
        .single();
      
      profile = emailMatch;
    }

    if (!profile) {
      console.error(`RBAC ERROR: No profile found for ${user.email} by ID or Email.`);
      return "cashier";
    }

    return profile.role as string;

  } catch (err) {
    console.error("RBAC Critical Exception:", err);
    return "cashier";
  }
}
