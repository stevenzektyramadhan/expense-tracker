import prisma from "@/lib/prisma";
import { requireAuthenticatedUser } from "@/lib/supabaseServer";

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

const applyAllowanceDelta = async (tx, allowanceId, delta) => {
  const allowance = await tx.allowances.findUnique({
    where: { id: allowanceId },
  });

  if (!allowance) {
    return {
      status: 404,
      payload: { error: "Allowance not found" },
    };
  }

  const nextAmount = Number(allowance.amount) + delta;
  const nextRemaining = Number(allowance.remaining) + delta;

  if (nextAmount < 0 || nextRemaining < 0) {
    return {
      status: 400,
      payload: {
        error: "Pendapatan tidak dapat diubah karena saldo sudah terpakai.",
      },
    };
  }

  const normalizedRemaining = Math.min(nextRemaining, nextAmount);

  const updatedAllowance = await tx.allowances.update({
    where: { id: allowance.id },
    data: {
      amount: nextAmount,
      remaining: normalizedRemaining,
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

export async function PUT(req, { params }) {
  try {
    const { user, errorResponse } = await requireAuthenticatedUser(req);
    if (errorResponse) return errorResponse;

    const resolvedParams = await params;
    const incomeId = resolvedParams?.id;
    if (!incomeId) {
      return new Response(JSON.stringify({ error: "id is required" }), { status: 400 });
    }

    const { amount, source, note, date } = await req.json();

    if (typeof amount !== "number" || Number.isNaN(amount) || amount <= 0) {
      return new Response(JSON.stringify({ error: "amount must be a positive number" }), {
        status: 400,
      });
    }

    const incomeDate = date ? new Date(date) : null;
    if (!incomeDate || Number.isNaN(incomeDate.getTime())) {
      return new Response(JSON.stringify({ error: "date is invalid" }), { status: 400 });
    }

    const roundedAmount = Math.round(amount);

    const result = await prisma.$transaction(async (tx) => {
      const existingIncome = await tx.additional_incomes.findFirst({
        where: {
          id: incomeId,
          user_id: user.id,
        },
      });

      if (!existingIncome) {
        return {
          status: 404,
          payload: { error: "Income not found" },
        };
      }

      const oldMonth = existingIncome.date.getMonth();
      const oldYear = existingIncome.date.getFullYear();
      const newMonth = incomeDate.getMonth();
      const newYear = incomeDate.getFullYear();
      const isSamePeriod = oldMonth === newMonth && oldYear === newYear;

      if (isSamePeriod) {
        const delta = roundedAmount - existingIncome.amount;
        const allowanceResult = await applyAllowanceDelta(tx, existingIncome.allowance_id, delta);

        if (allowanceResult.status !== 200) {
          return allowanceResult;
        }

        const updatedIncome = await tx.additional_incomes.update({
          where: { id: existingIncome.id },
          data: {
            amount: roundedAmount,
            source: source || null,
            note: note || null,
            date: incomeDate,
            updated_at: new Date(),
          },
        });

        return {
          status: 200,
          payload: {
            income: updatedIncome,
            allowance: allowanceResult.payload,
          },
        };
      }

      const rollbackOldAllowance = await applyAllowanceDelta(tx, existingIncome.allowance_id, -existingIncome.amount);
      if (rollbackOldAllowance.status !== 200) {
        return rollbackOldAllowance;
      }

      const targetAllowance = await resolveAllowanceForDate(tx, user.id, incomeDate);
      const applyNewAllowance = await applyAllowanceDelta(tx, targetAllowance.id, roundedAmount);
      if (applyNewAllowance.status !== 200) {
        return applyNewAllowance;
      }

      const updatedIncome = await tx.additional_incomes.update({
        where: { id: existingIncome.id },
        data: {
          allowance_id: targetAllowance.id,
          amount: roundedAmount,
          source: source || null,
          note: note || null,
          date: incomeDate,
          updated_at: new Date(),
        },
      });

      return {
        status: 200,
        payload: {
          income: updatedIncome,
          allowance: applyNewAllowance.payload,
        },
      };
    });

    return new Response(JSON.stringify(result.payload), { status: result.status });
  } catch (err) {
    console.error("Incomes PUT error:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const { user, errorResponse } = await requireAuthenticatedUser(req);
    if (errorResponse) return errorResponse;

    const resolvedParams = await params;
    const incomeId = resolvedParams?.id;
    if (!incomeId) {
      return new Response(JSON.stringify({ error: "id is required" }), { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      const existingIncome = await tx.additional_incomes.findFirst({
        where: {
          id: incomeId,
          user_id: user.id,
        },
      });

      if (!existingIncome) {
        return {
          status: 404,
          payload: { error: "Income not found" },
        };
      }

      const allowanceResult = await applyAllowanceDelta(tx, existingIncome.allowance_id, -existingIncome.amount);
      if (allowanceResult.status !== 200) {
        return allowanceResult;
      }

      await tx.additional_incomes.delete({
        where: { id: existingIncome.id },
      });

      return {
        status: 200,
        payload: {
          success: true,
          allowance: allowanceResult.payload,
        },
      };
    });

    return new Response(JSON.stringify(result.payload), { status: result.status });
  } catch (err) {
    console.error("Incomes DELETE error:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
