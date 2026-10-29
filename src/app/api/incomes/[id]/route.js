import prisma, { transactionOptions } from "@/lib/prisma";
import {
  findOrCreateAllowanceForPeriod,
  parseFinanceDate,
  parsePositiveAmount,
  validateTextLength,
} from "@/lib/financeValidation.mjs";
import { requireAllowedMutationOrigin } from "@/lib/mutationOrigin";
import { requireAuthenticatedUser } from "@/lib/supabaseServer";

const resolveAllowanceForDate = async (tx, userId, { month, year }) => {
  const { allowance } = await findOrCreateAllowanceForPeriod(tx, userId, { month, year });
  return allowance;
};

const applyAllowanceDelta = async (tx, userId, allowanceId, delta) => {
  const allowance = await tx.allowances.findFirst({
    where: { id: allowanceId, user_id: userId },
  });
  if (!allowance) {
    return { status: 404, payload: { error: "Allowance not found" } };
  }

  if (delta < 0) {
    const required = Math.abs(delta);
    const updated = await tx.allowances.updateMany({
      where: {
        id: allowance.id,
        user_id: userId,
        amount: { gte: required },
        remaining: { gte: required },
      },
      data: {
        amount: { decrement: required },
        remaining: { decrement: required },
        updated_at: new Date(),
      },
    });
    if (updated.count !== 1) {
      return {
        status: 400,
        payload: { error: "Pendapatan tidak dapat diubah karena saldo sudah terpakai." },
      };
    }

    const refreshed = await tx.allowances.findFirst({
      where: { id: allowance.id, user_id: userId },
    });
    return {
      status: 200,
      payload: {
        ...refreshed,
        amount: refreshed.amount.toString(),
        remaining: refreshed.remaining.toString(),
      },
    };
  }

  const updatedAllowance = await tx.allowances.update({
    where: { id: allowance.id },
    data: {
      amount: { increment: delta },
      remaining: { increment: delta },
      updated_at: new Date(),
    },
  });

  return {
    status: 200,
    payload: {
      ...updatedAllowance,
      amount: updatedAllowance.amount.toString(),
      remaining: updatedAllowance.remaining.toString(),
    },
  };
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

export async function PUT(req, { params }) {
  try {
    const { user, authMethod, errorResponse } = await requireAuthenticatedUser(req);
    if (errorResponse) return errorResponse;
    const originError = requireAllowedMutationOrigin(req, authMethod);
    if (originError) return originError;

    const incomeId = (await params)?.id;
    if (!incomeId) return new Response(JSON.stringify({ error: "id is required" }), { status: 400 });

    const { amount, source, note, date } = await req.json();
    const input = validateIncomeInput(amount, source, note, date);
    if (!input.ok) return new Response(JSON.stringify({ error: input.error }), { status: 400 });

    const result = await prisma.$transaction(async (tx) => {
      const existingIncome = await tx.additional_incomes.findFirst({
        where: { id: incomeId, user_id: user.id },
      });
      if (!existingIncome) return { status: 404, payload: { error: "Income not found" } };

      const isSamePeriod = existingIncome.date.getMonth() === input.date.date.getMonth()
        && existingIncome.date.getFullYear() === input.date.date.getFullYear();

      if (isSamePeriod) {
        const allowance = await applyAllowanceDelta(
          tx,
          user.id,
          existingIncome.allowance_id,
          input.amount - existingIncome.amount,
        );
        if (allowance.status !== 200) return allowance;

        const income = await tx.additional_incomes.update({
          where: { id: existingIncome.id },
          data: {
            amount: input.amount,
            source: input.source,
            note: input.note,
            date: input.date.date,
            updated_at: new Date(),
          },
        });

        return { status: 200, payload: { income, allowance: allowance.payload } };
      }

      const rollback = await applyAllowanceDelta(
        tx,
        user.id,
        existingIncome.allowance_id,
        -existingIncome.amount,
      );
      if (rollback.status !== 200) return rollback;

      const targetAllowance = await resolveAllowanceForDate(tx, user.id, input.date);
      const allowance = await applyAllowanceDelta(tx, user.id, targetAllowance.id, input.amount);
      if (allowance.status !== 200) return allowance;

      const income = await tx.additional_incomes.update({
        where: { id: existingIncome.id },
        data: {
          allowance_id: targetAllowance.id,
          amount: input.amount,
          source: input.source,
          note: input.note,
          date: input.date.date,
          updated_at: new Date(),
        },
      });

      return { status: 200, payload: { income, allowance: allowance.payload } };
    }, transactionOptions);

    return new Response(JSON.stringify(result.payload), { status: result.status });
  } catch (error) {
    console.error("Incomes PUT error:", error);
    return new Response(JSON.stringify({ error: "Terjadi kesalahan pada server." }), { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const { user, authMethod, errorResponse } = await requireAuthenticatedUser(req);
    if (errorResponse) return errorResponse;
    const originError = requireAllowedMutationOrigin(req, authMethod);
    if (originError) return originError;

    const incomeId = (await params)?.id;
    if (!incomeId) return new Response(JSON.stringify({ error: "id is required" }), { status: 400 });

    const result = await prisma.$transaction(async (tx) => {
      const existingIncome = await tx.additional_incomes.findFirst({
        where: { id: incomeId, user_id: user.id },
      });
      if (!existingIncome) return { status: 404, payload: { error: "Income not found" } };

      const allowance = await applyAllowanceDelta(
        tx,
        user.id,
        existingIncome.allowance_id,
        -existingIncome.amount,
      );
      if (allowance.status !== 200) return allowance;

      await tx.additional_incomes.delete({ where: { id: existingIncome.id } });
      return { status: 200, payload: { success: true, allowance: allowance.payload } };
    }, transactionOptions);

    return new Response(JSON.stringify(result.payload), { status: result.status });
  } catch (error) {
    console.error("Incomes DELETE error:", error);
    return new Response(JSON.stringify({ error: "Terjadi kesalahan pada server." }), { status: 500 });
  }
}
