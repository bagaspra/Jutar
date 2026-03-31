"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function toggleProductStatus(productId: string, currentStatus: boolean) {
  const supabase = await createClient();

  // 0. Auth check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Unauthorized. Please log in." };
  }

  const { error } = await supabase
    .from("products")
    .update({ is_active: !currentStatus })
    .eq("id", productId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin");
  revalidatePath("/");
  return { success: true };
}

export async function updateProductPrice(productId: string, newPrice: number) {
  const supabase = await createClient();

  // 0. Auth check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Unauthorized. Please log in." };
  }

  // Ensure fixed 2 decimal precision
  const formattedPrice = parseFloat(newPrice.toFixed(2));

  const { error } = await supabase
    .from("products")
    .update({ price: formattedPrice })
    .eq("id", productId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin");
  revalidatePath("/");
  return { success: true };
}
