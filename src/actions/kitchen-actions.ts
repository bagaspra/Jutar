"use server";

import { createClient } from "@/utils/supabase/server";
import { CartItem } from "@/types";

/**
 * Fetches all orders with status='pending_kitchen', joined with session for table/customer info.
 */
export async function getKitchenOrders() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("orders")
      .select(
        "id, receipt_number, table_number, created_at, order_items(quantity, price_at_time, products(name)), dining_sessions(customer_name)"
      )
      .eq("status", "pending_kitchen")
      .order("created_at", { ascending: true });

    if (error) throw error;
    return { success: true, orders: data ?? [] };
  } catch (error: any) {
    console.error("getKitchenOrders Error:", error);
    return { success: false, orders: [] };
  }
}

/**
 * Marks a single order as 'paid' (done cooking — moves it out of the KDS queue).
 * The kitchen only changes status; actual payment remains with the cashier.
 * We use a separate status 'ready' to signal food is ready but not yet paid.
 */
export async function markOrderReady(orderId: string) {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("orders")
      .update({ status: "ready" })
      .eq("id", orderId)
      .eq("status", "pending_kitchen");

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error("markOrderReady Error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Fetches all dining_sessions with status='active', with their aggregate order total.
 */
export async function getActiveSessions() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("dining_sessions")
      .select("id, table_number, customer_name, created_at")
      .eq("status", "active")
      .order("created_at", { ascending: true });

    if (error) throw error;
    return { success: true, sessions: data ?? [] };
  } catch (error: any) {
    console.error("getActiveSessions Error:", error);
    return { success: false, sessions: [] };
  }
}

/**
 * Loads all paid+ready+pending_kitchen orders for a session into the cashier cart format.
 * Returns the cart items and total so the cashier can process payment.
 */
export async function getSessionBill(sessionId: string) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("orders")
      .select(
        "id, total_amount, status, order_items(quantity, price_at_time, product_id, products(id, name, price, image_url))"
      )
      .eq("session_id", sessionId)
      .in("status", ["pending_kitchen", "ready"]);

    if (error) throw error;

    // Aggregate all items across orders into a single cart
    const cartMap = new Map<string, CartItem>();
    let rawSubtotal = 0;

    for (const order of data ?? []) {
      for (const oi of order.order_items as any[]) {
        const p = oi.products;
        if (!p) continue;
        const existing = cartMap.get(p.id);
        if (existing) {
          existing.quantity += oi.quantity;
        } else {
          cartMap.set(p.id, {
            id: p.id,
            name: p.name,
            price: oi.price_at_time,
            quantity: oi.quantity,
            category: "",
            image_url: p.image_url,
          });
        }
        rawSubtotal += oi.price_at_time * oi.quantity;
      }
    }

    const cartItems: CartItem[] = Array.from(cartMap.values());
    const tax = rawSubtotal * 0.1;
    const total = rawSubtotal + tax;
    const orderIds = (data ?? []).map((o: any) => o.id);

    return { success: true, cartItems, subtotal: rawSubtotal, tax, total, orderIds };
  } catch (error: any) {
    console.error("getSessionBill Error:", error);
    return { success: false, cartItems: [], subtotal: 0, tax: 0, total: 0, orderIds: [] };
  }
}

/**
 * Closes (marks as paid) a dining session after the cashier finishes checkout.
 */
export async function closeSession(sessionId: string) {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("dining_sessions")
      .update({ status: "paid" })
      .eq("id", sessionId);

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error("closeSession Error:", error);
    return { success: false, error: error.message };
  }
}
