export const MAX_FINANCE_AMOUNT = 2_147_483_647;

export const parsePositiveAmount = (value) => {
  const number = Number(value);
  const amount = Math.round(number);

  if (!Number.isFinite(number) || amount <= 0 || amount > MAX_FINANCE_AMOUNT) {
    return { ok: false, error: "Nominal harus lebih dari 0 dan dalam batas wajar" };
  }

  return { ok: true, amount };
};

export const parseFinanceDate = (value) => {
  const date = value instanceof Date || typeof value === "string" ? new Date(value) : new Date(NaN);

  if (Number.isNaN(date.getTime())) {
    return { ok: false, error: "Tanggal tidak valid" };
  }

  return {
    ok: true,
    date,
    month: date.getMonth() + 1,
    year: date.getFullYear(),
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
