// =============================================================================
// EXPENSES API ROUTE - REFACTORED TO USE PRISMA
// =============================================================================
// This file handles CRUD operations for the 'expenses' table.
// When an expense is created, it also deducts from the user's monthly allowance.
// =============================================================================

// Import our Prisma singleton - this ensures we reuse the same database connection
import prisma from "@/lib/prisma";
import { requireAuthenticatedUser } from "@/lib/supabaseServer";

const clampRemainingBalance = (value, allowanceAmount) => {
  if (value < 0) return 0;
  if (value > allowanceAmount) return allowanceAmount;
  return value;
};

// =============================================================================
// POST /api/expenses - Create a new expense and deduct from allowance
// =============================================================================
// IMPORTANT: This route uses a Prisma TRANSACTION to ensure that:
// 1. The expense is created
// 2. The allowance remaining balance is decremented
// Both operations succeed or fail together (atomicity)
// =============================================================================
export async function POST(req) {
  try {
    const { user, errorResponse } = await requireAuthenticatedUser(req);
    if (errorResponse) return errorResponse;

    // Parse the JSON body from the request
    const { amount, description, category, date, receipt_url } = await req.json();

    if (typeof amount !== "number" || Number.isNaN(amount) || amount <= 0) {
      return new Response(JSON.stringify({ error: "amount must be a positive number" }), {
        status: 400,
      });
    }

    if (!category || !date) {
      return new Response(JSON.stringify({ error: "category and date are required" }), {
        status: 400,
      });
    }

    // Get current month and year for finding the active allowance
    const now = new Date();
    const month = now.getMonth() + 1; // JavaScript months are 0-indexed (0-11), so add 1
    const year = now.getFullYear();

    // =========================================================================
    // STEP 1: Find the active allowance for this month
    // =========================================================================
    // We need to find the allowance BEFORE the transaction because we need to:
    // 1. Check if it exists
    // 2. Get its ID for linking the expense
    // 3. Get the current remaining balance for calculation
    const allowance = await prisma.allowances.findFirst({
      where: {
        user_id: user.id,
        month: month,
        year: year,
      },
    });

    // If no allowance exists for this month, we can't create an expense
    // The user must create an allowance first
    if (!allowance) {
      return new Response(
        JSON.stringify({ error: "Allowance bulan ini belum dibuat" }),
        { status: 400 }
      );
    }

    // =========================================================================
    // STEP 2: Round the amount to Integer (CRITICAL!)
    // =========================================================================
    // The 'expenses' table has an 'amount' column of type INTEGER (int4)
    // If the user sends a float like 150000.75, we MUST round it
    // Math.round() rounds to nearest integer (150000.75 -> 150001)
    // Alternative: Math.floor() would truncate (150000.75 -> 150000)
    const roundedAmount = Math.round(amount);

    // =========================================================================
    // STEP 3: Calculate new remaining balance
    // =========================================================================
    // allowance.remaining is a Prisma Decimal object
    // We need to convert it to a Number for arithmetic operations
    // Then we subtract the expense amount to get the new balance
    const currentRemaining = Number(allowance.remaining);
    const newRemaining = currentRemaining - roundedAmount;

    // =========================================================================
    // STEP 3.5: BALANCE VALIDATION - Prevent negative balance
    // =========================================================================
    // Check if the user has sufficient balance before allowing the expense
    // This prevents overspending beyond the allocated monthly allowance
    if (newRemaining < 0) {
      return new Response(
        JSON.stringify({ 
          error: "Saldo tidak cukup! Hemat pangkal kaya.",
          currentBalance: currentRemaining,
          requestedAmount: roundedAmount 
        }),
        { status: 400 }
      );
    }

    // =========================================================================
    // STEP 4: Use a TRANSACTION for atomic operations
    // =========================================================================
    // prisma.$transaction() ensures that ALL operations inside either:
    // - ALL succeed (commit)
    // - ALL fail (rollback)
    // This prevents scenarios where expense is created but allowance isn't updated
    // (which would cause the balance to be incorrect)
    const result = await prisma.$transaction(async (tx) => {
      // Transaction Step A: Create the expense record
      // Using 'tx' (transaction client) instead of 'prisma' to ensure
      // this operation is part of the transaction
      const newExpense = await tx.expenses.create({
        data: {
          user_id: user.id,
          amount: roundedAmount,       // Using rounded integer value
          description: description,
          category: category,
          date: new Date(date),        // Convert date string to Date object
          allowance_id: allowance.id,  // Link expense to the allowance
          receipt_url: receipt_url,    // Store receipt image URL (can be null)
          // createdAt is auto-set by database default
        },
      });

      // Transaction Step B: Update the allowance's remaining balance
      // Using 'tx' to ensure this is part of the same transaction
      await tx.allowances.update({
        where: {
          id: allowance.id,  // Find the allowance by its ID
        },
        data: {
          remaining: newRemaining,  // Set the new remaining balance
          updated_at: new Date(),   // Update the timestamp
        },
      });

      // Return the created expense from the transaction
      // This will be the value of 'result' after the transaction commits
      return newExpense;
    });

    // Transaction committed successfully!
    // Return the created expense data
    return new Response(JSON.stringify(result), { status: 200 });
  } catch (err) {
    // If any error occurs (including transaction rollback), log and return error
    console.error("Expenses POST error:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

// =============================================================================
// GET /api/expenses - Fetch expenses for a user
// =============================================================================
// Query params: user_id (required)
// Returns all expenses for the user, ordered by date descending (newest first)
export async function GET(req) {
  try {
    const { user, errorResponse } = await requireAuthenticatedUser(req);
    if (errorResponse) return errorResponse;

    // =========================================================================
    // Fetch all expenses for the user
    // =========================================================================
    // Using findMany to get multiple records (unlike findFirst for single record)
    // orderBy specifies the sort order - newest expenses first
    const expenses = await prisma.expenses.findMany({
      where: {
        user_id: user.id,
      },
      orderBy: {
        date: "desc",  // Sort by date descending (newest first)
      },
    });

    // Return the expenses array
    // Note: expenses.amount is already an Integer, no conversion needed
    return new Response(JSON.stringify(expenses), { status: 200 });
  } catch (err) {
    console.error("Expenses GET error:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

// =============================================================================
// PUT /api/expenses - Update an existing expense and re-sync allowance
// =============================================================================
// Request body: { id, amount, category, date, description }
// Rules:
// - Expense must belong to authenticated user
// - If expense is linked to an allowance, update allowance.remaining by delta
// - Reject if updated amount would make balance negative
export async function PUT(req) {
  try {
    const { user, errorResponse } = await requireAuthenticatedUser(req);
    if (errorResponse) return errorResponse;

    const { id, amount, category, date, description } = await req.json();

    if (!id || typeof id !== "string") {
      return new Response(JSON.stringify({ error: "id is required" }), { status: 400 });
    }

    if (typeof amount !== "number" || Number.isNaN(amount) || amount <= 0) {
      return new Response(JSON.stringify({ error: "amount must be a positive number" }), {
        status: 400,
      });
    }

    if (!category || !date) {
      return new Response(JSON.stringify({ error: "category and date are required" }), {
        status: 400,
      });
    }

    const roundedAmount = Math.round(amount);

    const result = await prisma.$transaction(async (tx) => {
      const existingExpense = await tx.expenses.findFirst({
        where: {
          id,
          user_id: user.id,
        },
      });

      if (!existingExpense) {
        return {
          status: 404,
          payload: { error: "Expense not found" },
        };
      }

      if (existingExpense.allowance_id) {
        const allowance = await tx.allowances.findUnique({
          where: { id: existingExpense.allowance_id },
        });

        if (allowance) {
          const currentRemaining = Number(allowance.remaining);
          const allowanceAmount = Number(allowance.amount);
          const delta = roundedAmount - existingExpense.amount;
          const proposedRemaining = currentRemaining - delta;

          if (proposedRemaining < 0) {
            return {
              status: 400,
              payload: {
                error: "Saldo tidak cukup! Hemat pangkal kaya.",
                currentBalance: currentRemaining,
                requestedDelta: delta,
              },
            };
          }

          await tx.allowances.update({
            where: { id: allowance.id },
            data: {
              remaining: clampRemainingBalance(proposedRemaining, allowanceAmount),
              updated_at: new Date(),
            },
          });
        }
      }

      const updatedExpense = await tx.expenses.update({
        where: { id: existingExpense.id },
        data: {
          amount: roundedAmount,
          category,
          date: new Date(date),
          description,
        },
      });

      return {
        status: 200,
        payload: updatedExpense,
      };
    });

    return new Response(JSON.stringify(result.payload), { status: result.status });
  } catch (err) {
    console.error("Expenses PUT error:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

// =============================================================================
// DELETE /api/expenses - Delete expense and refund allowance balance
// =============================================================================
// Request body: { id }
// Rules:
// - Expense must belong to authenticated user
// - If linked to an allowance, add amount back to allowance.remaining
export async function DELETE(req) {
  try {
    const { user, errorResponse } = await requireAuthenticatedUser(req);
    if (errorResponse) return errorResponse;

    const { id } = await req.json();

    if (!id || typeof id !== "string") {
      return new Response(JSON.stringify({ error: "id is required" }), { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      const existingExpense = await tx.expenses.findFirst({
        where: {
          id,
          user_id: user.id,
        },
      });

      if (!existingExpense) {
        return {
          status: 404,
          payload: { error: "Expense not found" },
        };
      }

      if (existingExpense.allowance_id) {
        const allowance = await tx.allowances.findUnique({
          where: { id: existingExpense.allowance_id },
        });

        if (allowance) {
          const currentRemaining = Number(allowance.remaining);
          const allowanceAmount = Number(allowance.amount);
          const refundedRemaining = currentRemaining + existingExpense.amount;

          await tx.allowances.update({
            where: { id: allowance.id },
            data: {
              remaining: clampRemainingBalance(refundedRemaining, allowanceAmount),
              updated_at: new Date(),
            },
          });
        }
      }

      await tx.expenses.delete({
        where: { id: existingExpense.id },
      });

      return {
        status: 200,
        payload: { success: true },
      };
    });

    return new Response(JSON.stringify(result.payload), { status: result.status });
  } catch (err) {
    console.error("Expenses DELETE error:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
