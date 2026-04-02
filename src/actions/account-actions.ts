"use server";

import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { revalidatePath } from "next/cache";

export type UserRole = "super_admin" | "inventory_admin" | "cashier";

export async function getUsers() {
  const supabase = await createClient();
  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Fetch Users Error:", error);
    return { success: false, error: error.message };
  }

  return { success: true, users: profiles };
}

export async function createUserAccount(
  email: string,
  name: string,
  role: UserRole
) {
  // 1. Create the user in Supabase Auth (Admin API)
  // We bypass RLS and trigger logic by using our pure Admin Client
  const supabaseAdmin = createAdminClient();
  const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password: "JuRasa2026!", // Default secure password
    email_confirm: true,
    user_metadata: { full_name: name, role: role }
  });

  if (authError) {
    console.error("Create Auth User Error:", authError);
    return { success: false, error: `Authentication Error: ${authError.message}` };
  }

  const userId = authUser.user.id;

  // 2. Explicitly sync to the profiles table
  // Even though a trigger exists, doing this manually with the Admin Client 
  // guarantees the record exists and bypasses RLS issues during the creation transaction.
  const { error: profileError } = await supabaseAdmin
    .from("profiles")
    .upsert({
      id: userId,
      email: email,
      name: name,
      role: role
    });

  if (profileError) {
    console.error("Create Profile Error:", profileError);
    // We don't delete the auth user here so admin can try to fix it,
    // but we notify the user of the sync failure.
    return { success: false, error: `Auth success, but Profile link failed: ${profileError.message}` };
  }
  
  revalidatePath("/admin/accounts");
  return { success: true, user: authUser.user };
}

export async function updateUserRole(userId: string, role: UserRole) {
  // Use the service role to bypass role escalation protection
  const supabaseAdmin = createAdminClient();
  const { error } = await supabaseAdmin
    .from("profiles")
    .update({ role })
    .eq("id", userId);

  if (error) {
    console.error("Update User Role Error:", error);
    return { success: false, error: `Update Failed: ${error.message}` };
  }
  revalidatePath("/admin/accounts");
  return { success: true };
}

export async function updateUserProfile(userId: string, data: { name: string, role: UserRole }) {
  const supabaseAdmin = createAdminClient();
  const { error } = await supabaseAdmin
    .from("profiles")
    .update({ 
      name: data.name, 
      role: data.role,
      updated_at: new Date().toISOString()
    })
    .eq("id", userId);

  if (error) {
    console.error("Update User Profile Error:", error);
    return { success: false, error: `Update Failed: ${error.message}` };
  }

  revalidatePath("/admin/accounts");
  return { success: true };
}


export async function deleteUserAccount(userId: string) {
  // Deleting from auth.users will cascade to the profile table
  const supabaseAdmin = createAdminClient();
  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);

  if (error) {
    console.error("Delete User Error:", error);
    return { success: false, error: `Delete Failed: ${error.message}` };
  }

  revalidatePath("/admin/accounts");
  return { success: true };
}
