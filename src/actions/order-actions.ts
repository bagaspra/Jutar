"use server";

import { createClient } from "@/utils/supabase/server";
import { CartItem } from "@/types";
import { revalidatePath } from "next/cache";

export async function processCheckout(
  cartItems: CartItem[], 
  paymentMethod: string, 
  totalAmount: number,
  orderType: "dine_in" | "take_away" = "dine_in"
) {
  try {
    const supabase = await createClient();

    // 1. Generate Receipt Number: INV-YYYYMMDD-XXXX
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "");
    const randomStr = Math.floor(1000 + Math.random() * 9000).toString();
    const receiptNumber = `INV-${dateStr}-${randomStr}`;

    // 2. Insert Order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        receipt_number: receiptNumber,
        total_amount: totalAmount,
        payment_method: paymentMethod,
        status: "paid", // Setting to 'paid' immediately triggers inventory deduction
        order_type: orderType,
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // 3. Insert Order Items
    const orderItemsToInsert = cartItems.map((item) => ({
      order_id: order.id,
      product_id: item.id,
      quantity: item.quantity,
      price_at_time: item.price,
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItemsToInsert);

    if (itemsError) throw itemsError;

    revalidatePath("/");
    revalidatePath("/admin");
    return { success: true, order };
  } catch (error: any) {
    console.error("Checkout Error:", error);
    return { success: false, error: error.message };
  }
}
