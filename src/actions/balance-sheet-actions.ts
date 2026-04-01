"use server";

import { createClient } from "@/utils/supabase/server";
import { generateEquityStatement } from "./equity-actions";

/**
 * Generates the Balance Sheet (Laporan Neraca)
 * Fundamental Equation: Assets = Liabilities + Equity
 *
 * ASSET LOGIC:
 * - Kas & Bank: Cumulative net cash flow from ALL time up to the END of the
 *   selected month. This is the "bank balance" at that snapshot date.
 *   Formula: SUM(cash_orders) - SUM(expenses) where date <= end_of_month
 *
 * - Persediaan: Current physical inventory value.
 *   Formula: SUM(current_stock * unit_cost) — a real-time snapshot of stock.
 *
 * LIABILITY LOGIC (Residual / Derived):
 * - Since we have no debts table, Liabilities are derived mathematically:
 *   Utang = Total Aset - Total Ekuitas
 * - This is the "plug" figure. If positive → unpaid obligations exist.
 *   If negative → equity exceeds assets (data integrity issue, flag to user).
 * - The sheet is always mathematically balanced by definition.
 */
export async function generateBalanceSheet(month: number, year: number) {
  const supabase = await createClient();

  // Snapshot date: end of selected month
  const endOfMonth = new Date(year, month, 0, 23, 59, 59).toISOString();
  const endOfMonthDate = new Date(year, month, 0).toISOString().split("T")[0];

  try {
    // ─────────────────────────────────────────────
    // 1. KAS & BANK — Cumulative net cash to date
    // ─────────────────────────────────────────────

    // 1a. All cash sales up to end of selected month
    const { data: cashOrders, error: cashOrdersError } = await supabase
      .from("orders")
      .select(`
        total_amount,
        payment_methods ( type )
      `)
      .eq("status", "paid")
      .lte("created_at", endOfMonth);

    if (cashOrdersError) throw cashOrdersError;

    const totalCashSales = (cashOrders || []).reduce((acc, order: any) => {
      return order.payment_methods?.type === "cash"
        ? acc + Number(order.total_amount)
        : acc;
    }, 0);

    // 1b. All operational expenses up to end of selected month
    const { data: allExpenses, error: expensesError } = await supabase
      .from("operational_expenses")
      .select("amount")
      .lte("expense_date", endOfMonthDate);

    if (expensesError) throw expensesError;

    const totalExpensesPaid = (allExpenses || []).reduce(
      (acc, exp: any) => acc + Number(exp.amount),
      0
    );

    const kasBank = totalCashSales - totalExpensesPaid;

    // ─────────────────────────────────────────────
    // 2. PERSEDIAAN — Current inventory value
    // ─────────────────────────────────────────────
    const { data: rawMaterials, error: inventoryError } = await supabase
      .from("raw_materials")
      .select("name, current_stock, unit_cost");

    if (inventoryError) throw inventoryError;

    let persediaan = 0;
    const inventoryBreakdown = (rawMaterials || []).map((m: any) => {
      const value = Number(m.current_stock) * Number(m.unit_cost);
      persediaan += value;
      return { name: m.name, stock: Number(m.current_stock), unitCost: Number(m.unit_cost), value };
    });

    const totalAset = kasBank + persediaan;

    // ─────────────────────────────────────────────
    // 3. EKUITAS — From Equity Statement
    // ─────────────────────────────────────────────
    const equityResult = await generateEquityStatement(month, year);
    if (!equityResult.success || !equityResult.data) {
      throw new Error(equityResult.error || "Gagal mengambil data ekuitas");
    }
    const { endingEquity } = equityResult.data;

    // ─────────────────────────────────────────────
    // 4. KEWAJIBAN — Residual (Derived)
    //    Utang = Total Aset - Total Ekuitas
    //    By definition, this always balances the equation.
    // ─────────────────────────────────────────────
    const utangUsaha = totalAset - endingEquity;
    const totalKewajibanDanModal = utangUsaha + endingEquity; // = totalAset

    return {
      success: true,
      data: {
        // Assets
        kasBank,
        persediaan,
        inventoryBreakdown,
        totalAset,
        // Equity
        endingEquity,
        // Liabilities (derived)
        utangUsaha,
        totalKewajibanDanModal,
        // Always true by construction, but useful for UI logic
        isBalanced: Math.abs(totalAset - totalKewajibanDanModal) < 0.01,
        // Flag integrity issue if equity exceeds assets
        hasIntegrityWarning: utangUsaha < 0,
      },
    };
  } catch (error: any) {
    const serializableError =
      error instanceof Error
        ? error.message
        : JSON.stringify(error, Object.getOwnPropertyNames(error));
    console.error("Balance Sheet Logic Failure:", serializableError);
    return { success: false, error: "Gagal menghitung neraca. Cek log server." };
  }
}
