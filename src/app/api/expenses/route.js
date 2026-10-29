import prisma, { transactionOptions } from "@/lib/prisma";
import {
  parseFinanceDate,
  parsePositiveAmount,
  planExpenseBalanceChange,
  validateTextLength,
} from "@/lib/financeValidation.mjs";
import { requireAllowedMutationOrigin } from "@/lib/mutationOrigin";
import { resolveOwnedReceipt } from "@/lib/receiptAsset";
import { requireAuthenticatedUser } from "@/lib/supabaseServer";

const parseDateBoundary = (value, { inclusiveEnd = false } = {}) => {
  if (!value) return null;

  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return "invalid";

  if (inclusiveEnd) date.setDate(date.getDate() + 1);
  return date;
};

const transactionErrorResponse = (error) => {
  if (typeof error?.status !== "number" || typeof error?.message !== "string") {
    return null;
  }

  return new Response(JSON.stringify({ error: error.message }), { status: error.status });
};

const validateExpenseInput = (amount, category, description, date) => {
  const parsedAmount = parsePositiveAmount(amount);
  if (!parsedAmount.ok) return parsedAmount;

  const parsedDate = parseFinanceDate(date);
  if (!parsedDate.ok) return parsedDate;

  const parsedCategory = validateTextLength(category, 100, "Kategori", { required: true });
  if (!parsedCategory.ok) return parsedCategory;

  const parsedDescription = validateTextLength(description, 500, "Deskripsi");
  if (!parsedDescription.ok) return parsedDescription;

  return {
    ok: true,
    amount: parsedAmount.amount,
    category: parsedCategory.value,
    date: parsedDate,
    description: parsedDescription.value ?? "",
  };
};

const resolveReceipt = async (receiptPublicId, userId) => {
  if (receiptPublicId === undefined || receiptPublicId === null) return null;
  if (!receiptPublicId || typeof receiptPublicId !== "string") {
    return { error: "receipt_public_id is invalid" };
  }

  const receipt = await resolveOwnedReceipt(receiptPublicId, userId);
  return receipt ?? { error: "Receipt is invalid or does not belong to this user" };
};

export async function POST(req) {
  try {
    const { user, authMethod, errorResponse } = await requireAuthenticatedUser(req);
    if (errorResponse) return errorResponse;
    const originError = requireAllowedMutationOrigin(req, authMethod);
    if (originError) return originError;

    const { amount, description, category, date, receipt_public_id: receiptPublicId } = await req.json();
    const input = validateExpenseInput(amount, category, description, date);
    if (!input.ok) return new Response(JSON.stringify({ error: input.error }), { status: 400 });

    const receipt = await resolveReceipt(receiptPublicId, user.id);
    if (receipt?.error) return new Response(JSON.stringify({ error: receipt.error }), { status: 400 });

    const expense = await prisma.$transaction(async (tx) => {
      const allowance = await tx.allowances.findFirst({
        where: {
          user_id: user.id,
          month: input.date.month,
          year: input.date.year,
        },
      });

      if (!allowance) {
        throw { status: 400, message: "Allowance bulan ini belum dibuat" };
      }
      if (Number(allowance.remaining) < input.amount) {
        throw { status: 400, message: "Saldo tidak cukup! Hemat pangkal kaya." };
      }

      const createdExpense = await tx.expenses.create({
        data: {
          user_id: user.id,
          amount: input.amount,
          description: input.description,
          category: input.category,
          date: input.date.date,
          allowance_id: allowance.id,
          receipt_url: receipt?.secureUrl ?? null,
          receipt_public_id: receipt?.publicId ?? null,
        },
      });

      await tx.allowances.update({
        where: { id: allowance.id },
        data: {
          remaining: { decrement: input.amount },
          updated_at: new Date(),
        },
      });

      return createdExpense;
    }, transactionOptions);

    return new Response(JSON.stringify(expense), { status: 200 });
  } catch (error) {
    const expectedError = transactionErrorResponse(error);
    if (expectedError) return expectedError;

    console.error("Expenses POST error:", error);
    return new Response(JSON.stringify({ error: "Terjadi kesalahan pada server." }), { status: 500 });
  }
}

