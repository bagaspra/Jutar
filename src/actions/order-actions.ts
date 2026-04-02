"use server";

import { createClient } from "@/utils/supabase/server";
import { CartItem } from "@/types";
import { revalidatePath } from "next/cache";

/**
 * Saves a 'Hold' order (Pesanan Tunda) to the 'orders' table without triggering inventory deduction.
 * If orderId exists, the existing order is overwritten with the new cart state.
 */
export async function saveOpenOrder(
    cartItems: CartItem[],
    totalAmount: number,
    orderType: "dine_in" | "take_away",
    existingOrderId?: string | null,
    paymentMethodId?: string | null,
    tableNumber?: string | null
) {
    try {
        const supabase = await createClient();

        let orderId = existingOrderId;
        let receiptNumber = "";

        if (orderId) {
            // Update Existing Order
            // First, get the receipt number from the existing order
            const { data: existing } = await supabase
                .from("orders")
                .select("receipt_number")
                .eq("id", orderId)
                .single();
            receiptNumber = existing?.receipt_number || "RECOVERED";

            await supabase
                .from("orders")
                .update({
                    total_amount: totalAmount,
                    order_type: orderType,
                    status: 'open',
                    payment_method_id: paymentMethodId,
                    table_number: tableNumber || null
                })
                .eq("id", orderId);
            
            // Delete old items to fully replace them
            await supabase
                .from("order_items")
                .delete()
                .eq("order_id", orderId);
        } else {
            // Create New 'Open' Order
            const date = new Date();
            const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "");
            const randomStr = Math.floor(1000 + Math.random() * 9000).toString();
            receiptNumber = `TND-${dateStr}-${randomStr}`; // 'TND' for Tunda

            const { data: order, error: orderError } = await supabase
                .from("orders")
                .insert({
                    receipt_number: receiptNumber,
                    total_amount: totalAmount,
                    status: "open",
                    order_type: orderType,
                    payment_method_id: paymentMethodId,
                    table_number: tableNumber || null,
                })
                .select()
                .single();

            if (orderError) throw orderError;
            orderId = order.id;
        }

        // Insert fresh order items
        const orderItemsToInsert = cartItems.map((item) => ({
            order_id: orderId,
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
        return { success: true, orderId, receiptNumber };
    } catch (error: any) {
        console.error("Save Hold Order Error:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Finalizes an existing order or creates a new one as 'paid'.
 * Triggers the inventory logic.
 */
export async function processCheckout(
  cartItems: CartItem[],
  paymentMethod: string,
  totalAmount: number,
  orderType: "dine_in" | "take_away" = "dine_in",
  existingOrderId?: string | null,
  paymentMethodId?: string | null,
  tableNumber?: string | null
) {
  try {
    const supabase = await createClient();

    let orderId = existingOrderId;
    let orderData;

    if (orderId) {
        // Transition 'open' order to 'paid'
        const { data: order, error: updateError } = await supabase
            .from("orders")
            .update({
                status: "paid",
                payment_method_id: paymentMethodId,
                total_amount: totalAmount,
                order_type: orderType,
                created_at: new Date().toISOString(), // Update creation time to payment time
                table_number: tableNumber || null,
            })
            .eq("id", orderId)
            .select()
            .single();
        
        if (updateError) throw updateError;
        orderData = order;

        // Replace items with the current cart (just in case they changed during partial checkout)
        await supabase
            .from("order_items")
            .delete()
            .eq("order_id", orderId);
            
    } else {
        // Create a new direct 'Paid' order
        const date = new Date();
        const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "");
        const randomStr = Math.floor(1000 + Math.random() * 9000).toString();
        const receiptNumber = `INV-${dateStr}-${randomStr}`;

        const { data: order, error: orderError } = await supabase
            .from("orders")
            .insert({
                receipt_number: receiptNumber,
                total_amount: totalAmount,
                payment_method_id: paymentMethodId,
                status: "paid",
                order_type: orderType,
                table_number: tableNumber || null,
            })
            .select()
            .single();

        if (orderError) throw orderError;
        orderId = order.id;
        orderData = order;
    }

    // Insert Final order items
    const orderItemsToInsert = cartItems.map((item) => ({
      order_id: orderId,
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
    return { success: true, order: orderData };
  } catch (error: any) {
    console.error("Checkout Error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Fetches all orders with status='open'
 */
export async function getOpenOrders() {
    try {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from("orders")
            .select("*, order_items(id, quantity, product_id, products(id, name, price, image_url))")
            .eq("status", "open")
            .order("created_at", { ascending: false });

        if (error) throw error;
        return { success: true, orders: data };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
