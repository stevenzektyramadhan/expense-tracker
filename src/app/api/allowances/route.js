// =============================================================================
// ALLOWANCES API ROUTE - REFACTORED TO USE PRISMA
// =============================================================================
// This file handles CRUD operations for the 'allowances' table.
// Allowances represent a monthly budget the user sets for themselves.
// =============================================================================

// Import our Prisma singleton - this ensures we reuse the same database connection
import prisma from "@/lib/prisma";
import { requireAuthenticatedUser } from "@/lib/supabaseServer";

const ALLOWED_FREQUENCIES = new Set(["weekly", "monthly"]);

const serializeAllowance = (allowance) => ({
  ...allowance,
  amount: allowance.amount.toString(),
  remaining: allowance.remaining.toString(),
});

const getCurrentPeriod = () => {
  const now = new Date();
  return {
    month: now.getMonth() + 1,
    year: now.getFullYear(),
  };
};

// =============================================================================
// POST /api/allowances - Create or return existing allowance for current month
// =============================================================================
export async function POST(req) {
  try {
    const { user, errorResponse } = await requireAuthenticatedUser(req);
    if (errorResponse) return errorResponse;

    // Parse the JSON body from the request
    // amount: The budget amount for the month (Decimal in database)
    const { amount } = await req.json();

    if (typeof amount !== "number" || Number.isNaN(amount) || amount <= 0) {
      return new Response(JSON.stringify({ error: "amount must be a positive number" }), {
        status: 400,
      });
    }

    // Get current month and year to find or create the correct allowance
    const { month, year } = getCurrentPeriod();

    // =========================================================================
    // STEP 1: Check if an allowance already exists for this month/year
    // =========================================================================
    // Using Prisma's findFirst() method to query for existing allowance
    // This is equivalent to Supabase's .select().eq().single()
    // The 'where' clause specifies our filter conditions
    const existing = await prisma.allowances.findFirst({
      where: {
        user_id: user.id,  // Match the user
        month: month,       // Match the month
        year: year,         // Match the year
      },
    });

    // If allowance already exists for this month, return it (idempotent behavior)
    // This prevents duplicate allowances for the same month
    if (existing) {
      // Convert Decimal fields to strings for JSON serialization
      // Prisma returns Decimal objects which need conversion for JSON response
      return new Response(JSON.stringify(serializeAllowance(existing)), { status: 200 });
    }

    // =========================================================================
    // STEP 2: Create a new allowance if none exists
    // =========================================================================
    // Using Prisma's create() method to insert a new record
    // The 'data' object contains the fields to insert
    // Note: The 'amount' column is Decimal(12,2) in the database
    // Prisma automatically handles the conversion from number to Decimal
    const newAllowance = await prisma.allowances.create({
      data: {
        user_id: user.id,
        month: month,
        year: year,
        amount: amount,           // Initial budget amount
        remaining: amount,        // Remaining starts equal to amount (nothing spent yet)
        // created_at and updated_at are auto-set by database defaults
      },
    });

    // Convert Decimal fields to strings for JSON serialization
    // This is necessary because JSON.stringify() doesn't know how to handle
    // Prisma's Decimal type (which uses decimal.js internally)
    return new Response(JSON.stringify(serializeAllowance(newAllowance)), { status: 200 });
  } catch (err) {
    // Log the full error for debugging (visible in server console)
    console.error("Allowances POST error:", err);
    
    // Return a user-friendly error message
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

// =============================================================================
// GET /api/allowances - Fetch allowance for current month
// =============================================================================
// Query params: user_id (required)
// Returns the allowance for the current month, or null if none exists
export async function GET(req) {
  try {
    const { user, errorResponse } = await requireAuthenticatedUser(req);
    if (errorResponse) return errorResponse;

    // Get current month and year
    const { month, year } = getCurrentPeriod();

    // Query for the current month's allowance using Prisma
    // findFirst returns null if no record is found (no error thrown)
    const allowance = await prisma.allowances.findFirst({
      where: {
        user_id: user.id,
        month: month,
        year: year,
      },
    });

    // If no allowance found, return null (frontend can handle this)
    if (!allowance) {
      return new Response(JSON.stringify(null), { status: 200 });
    }

    // Convert Decimal fields to strings for JSON serialization
    return new Response(JSON.stringify(serializeAllowance(allowance)), { status: 200 });
  } catch (err) {
    console.error("Allowances GET error:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

// =============================================================================
// PUT /api/allowances - Create or update current allowance safely
// =============================================================================
// Request body: { amount, frequency }
// `amount` is treated as the user's base allowance. Existing additional income
// is preserved by adding it to the stored total allowance amount.
export async function PUT(req) {
  try {
    const { user, errorResponse } = await requireAuthenticatedUser(req);
    if (errorResponse) return errorResponse;

    const { amount, frequency = "monthly" } = await req.json();

    if (typeof amount !== "number" || Number.isNaN(amount) || amount <= 0) {
      return new Response(JSON.stringify({ error: "amount must be a positive number" }), {
        status: 400,
      });
    }

    if (!ALLOWED_FREQUENCIES.has(frequency)) {
      return new Response(JSON.stringify({ error: "frequency is invalid" }), { status: 400 });
    }

    const baseAmount = Math.round(amount);
    const { month, year } = getCurrentPeriod();

    const result = await prisma.$transaction(async (tx) => {
      const existing = await tx.allowances.findFirst({
        where: {
          user_id: user.id,
          month,
          year,
        },
      });

      if (!existing) {
        const created = await tx.allowances.create({
          data: {
            user_id: user.id,
            month,
            year,
            amount: baseAmount,
            remaining: baseAmount,
            frequency,
          },
        });

        return {
          status: 200,
          payload: serializeAllowance(created),
        };
      }

      const incomeAggregate = await tx.additional_incomes.aggregate({
        where: {
          user_id: user.id,
          allowance_id: existing.id,
        },
        _sum: {
          amount: true,
        },
      });

      const expenseAggregate = await tx.expenses.aggregate({
        where: {
          user_id: user.id,
          allowance_id: existing.id,
        },
        _sum: {
          amount: true,
        },
      });

      const additionalIncomeTotal = incomeAggregate._sum.amount || 0;
      const expenseTotal = expenseAggregate._sum.amount || 0;
      const nextAmount = baseAmount + additionalIncomeTotal;
      const nextRemaining = nextAmount - expenseTotal;

      if (nextRemaining < 0) {
        return {
          status: 400,
          payload: {
            error: "Nominal uang saku terlalu kecil untuk pengeluaran yang sudah tercatat.",
            minimumBaseAmount: Math.max(expenseTotal - additionalIncomeTotal, 1),
            expenseTotal,
            additionalIncomeTotal,
          },
        };
      }

      const updated = await tx.allowances.update({
        where: {
          id: existing.id,
        },
        data: {
          amount: nextAmount,
          remaining: nextRemaining,
          frequency,
          updated_at: new Date(),
        },
      });

      return {
        status: 200,
        payload: serializeAllowance(updated),
      };
    });

    return new Response(JSON.stringify(result.payload), { status: result.status });
  } catch (err) {
    console.error("Allowances PUT error:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
