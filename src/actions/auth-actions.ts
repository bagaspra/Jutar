"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export async function signIn(email: string, password: string) {
  const supabase = await createClient();

  // 1. Perform Auth Attempt on Server
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error("Login Server Action Error:", error.message);
    return { success: false, error: error.message };
  }

  // 2. Identify Role for Initial Redirect
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .single();

  const role = profile?.role || "cashier";

  // 3. Determine Default Path Based on Role
  let redirectPath = "/admin"; // Default Super Admin
  if (role === "inventory_admin") redirectPath = "/admin/management";
  if (role === "cashier") redirectPath = "/";

  // 4. Force Redirect (This throws an error handled by Next.js)
  // Inside a try/catch, redirect MUST be handled outside or thrown.
  // We'll return it to the client to be safe or call it directly.
  return { success: true, redirectPath };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

