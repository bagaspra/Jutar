"use server";

import { createAdminClient, createClient } from "@/utils/supabase/server";
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
  const adminClient = await createAdminClient();

  // 1. Create the user in Supabase Auth
  // We use a random password and require the user to change it, 
  // or set a default one if provided in a more advanced form.
  // For now, let's set a default password 'JuRasa2026!'
  const { data: authUser, error: authError } = await adminClient.auth.admin.createUser({
    email,
    password: "JuRasa2026!",
    email_confirm: true,
    user_metadata: { full_name: name, role: role }
  });

  if (authError) {
    console.error("Create Auth User Error:", authError);
    return { success: false, error: authError.message };
  }

  // The profile is automatically created by the DB trigger
  
  revalidatePath("/admin/accounts");
  return { success: true, user: authUser.user };
}

export async function updateUserRole(userId: string, role: UserRole) {
  const adminClient = await createAdminClient();

  // Since we have a trigger that might conflict or we want to ensure
  // consistency, we update the profile table directly.
  // The service role bypasses RLS.
  const { error } = await adminClient
    .from("profiles")
    .update({ role })
    .eq("id", userId);

  if (error) {
    console.error("Update User Role Error:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/accounts");
  return { success: true };
}

export async function deleteUserAccount(userId: string) {
  const adminClient = await createAdminClient();

  // Deleting from auth.users will cascade to the profile table
  const { error } = await adminClient.auth.admin.deleteUser(userId);

  if (error) {
    console.error("Delete User Error:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/accounts");
  return { success: true };
}
