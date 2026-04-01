"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function createPaymentMethod(name: string, type: 'cash' | 'digital') {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("payment_methods")
    .insert({ name, type, is_active: true })
    .select()
    .single();

  if (error) {
    console.error("Create Payment Method Error:", error);
    return { error: error.message };
  }

  revalidatePath("/admin/management");
  return { success: true, data };
}

export async function togglePaymentMethodStatus(id: string, currentStatus: boolean) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("payment_methods")
    .update({ is_active: !currentStatus })
    .eq("id", id);

  if (error) {
    console.error("Toggle Payment Method Error:", error);
    return { error: error.message };
  }

  revalidatePath("/admin/management");
  return { success: true };
}

export async function deletePaymentMethod(id: string) {
  const supabase = await createClient();

  // Note: Will fail if orders exist with this ID
  const { error } = await supabase
    .from("payment_methods")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Delete Payment Method Error:", error);
    return { error: error.message };
  }

  revalidatePath("/admin/management");
  return { success: true };
}

export async function getPaymentMethods() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("payment_methods")
    .select("*")
    .order("name");

  if (error) {
    console.error("Fetch Payment Methods Error:", error);
    return [];
  }

  return data;
}
