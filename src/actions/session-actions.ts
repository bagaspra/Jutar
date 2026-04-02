"use server";

import { createClient } from "@/utils/supabase/server";

/**
 * Creates a new dining session for a customer at a given table.
 * Used by the QR Kiosk welcome form on first visit.
 */
export async function createSession(tableNumber: string, customerName: string) {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("dining_sessions")
      .insert({
        table_number: tableNumber,
        customer_name: customerName,
        status: "active",
      })
      .select("id")
      .single();

    if (error) throw error;

    return { success: true, sessionId: data.id as string };
  } catch (error: any) {
    console.error("Create Session Error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Verifies an existing session token (UUID) against the database.
 * Returns the session status so the client can decide what to show.
 */
export async function verifySession(sessionId: string) {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("dining_sessions")
      .select("id, table_number, customer_name, status, created_at")
      .eq("id", sessionId)
      .single();

    if (error || !data) {
      return { success: false, status: null, session: null };
    }

    return {
      success: true,
      status: data.status as "active" | "paid" | "cancelled",
      session: data,
    };
  } catch (error: any) {
    console.error("Verify Session Error:", error);
    return { success: false, status: null, session: null };
  }
}
