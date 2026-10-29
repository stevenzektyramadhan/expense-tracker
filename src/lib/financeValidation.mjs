export const MAX_FINANCE_AMOUNT = 2_147_483_647;
export const WIB_OFFSET_MS = 7 * 60 * 60 * 1000;

const DATE_ONLY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

export const parsePositiveAmount = (value) => {
  const number = Number(value);
  const amount = Math.round(number);

  if (!Number.isFinite(number) || amount <= 0 || amount > MAX_FINANCE_AMOUNT) {
    return { ok: false, error: "Nominal harus lebih dari 0 dan dalam batas wajar" };
  }

  return { ok: true, amount };
};

export const parseFinanceDate = (value) => {
  if (typeof value === "string") {
    const trimmed = value.trim();
    const dateOnlyMatch = DATE_ONLY_PATTERN.exec(trimmed);
    if (dateOnlyMatch) {
      const date = new Date(`${trimmed}T00:00:00+07:00`);
      if (Number.isNaN(date.getTime())) {
        return { ok: false, error: "Tanggal tidak valid" };
      }
      return {
        ok: true,
        date,
        month: Number(dateOnlyMatch[2]),
        year: Number(dateOnlyMatch[1]),
      };
    }
  }

  const date = value instanceof Date || typeof value === "string" ? new Date(value) : new Date(NaN);

  if (Number.isNaN(date.getTime())) {
    return { ok: false, error: "Tanggal tidak valid" };
  }

  const wibDate = new Date(date.getTime() + WIB_OFFSET_MS);

  return {
    ok: true,
    date,
    month: wibDate.getUTCMonth() + 1,
    year: wibDate.getUTCFullYear(),
  };
};

export const validateTextLength = (value, maxLength, fieldLabel, { required = false } = {}) => {
  const trimmed = typeof value === "string" ? value.trim() : "";

  if (required && !trimmed) {
    return { ok: false, error: `${fieldLabel} wajib diisi` };
  }

  if (trimmed.length > maxLength) {
    return { ok: false, error: `${fieldLabel} maksimal ${maxLength} karakter` };
  }

  return { ok: true, value: trimmed || null };
};

export const planExpenseBalanceChange = ({
  existingAmount,
  existingAllowanceId,
  nextAmount,
  targetAllowance,
}) => {
  const isSamePeriod = existingAllowanceId === targetAllowance.id;
  const difference = nextAmount - existingAmount;

  return {
    isSamePeriod,
    difference,
    refundAmount: isSamePeriod || !existingAllowanceId ? 0 : existingAmount,
    targetDeduction: isSamePeriod ? difference : nextAmount,
  };
};

export const decrementAllowanceRemainingAtomically = async (tx, userId, allowanceId, amount) => {
  if (amount <= 0) {
    if (amount < 0) {
      await tx.allowances.updateMany({
        where: { id: allowanceId, user_id: userId },
        data: {
          remaining: { increment: Math.abs(amount) },
          updated_at: new Date(),
        },
      });
    }
    return true;
  }

  const updated = await tx.allowances.updateMany({
    where: {
      id: allowanceId,
      user_id: userId,
      remaining: { gte: amount },
    },
    data: {
      remaining: { decrement: amount },
      updated_at: new Date(),
    },
  });

  return updated.count === 1;
};

export const findOrCreateAllowanceForPeriod = async (
  tx,
  userId,
  { month, year, amount = 0, remaining = 0, frequency = "monthly" },
) => {
  const existing = await tx.allowances.findFirst({
    where: { user_id: userId, month, year },
  });
  if (existing) return { allowance: existing, created: false };

  try {
    const created = await tx.allowances.create({
      data: {
        user_id: userId,
        month,
        year,
        amount,
        remaining,
        frequency,
      },
    });
    return { allowance: created, created: true };
  } catch (error) {
    if (error?.code === "P2002") {
      const winner = await tx.allowances.findFirst({
        where: { user_id: userId, month, year },
      });
      if (winner) return { allowance: winner, created: false };
    }
    throw error;
  }
};

