"use server";

import { createClient } from "@/utils/supabase/server";
import { generateIncomeStatement } from "./report-actions";
import { revalidatePath } from "next/cache";

/**
 * Generates the Statement of Changes in Equity (Laporan Perubahan Modal)
 * Beginning Equity + Net Profit + New Investment - Withdrawal = Ending Equity
 */
export async function generateEquityStatement(month: number, year: number) {
  const supabase = await createClient();
  
  // 1. Define Date Ranges (Strict YYYY-MM-DD)
  // month is 1-indexed (1-12)
  const startOfMonth = new Date(year, month - 1, 1).toISOString().split('T')[0];
  const endOfMonth = new Date(year, month, 0).toISOString().split('T')[0];

  try {
    // 2. Fetch Beginning Equity (Defensive fetch)
    const { data, error: pastError } = await supabase
      .from("equity_transactions")
      .select("type, amount")
      .lt("transaction_date", startOfMonth);

    if (pastError) throw pastError;

    const pastTransactions = data || [];
    const beginningEquity = pastTransactions.reduce((acc, curr) => {
      const val = Number(curr.amount || 0);
      return curr.type === "INVESTMENT" ? acc + val : acc - val;
    }, 0);

    // 3. Fetch Net Profit (Safely unwrap)
    const pnlResult = await generateIncomeStatement(month, year);
    if (!pnlResult || !pnlResult.success || !pnlResult.data) {
      throw new Error(pnlResult?.error || "Gagal sinkronisasi data Laba Rugi");
    }
    const netProfit = Number(pnlResult.data.metrics?.netProfit || 0);

    // 4. Fetch Transactions for CURRENT Period
    const { data: currentData, error: currentError } = await supabase
      .from("equity_transactions")
      .select("*")
      .gte("transaction_date", startOfMonth)
      .lte("transaction_date", endOfMonth)
      .order("transaction_date", { ascending: false });

    if (currentError) throw currentError;

    const currentTransactions = currentData || [];
    let newInvestments = 0;
    let ownerWithdrawals = 0;

    currentTransactions.forEach((tx) => {
      const val = Number(tx.amount || 0);
      if (tx.type === "INVESTMENT") newInvestments += val;
      if (tx.type === "WITHDRAWAL") ownerWithdrawals += val;
    });

    // 5. Calculate Final Ending Equity (Defensive Math)
    const endingEquity = beginningEquity + netProfit + newInvestments - ownerWithdrawals;

    return {
      success: true,
      data: {
        beginningEquity,
        netProfit,
        newInvestments,
        ownerWithdrawals,
        endingEquity,
        ledger: currentTransactions
      }
    };

  } catch (error: any) {
    // Robust Error Serialization (Ensures the logs are not empty {})
    const serializableError = error instanceof Error 
      ? error.message 
      : JSON.stringify(error, Object.getOwnPropertyNames(error));
      
    console.error("Equity Statement Logic Failure:", serializableError);
    return { success: false, error: "Gagal menghitung perubahan modal. Cek log server." };
  }
}

/**
 * Record a new Equity Transaction (Tambah Modal / Prive)
 */
export async function saveEquityTransaction(formData: {
  transaction_date: string;
  type: "INVESTMENT" | "WITHDRAWAL";
  amount: number;
  description: string;
}) {
  const supabase = await createClient();

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { error } = await supabase
      .from("equity_transactions")
      .insert([
        {
          ...formData,
          recorded_by: user.id
        }
      ]);

    if (error) throw error;

    revalidatePath("/admin/report");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Delete an Equity Transaction
 */
export async function deleteEquityTransaction(id: string) {
  const supabase = await createClient();

  try {
    const { error } = await supabase
      .from("equity_transactions")
      .delete()
      .eq("id", id);

    if (error) throw error;

    revalidatePath("/admin/report");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
