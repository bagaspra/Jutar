"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * Utility to generate a slug from a name
 */
const generateSlug = (name: string) => {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

/**
 * Creates a new category
 */
export async function createCategory(name: string, emoji: string) {
  const supabase = await createClient();

  // 0. Auth check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Unauthorized. Please log in." };
  }

  const slug = generateSlug(name);

  const { data, error } = await supabase
    .from("categories")
    .insert({ name, slug, emoji })
    .select()
    .single();

  if (error) {
    console.error("Create Category Error:", error);
    return { error: error.message };
  }

  revalidatePath("/admin");
  revalidatePath("/");
  return { success: true, category: data };
}

/**
 * Updates an existing category
 */
export async function updateCategory(id: string, name: string, emoji: string) {
  const supabase = await createClient();

  // 0. Auth check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Unauthorized. Please log in." };
  }

  const slug = generateSlug(name);

  const { data, error } = await supabase
    .from("categories")
    .update({ name, slug, emoji })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Update Category Error:", error);
    return { error: error.message };
  }

  revalidatePath("/admin");
  revalidatePath("/");
  return { success: true, category: data };
}

/**
 * Deletes a category
 * Note: Database level RESTRICT will prevent deletion if products exist
 */
export async function deleteCategory(id: string) {
  const supabase = await createClient();

  // 0. Auth check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Unauthorized. Please log in." };
  }

  const { error } = await supabase
    .from("categories")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Delete Category Error:", error);
    // Handle the specific Foreign Key violation error
    if (error.code === "23503") {
      return { error: "Cannot delete category: It still contains active products." };
    }
    return { error: error.message };
  }

  revalidatePath("/admin");
  revalidatePath("/");
  return { success: true };
}

/**
 * Fetches all categories
 */
export async function getCategories() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("name");

  if (error) {
    console.error("Get Categories Error:", error);
    return [];
  }

  return data;
}
