import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";

// Load .env.local from the current directory
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceRole) {
  console.error("Missing environment variables. Check .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRole);

async function checkProfiles() {
  console.log("Checking profiles table...");
  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("*");

  if (error) {
    console.error("Error fetching profiles:", error);
    return;
  }

  console.log("--- Profiles in DB ---");
  console.table(profiles);

  console.log("\nChecking auth.users...");
  const { data: users, error: userError } = await supabase.auth.admin.listUsers();

  if (userError) {
    console.error("Error fetching auth.users:", userError);
    return;
  }

  const userSummary = users.users.map(u => ({
    id: u.id,
    email: u.email,
    last_sign_in_at: u.last_sign_in_at
  }));
  console.log("--- Auth Users ---");
  console.table(userSummary);

  // Cross-reference
  console.log("\n--- Integrity Report ---");
  profiles?.forEach(p => {
    const match = users.users.find(u => u.id === p.id);
    if (match) {
      console.log(`✅ MATCH: ${p.email} has profile with correct ID: ${p.id}. Current Role in Profile: ${p.role}`);
    } else {
      console.error(`❌ MISMATCH: Profile ${p.email} (ID: ${p.id}) has no matching auth.user!`);
    }
  });

  const matchingProfile = profiles?.find(p => p.email === "bgaspra07@gmail.com");
  if (matchingProfile) {
     console.log("\n🎯 Target User check (bgaspra07@gmail.com):");
     console.log(`- Role in DB: ${matchingProfile.role}`);
     if (matchingProfile.role === 'super_admin') {
       console.log("✅ User IS Super Admin in DB. The issue is likely in logic or RLS.");
     } else {
       console.log("❌ User is NOT Super Admin in DB. Manual update needed.");
     }
  } else {
    console.log("\n⚠️ Target user bgaspra07@gmail.com NOT found in profiles table.");
  }
}

checkProfiles();
