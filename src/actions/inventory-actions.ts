"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function adjustInventory(
  rawMaterialId: string,
  logType: "restock" | "waste",
  quantityChange: number,
  notes: string = ""
) {
  const supabase = await createClient();

  // 0. Auth check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "Unauthorized. Please log in." };
  }

  try {
    // 1. Get current stock
    const { data: material, error: fetchError } = await supabase
      .from("raw_materials")
      .select("current_stock, name")
      .eq("id", rawMaterialId)
      .single();

    if (fetchError || !material) throw new Error("Material not found");

    // 2. Calculate new stock
    // restock: adds to current_stock
    // waste: subtracts from current_stock
    const change = Math.abs(quantityChange);
    const multiplier = logType === "restock" ? 1 : -1;
    const finalChange = change * multiplier;
    const newStock = material.current_stock + finalChange;

    // 3. Update raw_materials
    const { error: updateError } = await supabase
      .from("raw_materials")
      .update({ current_stock: newStock })
      .eq("id", rawMaterialId);

    if (updateError) throw updateError;

    // 4. Log the change
    const { error: logError } = await supabase
      .from("inventory_logs")
      .insert({
        raw_material_id: rawMaterialId,
        log_type: logType,
        quantity_change: finalChange,
        notes: notes || `Manual ${logType} adjustment`,
      });

    if (logError) throw logError;

    revalidatePath("/admin");
    return { success: true, materialName: material.name };
  } catch (error: any) {
    console.error("Inventory Adjustment Error:", error);
    return { success: false, error: error.message };
  }
}

export async function getRawMaterials() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("raw_materials")
    .select("id, name, unit")
    .order("name");

  if (error) {
    console.error("Fetch Materials Error:", error);
    return [];
  }
  return data;
}
