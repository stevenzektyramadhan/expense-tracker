import prisma from "@/lib/prisma";
import { requireAuthenticatedUser } from "@/lib/supabaseServer";

const parseMonth = (value) => {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 12) return null;
  return parsed;
};

const parseYear = (value) => {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1970 || parsed > 3000) return null;
  return parsed;
};

const buildPeriodRange = (month, year) => {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 1);
  return { start, end };
};

const resolveAllowanceForDate = async (tx, userId, date) => {
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  const existing = await tx.allowances.findFirst({
    where: {
      user_id: userId,
      month,
      year,
    },
  });

  if (existing) return existing;

  return tx.allowances.create({
    data: {
      user_id: userId,
      month,
      year,
      amount: 0,
      remaining: 0,
      frequency: "monthly",
    },
  });
};

export async function GET(req) {
  try {
    const { user, errorResponse } = await requireAuthenticatedUser(req);
    if (errorResponse) return errorResponse;

    const { searchParams } = new URL(req.url);
    const now = new Date();
    const queryMonth = parseMonth(searchParams.get("month"));
    const queryYear = parseYear(searchParams.get("year"));

    const month = queryMonth || now.getMonth() + 1;
    const year = queryYear || now.getFullYear();
    const { start, end } = buildPeriodRange(month, year);

    const incomes = await prisma.additional_incomes.findMany({
      where: {
        user_id: user.id,
        date: {
          gte: start,
          lt: end,
        },
      },
      orderBy: {
        date: "desc",
      },
    });

    return new Response(JSON.stringify({ data: incomes }), { status: 200 });
  } catch (err) {
    console.error("Incomes GET error:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { user, errorResponse } = await requireAuthenticatedUser(req);
    if (errorResponse) return errorResponse;

    const { amount, source, note, date } = await req.json();

    if (typeof amount !== "number" || Number.isNaN(amount) || amount <= 0) {
      return new Response(JSON.stringify({ error: "amount must be a positive number" }), {
        status: 400,
      });
    }

    const incomeDate = date ? new Date(date) : new Date();
    if (Number.isNaN(incomeDate.getTime())) {
      return new Response(JSON.stringify({ error: "date is invalid" }), { status: 400 });
    }

    const roundedAmount = Math.round(amount);

    const result = await prisma.$transaction(async (tx) => {
      const allowance = await resolveAllowanceForDate(tx, user.id, incomeDate);
      const nextAmount = Number(allowance.amount) + roundedAmount;
      const nextRemaining = Number(allowance.remaining) + roundedAmount;

      const createdIncome = await tx.additional_incomes.create({
        data: {
          user_id: user.id,
          allowance_id: allowance.id,
          amount: roundedAmount,
          source: source || null,
          note: note || null,
          date: incomeDate,
        },
      });

      const updatedAllowance = await tx.allowances.update({
        where: {
          id: allowance.id,
        },
        data: {
          amount: nextAmount,
          remaining: nextRemaining,
          updated_at: new Date(),
        },
      });

      return {
        income: createdIncome,
        allowance: {
          ...updatedAllowance,
          amount: updatedAllowance.amount.toString(),
          remaining: updatedAllowance.remaining.toString(),
        },
      };
    });

    return new Response(JSON.stringify(result), { status: 200 });
  } catch (err) {
    console.error("Incomes POST error:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