export async function GET(req) {
  try {
    const { user, errorResponse } = await requireAuthenticatedUser(req);
    if (errorResponse) return errorResponse;

    const { searchParams } = new URL(req.url);
    const startDate = parseDateBoundary(searchParams.get("startDate"));
    const endDate = parseDateBoundary(searchParams.get("endDate"), { inclusiveEnd: true });
    if (startDate === "invalid" || endDate === "invalid") {
      return new Response(JSON.stringify({ error: "Invalid date filter" }), { status: 400 });
    }

    const dateFilter = {};
    if (startDate) dateFilter.gte = startDate;
    if (endDate) dateFilter.lt = endDate;

    const expenses = await prisma.expenses.findMany({
      where: {
        user_id: user.id,
        ...(Object.keys(dateFilter).length > 0 ? { date: dateFilter } : {}),
      },
      orderBy: { date: "desc" },
    });

    return new Response(JSON.stringify(expenses), { status: 200 });
  } catch (error) {
    console.error("Expenses GET error:", error);
    return new Response(JSON.stringify({ error: "Terjadi kesalahan pada server." }), { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const { user, authMethod, errorResponse } = await requireAuthenticatedUser(req);
    if (errorResponse) return errorResponse;
    const originError = requireAllowedMutationOrigin(req, authMethod);
    if (originError) return originError;

    const { id, amount, category, date, description, receipt_public_id: receiptPublicId } = await req.json();
    if (!id || typeof id !== "string") {
      return new Response(JSON.stringify({ error: "id is required" }), { status: 400 });
    }

    const input = validateExpenseInput(amount, category, description, date);
    if (!input.ok) return new Response(JSON.stringify({ error: input.error }), { status: 400 });

    const receipt = await resolveReceipt(receiptPublicId, user.id);
    if (receipt?.error) return new Response(JSON.stringify({ error: receipt.error }), { status: 400 });

    const expense = await prisma.$transaction(async (tx) => {
      const existingExpense = await tx.expenses.findUnique({ where: { id } });
      if (!existingExpense || existingExpense.user_id !== user.id) {
        throw { status: 404, message: "Expense not found" };
      }

      const currentAllowance = existingExpense.allowance_id
        ? await tx.allowances.findFirst({
            where: { id: existingExpense.allowance_id, user_id: user.id },
          })
        : null;
      const targetAllowance = await tx.allowances.findFirst({
        where: {
          user_id: user.id,
          month: input.date.month,
          year: input.date.year,
        },
      });

      if (!targetAllowance) {
        throw { status: 400, message: "Allowance bulan ini belum dibuat" };
      }

      const balanceChange = planExpenseBalanceChange({
        existingAmount: Number(existingExpense.amount),
        existingAllowanceId: currentAllowance?.id ?? null,
        nextAmount: input.amount,
        targetAllowance,
      });

      if (balanceChange.isSamePeriod) {
        if (balanceChange.difference > 0 && Number(targetAllowance.remaining) < balanceChange.difference) {
          throw { status: 400, message: "Saldo tidak cukup! Hemat pangkal kaya." };
        }

        await tx.allowances.update({
          where: { id: targetAllowance.id },
          data: {
            remaining: { decrement: balanceChange.difference },
            updated_at: new Date(),
          },
        });
      } else {
        if (Number(targetAllowance.remaining) < input.amount) {
          throw { status: 400, message: "Saldo tidak cukup! Hemat pangkal kaya." };
        }
        if (currentAllowance) {
          await tx.allowances.update({
            where: { id: currentAllowance.id },
            data: {
              remaining: { increment: Number(existingExpense.amount) },
              updated_at: new Date(),
            },
          });
        }
        await tx.allowances.update({
          where: { id: targetAllowance.id },
          data: {
            remaining: { decrement: input.amount },
            updated_at: new Date(),
          },
        });
      }

      return tx.expenses.update({
        where: { id: existingExpense.id },
        data: {
          amount: input.amount,
          category: input.category,
          description: input.description,
          date: input.date.date,
          allowance_id: targetAllowance.id,
          receipt_url: receipt?.secureUrl ?? existingExpense.receipt_url,
          receipt_public_id: receipt?.publicId ?? existingExpense.receipt_public_id,
        },
      });
    }, transactionOptions);

    return new Response(JSON.stringify(expense), { status: 200 });
  } catch (error) {
    const expectedError = transactionErrorResponse(error);
    if (expectedError) return expectedError;

    console.error("Expenses PUT error:", error);
    return new Response(JSON.stringify({ error: "Terjadi kesalahan pada server." }), { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const { user, authMethod, errorResponse } = await requireAuthenticatedUser(req);
    if (errorResponse) return errorResponse;
    const originError = requireAllowedMutationOrigin(req, authMethod);
    if (originError) return originError;

    const { id } = await req.json();
    if (!id || typeof id !== "string") {
      return new Response(JSON.stringify({ error: "id is required" }), { status: 400 });
    }

    await prisma.$transaction(async (tx) => {
      const expense = await tx.expenses.findUnique({ where: { id } });
      if (!expense || expense.user_id !== user.id) {
        throw { status: 404, message: "Expense not found" };
      }

      const allowance = expense.allowance_id
        ? await tx.allowances.findFirst({
            where: { id: expense.allowance_id, user_id: user.id },
          })
        : null;

      await tx.expenses.delete({ where: { id: expense.id } });
      if (allowance) {
        await tx.allowances.update({
          where: { id: allowance.id },
          data: {
            remaining: { increment: Number(expense.amount) },
            updated_at: new Date(),
          },
        });
      }
    }, transactionOptions);

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    const expectedError = transactionErrorResponse(error);
    if (expectedError) return expectedError;

    console.error("Expenses DELETE error:", error);
    return new Response(JSON.stringify({ error: "Terjadi kesalahan pada server." }), { status: 500 });
  }
}
