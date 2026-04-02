"use server";

import { createClient } from "@/utils/supabase/server";
import { supabaseAdmin } from "@/utils/supabase/admin";
import { CartItem } from "@/types";

/**
 * Fetches the public menu (active products + all categories).
 * Uses admin client to bypass RLS — this is safe because it's read-only public data.
 */
export async function getPublicMenu() {
  try {
    const [{ data: categories, error: catError }, { data: products, error: prodError }] =
      await Promise.all([
        supabaseAdmin.from("categories").select("id, name, slug, emoji").order("name"),
        supabaseAdmin
          .from("products")
          .select("id, name, price, category_id, image_url, description")
          .eq("is_active", true)
          .order("name"),
      ]);

    if (catError) throw catError;
    if (prodError) throw prodError;

    return { success: true, categories: categories ?? [], products: products ?? [] };
  } catch (error: any) {
    console.error("getPublicMenu Error:", error);
    return { success: false, categories: [], products: [] };
  }
}

/**
 * Submits a kiosk order to the kitchen.
 * Inserts into orders (status: pending_kitchen) and order_items.
 * Requires a valid active session_id.
 */
export async function submitKioskOrder(
  sessionId: string,
  tableNumber: string,
  items: CartItem[]
) {
  try {
    const supabase = await createClient();

    const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const tax = subtotal * 0.1;
    const totalAmount = subtotal + tax;

    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "");
    const randomStr = Math.floor(1000 + Math.random() * 9000).toString();
    const receiptNumber = `KSK-${dateStr}-${randomStr}`;

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        receipt_number: receiptNumber,
        total_amount: totalAmount,
        status: "pending_kitchen",
        order_type: "dine_in",
        table_number: tableNumber,
        session_id: sessionId,
      })
      .select("id")
      .single();

    if (orderError) throw orderError;

    const orderItems = items.map((item) => ({
      order_id: order.id,
      product_id: item.id,
      quantity: item.quantity,
      price_at_time: item.price,
    }));

    const { error: itemsError } = await supabase.from("order_items").insert(orderItems);
    if (itemsError) throw itemsError;

    return { success: true, orderId: order.id, receiptNumber };
  } catch (error: any) {
    console.error("submitKioskOrder Error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Fetches all orders for a given session, with their items.
 */
export async function getSessionOrders(sessionId: string) {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("orders")
      .select("id, receipt_number, total_amount, status, created_at, order_items(quantity, price_at_time, products(name, image_url))")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return { success: true, orders: data ?? [] };
  } catch (error: any) {
    console.error("getSessionOrders Error:", error);
    return { success: false, orders: [] };
  }
}
