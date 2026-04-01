"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function getPendingShiftSummary() {
  const supabase = await createClient();
  
  try {
    // 1. Fetch all paid orders that are not yet reconciled
    const { data: orders, error: ordersError } = await supabase
      .from("orders")
      .select(`
        id,
        total_amount,
        payment_methods (
          type
        )
      `)
      .eq("status", "paid")
      .is("shift_id", null);

    if (ordersError) throw ordersError;

    // 2. Aggregate totals
    let totalCashSales = 0;
    let totalDigitalSales = 0;
    let totalOrders = orders?.length || 0;

    orders?.forEach((order: any) => {
      const type = order.payment_methods?.type || 'digital';
      if (type === 'cash') {
        totalCashSales += Number(order.total_amount);
      } else {
        totalDigitalSales += Number(order.total_amount);
      }
    });

    return {
      success: true,
      data: {
        totalOrders,
        totalCashSales,
        totalDigitalSales,
        totalGross: totalCashSales + totalDigitalSales
      }
    };

  } catch (error: any) {
    console.error("Pending Shift Summary Error:", error);
    return { success: false, error: error.message };
  }
}

export async function submitShiftCloseout(
  startingCash: number,
  expectedCash: number,
  actualCash: number,
  totalDigital: number,
  notes: string = ""
) {
  const supabase = await createClient();

  try {
    // 1. Auth check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    // 2. Create the shift record
    const { data: shift, error: shiftError } = await supabase
      .from("shifts")
      .insert({
        user_id: user.id,
        starting_cash: startingCash,
        expected_cash: expectedCash,
        actual_cash: actualCash,
        total_digital: totalDigital,
        notes: notes
      })
      .select()
      .single();

    if (shiftError) throw shiftError;

    // 3. Link all currently pending 'paid' orders to this shift
    const { error: updateError } = await supabase
      .from("orders")
      .update({ shift_id: shift.id })
      .eq("status", "paid")
      .is("shift_id", null);

    if (updateError) throw updateError;

    revalidatePath("/admin/report");
    return { success: true, shiftId: shift.id };
  } catch (error: any) {
    console.error("Shift Closeout Error:", error);
    return { success: false, error: error.message };
  }
}

export async function getShiftHistory() {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("shifts")
    .select(`
      *,
      profiles (
        name,
        role
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    const serializableError = JSON.stringify(error, Object.getOwnPropertyNames(error));
    console.error("Fetch Shift History Error:", serializableError);
    return [];
  }
  return data;
}
