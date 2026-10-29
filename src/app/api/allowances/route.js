import prisma, { transactionOptions } from "@/lib/prisma";
import { parsePositiveAmount } from "@/lib/financeValidation.mjs";
import { requireAllowedMutationOrigin } from "@/lib/mutationOrigin";
import { requireAuthenticatedUser } from "@/lib/supabaseServer";

const ALLOWED_FREQUENCIES = new Set(["weekly", "monthly"]);

const serializeAllowance = (allowance) => ({
  ...allowance,
  amount: allowance.amount.toString(),
  remaining: allowance.remaining.toString(),
});

const getCurrentPeriod = () => {
  const now = new Date();
  return { month: now.getMonth() + 1, year: now.getFullYear() };
};

export async function POST(req) {
  try {
    const { user, authMethod, errorResponse } = await requireAuthenticatedUser(req);
    if (errorResponse) return errorResponse;
    const originError = requireAllowedMutationOrigin(req, authMethod);
    if (originError) return originError;

    const { amount } = await req.json();
    const parsedAmount = parsePositiveAmount(amount);
    if (!parsedAmount.ok) {
      return new Response(JSON.stringify({ error: parsedAmount.error }), { status: 400 });
    }

    const { month, year } = getCurrentPeriod();
    const allowance = await prisma.$transaction(async (tx) => {
      const existing = await tx.allowances.findFirst({
        where: { user_id: user.id, month, year },
      });
      if (existing) return existing;

      return tx.allowances.create({
        data: {
          user_id: user.id,
          month,
          year,
          amount: parsedAmount.amount,
          remaining: parsedAmount.amount,
        },
      });
    }, transactionOptions);

    return new Response(JSON.stringify(serializeAllowance(allowance)), { status: 200 });
  } catch (error) {
    console.error("Allowances POST error:", error);
    return new Response(JSON.stringify({ error: "Terjadi kesalahan pada server." }), { status: 500 });
  }
}

export async function GET(req) {
  try {
    const { user, errorResponse } = await requireAuthenticatedUser(req);
    if (errorResponse) return errorResponse;

    const { month, year } = getCurrentPeriod();
    const allowance = await prisma.allowances.findFirst({
      where: { user_id: user.id, month, year },
    });

    return new Response(JSON.stringify(allowance ? serializeAllowance(allowance) : null), { status: 200 });
  } catch (error) {
    console.error("Allowances GET error:", error);
    return new Response(JSON.stringify({ error: "Terjadi kesalahan pada server." }), { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const { user, authMethod, errorResponse } = await requireAuthenticatedUser(req);
    if (errorResponse) return errorResponse;
    const originError = requireAllowedMutationOrigin(req, authMethod);
    if (originError) return originError;

    const { amount, frequency = "monthly" } = await req.json();
    const parsedAmount = parsePositiveAmount(amount);
    if (!parsedAmount.ok) {
      return new Response(JSON.stringify({ error: parsedAmount.error }), { status: 400 });
    }
    if (!ALLOWED_FREQUENCIES.has(frequency)) {
      return new Response(JSON.stringify({ error: "frequency is invalid" }), { status: 400 });
    }

    const { month, year } = getCurrentPeriod();
    const result = await prisma.$transaction(async (tx) => {
      const existing = await tx.allowances.findFirst({
        where: { user_id: user.id, month, year },
      });
      if (!existing) {
        const allowance = await tx.allowances.create({
          data: {
            user_id: user.id,
            month,
            year,
            amount: parsedAmount.amount,
            remaining: parsedAmount.amount,
            frequency,
          },
        });
        return { status: 200, payload: serializeAllowance(allowance) };
      }

      const [incomes, expenses] = await Promise.all([
        tx.additional_incomes.aggregate({
          where: { user_id: user.id, allowance_id: existing.id },
          _sum: { amount: true },
        }),
        tx.expenses.aggregate({
          where: { user_id: user.id, allowance_id: existing.id },
          _sum: { amount: true },
        }),
      ]);
      const additionalIncomeTotal = incomes._sum.amount ?? 0;
      const expenseTotal = expenses._sum.amount ?? 0;
      const nextAmount = parsedAmount.amount + additionalIncomeTotal;
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

      const allowance = await tx.allowances.update({
        where: { id: existing.id },
        data: {
          amount: nextAmount,
          remaining: nextRemaining,
          frequency,
          updated_at: new Date(),
        },
      });
      return { status: 200, payload: serializeAllowance(allowance) };
    }, transactionOptions);

    return new Response(JSON.stringify(result.payload), { status: result.status });
  } catch (error) {
    console.error("Allowances PUT error:", error);
    return new Response(JSON.stringify({ error: "Terjadi kesalahan pada server." }), { status: 500 });
  }
}
