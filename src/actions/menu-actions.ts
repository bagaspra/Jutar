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

/**
 * Creates a new product with an optional recipe
 */
export async function createProductWithRecipe(
  productData: {
    name: string;
    price: number;
    category_id: string;
  },
  recipeItems?: { raw_material_id: string; quantity_required: number }[]
) {
  const supabase = await createClient();

  // 0. Auth check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Unauthorized. Please log in." };
  }

  // 1. Insert Product
  const { data: product, error: productError } = await supabase
    .from("products")
    .insert({
      name: productData.name,
      price: productData.price,
      category_id: productData.category_id,
      is_active: true,
    })
    .select()
    .single();

  if (productError) {
    console.error("Create Product Error:", productError);
    return { error: productError.message };
  }

  // 2. Insert Recipe Items if provided
  if (recipeItems && recipeItems.length > 0) {
    const recipesToInsert = recipeItems.map((item) => ({
      product_id: product.id,
      raw_material_id: item.raw_material_id,
      quantity_required: item.quantity_required,
    }));

    const { error: recipeError } = await supabase
      .from("recipes")
      .insert(recipesToInsert);

    if (recipeError) {
      console.error("Create Recipe Error:", recipeError);
      return { error: `Product created, but failed to link recipe: ${recipeError.message}` };
    }
  }

  revalidatePath("/admin");
  revalidatePath("/");
  return { success: true };
}
