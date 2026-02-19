// =============================================================================
// SUMMARY API ROUTE - OPTIMIZED WITH PRISMA GROUPBY
// =============================================================================
// This file provides aggregated expense data for the summary page.
// 
// WHY USE GROUPBY INSTEAD OF FINDMANY?
// -------------------------------------
// When you have thousands of expense records, fetching ALL rows with findMany
// and then grouping them in JavaScript is extremely inefficient because:
// 
// 1. NETWORK OVERHEAD: Transferring thousands of rows from database to server
//    takes significant bandwidth and time.
// 
// 2. MEMORY USAGE: Loading all rows into memory can cause issues with large
//    datasets, potentially crashing the application.
// 
// 3. CPU COST: Iterating through arrays and calculating sums in JS is slower
//    than letting the database do it (databases are optimized for this).
// 
// Using Prisma's groupBy and aggregate, the database engine:
// - Performs calculations directly where data lives (no network transfer of raw rows)
// - Uses optimized algorithms and indexes
// - Returns only the aggregated results (tiny payload)
// 
// Example: 10,000 expenses → findMany returns 10,000 rows
//          10,000 expenses → groupBy returns ~12 rows (one per month)
// =============================================================================

import prisma from "@/lib/prisma";
import { requireAuthenticatedUser } from "@/lib/supabaseServer";

// =============================================================================
// GET /api/summary - Get aggregated expense summary
// =============================================================================
// Query params: user_id (required)
// Returns pre-computed summary data for charts and statistics
// =============================================================================
export async function GET(req) {
  try {
    const { user, errorResponse } = await requireAuthenticatedUser(req);
    if (errorResponse) return errorResponse;

    // =========================================================================
    // QUERY 1: Total expense (all time) using aggregate
    // =========================================================================
    // prisma.aggregate() is perfect for computing total, average, min, max, count
    // across all matching records without fetching individual rows.
    // 
    // _sum returns the sum of the specified fields
    // Since amount is an Integer in the database, result is also Integer
    const totalResult = await prisma.expenses.aggregate({
      where: {
        user_id: user.id,
      },
      _sum: {
        amount: true,  // Sum all expense amounts
      },
      _count: {
        id: true,      // Count total number of expenses
      },
    });

    // =========================================================================
    // QUERY 2: Expenses grouped by category using groupBy
    // =========================================================================
    // groupBy groups records by the specified field(s) and allows aggregation
    // This replaces the client-side loop that grouped expenses manually
    // 
    // Result: [{ category: "Makanan", _sum: { amount: 500000 } }, ...]
    const expensesByCategory = await prisma.expenses.groupBy({
      by: ["category"],  // Group by category field
      where: {
        user_id: user.id,
      },
      _sum: {
        amount: true,    // Sum amount for each category
      },
      _count: {
        id: true,        // Count transactions per category
      },
      orderBy: {
        _sum: {
          amount: "desc", // Order by total amount descending
        },
      },
    });

    // =========================================================================
    // QUERY 3: Expenses grouped by month/year
    // =========================================================================
    // Prisma doesn't have built-in date extraction like SQL's EXTRACT(),
    // so we use raw SQL for this aggregation.
    // 
    // This query extracts YEAR and MONTH from the date field and groups by them
    // Using $queryRaw for complex aggregations Prisma doesn't support natively
    const expensesByMonth = await prisma.$queryRaw`
      SELECT 
        EXTRACT(YEAR FROM date)::int as year,
        EXTRACT(MONTH FROM date)::int as month,
        SUM(amount)::int as total,
        COUNT(id)::int as transaction_count
      FROM expenses
      WHERE user_id = ${user.id}
      GROUP BY EXTRACT(YEAR FROM date), EXTRACT(MONTH FROM date)
      ORDER BY year DESC, month DESC
    `;

    // =========================================================================
    // FORMAT RESPONSE
    // =========================================================================
    // Transform the raw aggregation results into a frontend-friendly format
    
    // Format category data for pie chart
    const categoryData = expensesByCategory.map((item) => ({
      name: item.category,
      amount: item._sum.amount || 0,  // amount is Integer, no conversion needed
      count: item._count.id,
    }));

    // Format monthly data for the summary list
    // Add month labels in Indonesian
    const monthNames = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];

    const monthlyData = expensesByMonth.map((item) => ({
      key: `${item.year}-${String(item.month).padStart(2, "0")}`,
      label: `${monthNames[item.month - 1]} ${item.year}`,
      year: item.year,
      month: item.month,
      total: item.total || 0,
      transactionCount: item.transaction_count,
    }));

    // =========================================================================
    // QUERY 4: Get category breakdown for each month (for detail view)
    // =========================================================================
    // This provides detailed category data per month for the pie chart
    const categoryByMonth = await prisma.$queryRaw`
      SELECT 
        EXTRACT(YEAR FROM date)::int as year,
        EXTRACT(MONTH FROM date)::int as month,
        category,
        SUM(amount)::int as total
      FROM expenses
      WHERE user_id = ${user.id}
      GROUP BY EXTRACT(YEAR FROM date), EXTRACT(MONTH FROM date), category
      ORDER BY year DESC, month DESC, total DESC
    `;

    // Group category data by month key
    const categoryByMonthMap = {};
    categoryByMonth.forEach((item) => {
      const key = `${item.year}-${String(item.month).padStart(2, "0")}`;
      if (!categoryByMonthMap[key]) {
        categoryByMonthMap[key] = [];
      }
      categoryByMonthMap[key].push({
        name: item.category,
        amount: item.total,
      });
    });

    // Return the aggregated summary data
    return new Response(
      JSON.stringify({
        // Overall statistics
        totalExpense: totalResult._sum.amount || 0,
        totalTransactions: totalResult._count.id,
        
        // Breakdown data for charts and lists
        expensesByCategory: categoryData,
        expensesByMonth: monthlyData,
        categoryByMonth: categoryByMonthMap,
      }),
      { status: 200 }
    );

  } catch (err) {
    console.error("Summary GET error:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
