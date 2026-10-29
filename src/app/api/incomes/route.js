import prisma, { transactionOptions } from "@/lib/prisma";
import {
  parseFinanceDate,
  parsePositiveAmount,
  validateTextLength,
} from "@/lib/financeValidation.mjs";
import { requireAllowedMutationOrigin } from "@/lib/mutationOrigin";
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

const buildPeriodRange = (month, year) => ({
  start: new Date(year, month - 1, 1),
  end: new Date(year, month, 1),
});

const resolveAllowanceForDate = async (tx, userId, { month, year }) => {
  const allowance = await tx.allowances.findFirst({
    where: { user_id: userId, month, year },
  });
  if (allowance) return allowance;

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

const validateIncomeInput = (amount, source, note, date) => {
  const parsedAmount = parsePositiveAmount(amount);
  if (!parsedAmount.ok) return parsedAmount;

  const parsedDate = parseFinanceDate(date);
  if (!parsedDate.ok) return parsedDate;

  const parsedSource = validateTextLength(source, 150, "Sumber pendapatan", { required: true });
  if (!parsedSource.ok) return parsedSource;

  const parsedNote = validateTextLength(note, 500, "Catatan");
  if (!parsedNote.ok) return parsedNote;

  return {
    ok: true,
    amount: parsedAmount.amount,
    date: parsedDate,
    note: parsedNote.value,
    source: parsedSource.value,
  };
};

export async function GET(req) {
  try {
    const { user, errorResponse } = await requireAuthenticatedUser(req);
    if (errorResponse) return errorResponse;

    const { searchParams } = new URL(req.url);
    const now = new Date();
    const month = parseMonth(searchParams.get("month")) || now.getMonth() + 1;
    const year = parseYear(searchParams.get("year")) || now.getFullYear();
    const { start, end } = buildPeriodRange(month, year);

    const incomes = await prisma.additional_incomes.findMany({
      where: { user_id: user.id, date: { gte: start, lt: end } },
      orderBy: { date: "desc" },
    });

    return new Response(JSON.stringify({ data: incomes }), { status: 200 });
  } catch (error) {
    console.error("Incomes GET error:", error);
    return new Response(JSON.stringify({ error: "Terjadi kesalahan pada server." }), { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { user, authMethod, errorResponse } = await requireAuthenticatedUser(req);
    if (errorResponse) return errorResponse;
    const originError = requireAllowedMutationOrigin(req, authMethod);
    if (originError) return originError;

    const { amount, source, note, date } = await req.json();
    const input = validateIncomeInput(amount, source, note, date);
    if (!input.ok) return new Response(JSON.stringify({ error: input.error }), { status: 400 });

    const result = await prisma.$transaction(async (tx) => {
      const allowance = await resolveAllowanceForDate(tx, user.id, input.date);
      const income = await tx.additional_incomes.create({
        data: {
          user_id: user.id,
          allowance_id: allowance.id,
          amount: input.amount,
          source: input.source,
          note: input.note,
          date: input.date.date,
        },
      });
      const updatedAllowance = await tx.allowances.update({
        where: { id: allowance.id },
        data: {
          amount: { increment: input.amount },
          remaining: { increment: input.amount },
          updated_at: new Date(),
        },
      });

      return {
        income,
        allowance: {
          ...updatedAllowance,
          amount: updatedAllowance.amount.toString(),
          remaining: updatedAllowance.remaining.toString(),
        },
      };
    }, transactionOptions);

    return new Response(JSON.stringify(result), { status: 200 });
  } catch (error) {
    console.error("Incomes POST error:", error);
    return new Response(JSON.stringify({ error: "Terjadi kesalahan pada server." }), { status: 500 });
  }
}
