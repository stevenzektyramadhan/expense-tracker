// =============================================================================
// ALLOWANCES API ROUTE - REFACTORED TO USE PRISMA
// =============================================================================
// This file handles CRUD operations for the 'allowances' table.
// Allowances represent a monthly budget the user sets for themselves.
// =============================================================================

// Import our Prisma singleton - this ensures we reuse the same database connection
import prisma from "@/lib/prisma";

// =============================================================================
// POST /api/allowances - Create or return existing allowance for current month
// =============================================================================
export async function POST(req) {
  try {
    // Parse the JSON body from the request
    // user_id: The authenticated user's UUID
    // amount: The budget amount for the month (Decimal in database)
    const { user_id, amount } = await req.json();

    // Get current month and year to find or create the correct allowance
    const now = new Date();
    const month = now.getMonth() + 1; // JavaScript months are 0-indexed, so add 1 (1-12)
    const year = now.getFullYear();

    // =========================================================================
    // STEP 1: Check if an allowance already exists for this month/year
    // =========================================================================
    // Using Prisma's findFirst() method to query for existing allowance
    // This is equivalent to Supabase's .select().eq().single()
    // The 'where' clause specifies our filter conditions
    const existing = await prisma.allowances.findFirst({
      where: {
        user_id: user_id,  // Match the user
        month: month,       // Match the month
        year: year,         // Match the year
      },
    });

    // If allowance already exists for this month, return it (idempotent behavior)
    // This prevents duplicate allowances for the same month
    if (existing) {
      // Convert Decimal fields to strings for JSON serialization
      // Prisma returns Decimal objects which need conversion for JSON response
      const responseData = {
        ...existing,
        amount: existing.amount.toString(),
        remaining: existing.remaining.toString(),
      };
      return new Response(JSON.stringify(responseData), { status: 200 });
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
        user_id: user_id,
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
    const responseData = {
      ...newAllowance,
      amount: newAllowance.amount.toString(),
      remaining: newAllowance.remaining.toString(),
    };

    return new Response(JSON.stringify(responseData), { status: 200 });
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
    // Extract user_id from URL query parameters
    // Example: /api/allowances?user_id=abc-123
    const { searchParams } = new URL(req.url);
    const user_id = searchParams.get("user_id");

    // Validate that user_id was provided
    if (!user_id) {
      return new Response(
        JSON.stringify({ error: "user_id is required" }),
        { status: 400 }
      );
    }

    // Get current month and year
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    // Query for the current month's allowance using Prisma
    // findFirst returns null if no record is found (no error thrown)
    const allowance = await prisma.allowances.findFirst({
      where: {
        user_id: user_id,
        month: month,
        year: year,
      },
    });

    // If no allowance found, return null (frontend can handle this)
    if (!allowance) {
      return new Response(JSON.stringify(null), { status: 200 });
    }

    // Convert Decimal fields to strings for JSON serialization
    const responseData = {
      ...allowance,
      amount: allowance.amount.toString(),
      remaining: allowance.remaining.toString(),
    };

    return new Response(JSON.stringify(responseData), { status: 200 });
  } catch (err) {
    console.error("Allowances GET error:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
