"use server";

import { createClient } from "@/utils/supabase/server";

export async function generateIncomeStatement(month: number, year: number) {
  const supabase = await createClient();
  
  // 1. Calculate Date Range (Start & End of Month)
  const startDate = new Date(year, month - 1, 1).toISOString();
  const endDate = new Date(year, month, 0, 23, 59, 59).toISOString();

  try {
    // 2. Fetch Paid Orders for the Period
    const { data: orders, error: ordersError } = await supabase
      .from("orders")
      .select(`
        id,
        total_amount,
        created_at,
        order_items (
          product_id,
          quantity
        )
      `)
      .eq("status", "paid")
      .gte("created_at", startDate)
      .lte("created_at", endDate);

    if (ordersError) {
      console.error("Orders Fetch Error:", JSON.stringify(ordersError, null, 2));
      throw ordersError;
    }

    // 3. Fetch Operational Expenses for the Period
    const { data: expensesList, error: expensesError } = await supabase
      .from("operational_expenses")
      .select("*")
      .gte("expense_date", startDate.split('T')[0])
      .lte("expense_date", endDate.split('T')[0]);

    if (expensesError) {
      console.error("Expenses Fetch Error:", JSON.stringify(expensesError, null, 2));
      throw expensesError;
    }

    // 4. Fetch Products with Recipes and Unit Costs (Stable Join)
    const { data: fullProductData, error: productError } = await supabase
      .from("products")
      .select(`
        id,
        name,
        recipes (
          quantity_required,
          raw_materials (
            unit_cost
          )
        )
      `);

    if (productError) {
      console.error("Product-Recipe Data Error:", JSON.stringify(productError, null, 2));
      throw productError;
    }

    // Create a product lookup map for fast O(1) matching
    const productMap = new Map();
    fullProductData?.forEach((p: any) => productMap.set(p.id, p));

    // 5. Calculate Revenue & COGS
    let totalRevenue = 0;
    let totalCogs = 0;
    const productStats: Record<string, { count: number, cogs: number }> = {};

    orders?.forEach((order: any) => {
      totalRevenue += Number(order.total_amount);
      
      order.order_items?.forEach((item: any) => {
        const product = productMap.get(item.product_id);
        const productName = product?.name || "Unknown Product";
        
        // Initialize product stats
        if (!productStats[productName]) {
          productStats[productName] = { count: 0, cogs: 0 };
        }
        productStats[productName].count += item.quantity;

        // Calculate COGS for this item based on its recipe
        product?.recipes?.forEach((recipe: any) => {
          // Note: Access mapping depends on Supabase pluralization
          const cost = Number(recipe.raw_materials?.unit_cost || 0);
          const itemCogs = item.quantity * recipe.quantity_required * cost;
          totalCogs += itemCogs;
          productStats[productName].cogs += itemCogs;
        });
      });
    });

    // 6. Aggregate Expenses by Category
    let totalExpenses = 0;
    const expenseBreakdown: Record<string, number> = {};
    expensesList?.forEach((exp: any) => {
      totalExpenses += Number(exp.amount);
      const cat = exp.category || 'Other';
      expenseBreakdown[cat] = (expenseBreakdown[cat] || 0) + Number(exp.amount);
    });

    // 7. Calculate Profits
    const grossProfit = totalRevenue - totalCogs;
    const netProfit = grossProfit - totalExpenses;

    // 8. Sort Top Drivers
    const topMoving = Object.entries(productStats)
      .map(([name, stats]) => ({ name, ...stats }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      success: true,
      data: {
        metrics: {
          revenue: totalRevenue,
          cogs: totalCogs,
          grossProfit,
          expenses: totalExpenses,
          netProfit,
        },
        expenseBreakdown,
        topMoving
      }
    };

  } catch (error: any) {
    // Comprehensive serialization for server console
    console.error("Income Statement Logic Failure:", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code
    });
    return { success: false, error: error.message || "Internal Reporting Error" };
  }
}

/**
 * Generates a Cash Flow Statement (Arus Kas)
 * Focuses strictly on physical liquidity movements.
 */
export async function generateCashFlowReport(month: number, year: number) {
  const supabase = await createClient();
  
  const startDate = new Date(year, month - 1, 1).toISOString();
  const endDate = new Date(year, month, 0, 23, 59, 59).toISOString();

  try {
    // 1. Fetch ALL Paid Orders with Payment Methods
    const { data: rawOrders, error: ordersError } = await supabase
      .from("orders")
      .select(`
        id,
        receipt_number,
        total_amount,
        created_at,
        payment_methods (
          name,
          type
        )
      `)
      .eq("status", "paid")
      .gte("created_at", startDate)
      .lte("created_at", endDate)
      .order("created_at", { ascending: false });

    if (ordersError) throw ordersError;

    // 2. Fetch Operational Expenses
    const { data: rawExpenses, error: expensesError } = await supabase
      .from("operational_expenses")
      .select(`
        id,
        description,
        amount,
        expense_date,
        category
      `)
      .gte("expense_date", startDate.split('T')[0])
      .lte("expense_date", endDate.split('T')[0])
      .order("expense_date", { ascending: false });

    if (expensesError) throw expensesError;

    // 3. Process Math & Build Ledger
    let cashInflow = 0;
    let digitalSettlement = 0;
    let cashOutflow = 0;
    const ledger: any[] = [];

    // Process Orders
    rawOrders?.forEach((order: any) => {
      const amount = Number(order.total_amount);
      const isCash = order.payment_methods?.type === 'cash';

      if (isCash) {
        cashInflow += amount;
        ledger.push({
          id: order.id,
          type: 'inflow',
          label: `Penjualan #${order.receipt_number}`,
          amount: amount,
          date: order.created_at,
          category: 'Sales (Cash)'
        });
      } else {
        digitalSettlement += amount;
        // Digital doesn't go to physical ledger for cash flow
      }
    });

    // Process Expenses
    rawExpenses?.forEach((exp: any) => {
      const amount = Number(exp.amount);
      cashOutflow += amount;
      ledger.push({
        id: exp.id,
        type: 'outflow',
        label: exp.description || `Pengeluaran: ${exp.category}`,
        amount: amount,
        date: exp.expense_date,
        category: exp.category
      });
    });

    // Sort Ledger chronologically (Descending)
    ledger.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return {
      success: true,
      data: {
        metrics: {
          cashInflow,
          cashOutflow,
          netCashFlow: cashInflow - cashOutflow,
          digitalSettlement // Secondary info badge
        },
        ledger
      }
    };

  } catch (error: any) {
    console.error("Cash Flow Logic Failure:", error);
    return { success: false, error: error.message };
  }
}

