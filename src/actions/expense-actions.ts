"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export type ExpenseCategory = 'Salary' | 'Utilities' | 'Maintenance' | 'Marketing' | 'Rent' | 'Other';

export async function getExpenses() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("operational_expenses")
    .select("*")
    .order("expense_date", { ascending: false });

  if (error) {
    console.error("Fetch Expenses Error:", error);
    return [];
  }
  return data;
}

export async function createExpense(
  date: string,
  category: string,
  amount: number,
  description: string
) {
  const supabase = await createClient();

  // Auth check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { data, error } = await supabase
    .from("operational_expenses")
    .insert({
      expense_date: date,
      category,
      amount,
      description,
      recorded_by: user.id
    })
    .select()
    .single();

  if (error) {
    console.error("Create Expense Error:", error);
    return { error: error.message };
  }

  revalidatePath("/admin/management");
  return { success: true, expense: data };
}

export async function deleteExpense(id: string) {
  const supabase = await createClient();

  // Auth check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase
    .from("operational_expenses")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Delete Expense Error:", error);
    return { error: error.message };
  }

  revalidatePath("/admin/management");
  return { success: true };
}
