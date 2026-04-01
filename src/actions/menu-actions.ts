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

export async function getProductsWithDetails() {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("products")
    .select(`
      *,
      category_data:categories(id, name, slug),
      recipes(
        raw_material_id,
        quantity_required,
        raw_materials(name, unit)
      )
    `)
    .order("name");

  if (error) {
    console.error("Get Products Error:", error);
    return [];
  }
  return data;
}

/**
 * Creates a new product with an optional recipe
 */
export async function createProductWithRecipe(
  productData: {
    name: string;
    price: number;
    category_id: string;
    image_url?: string;
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
      image_url: productData.image_url,
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

export async function updateProductWithRecipe(
  productId: string,
  productData: {
    name: string;
    price: number;
    category_id: string;
    image_url?: string;
  },
  recipeItems?: { raw_material_id: string; quantity_required: number }[],
  oldImageUrl?: string | null
) {
  const supabase = await createClient();

  // 0. Auth check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  // 1. Update Product
  const { error: productError } = await supabase
    .from("products")
    .update({
      name: productData.name,
      price: productData.price,
      category_id: productData.category_id,
      image_url: productData.image_url
    })
    .eq("id", productId);

  if (productError) return { error: productError.message };

  // 2. Storage Cleanup (If image was changed)
  if (productData.image_url && oldImageUrl && productData.image_url !== oldImageUrl) {
      const isOurBucket = oldImageUrl.includes("/storage/v1/object/public/product-images/");
      if (isOurBucket) {
        const filePath = oldImageUrl.split("/").pop();
        if (filePath) {
          await supabase.storage.from("product-images").remove([filePath]);
        }
      }
  }

  // 3. Reset & Rebuild Recipes
  await supabase.from("recipes").delete().eq("product_id", productId);

  if (recipeItems && recipeItems.length > 0) {
    const recipesToInsert = recipeItems.map((item) => ({
      product_id: productId,
      raw_material_id: item.raw_material_id,
      quantity_required: item.quantity_required,
    }));
    await supabase.from("recipes").insert(recipesToInsert);
  }

  revalidatePath("/admin");
  revalidatePath("/");
  return { success: true };
}

export async function deleteProduct(productId: string, imageUrl?: string | null) {
  const supabase = await createClient();

  // 0. Auth check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  // 1. Storage Cleanup
  if (imageUrl) {
    const isOurBucket = imageUrl.includes("/storage/v1/object/public/product-images/");
    if (isOurBucket) {
      const filePath = imageUrl.split("/").pop();
      if (filePath) {
        await supabase.storage.from("product-images").remove([filePath]);
      }
    }
  }

  // 2. Delete Product (Cascades to recipes)
  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", productId);

  if (error) return { error: error.message };

  revalidatePath("/admin");
  revalidatePath("/");
  return { success: true };
}
