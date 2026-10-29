import assert from "node:assert/strict";
import test from "node:test";

import {
  MAX_FINANCE_AMOUNT,
  parseFinanceDate,
  parsePositiveAmount,
  planExpenseBalanceChange,
  validateTextLength,
} from "../src/lib/financeValidation.mjs";

test("Given a finite numeric amount, When parsing it, Then it is rounded within the finance limit", () => {
  assert.deepEqual(parsePositiveAmount("1250.6"), { ok: true, amount: 1251 });
  assert.deepEqual(parsePositiveAmount(MAX_FINANCE_AMOUNT), {
    ok: true,
    amount: MAX_FINANCE_AMOUNT,
  });
});

test("Given zero, non-finite, or oversized amounts, When parsing them, Then they are rejected", () => {
  for (const amount of [0, -1, Number.NaN, Number.POSITIVE_INFINITY, MAX_FINANCE_AMOUNT + 1]) {
    assert.deepEqual(parsePositiveAmount(amount), {
      ok: false,
      error: "Nominal harus lebih dari 0 dan dalam batas wajar",
    });
  }
});

test("Given a valid finance date, When parsing it, Then its date and allowance period are returned", () => {
  const result = parseFinanceDate("2026-10-29T12:00:00");

  assert.equal(result.ok, true);
  assert.equal(result.date.getFullYear(), 2026);
  assert.equal(result.month, 10);
  assert.equal(result.year, 2026);
});

test("Given an invalid finance date, When parsing it, Then it is rejected", () => {
  assert.deepEqual(parseFinanceDate("not-a-date"), {
    ok: false,
    error: "Tanggal tidak valid",
  });
});

test("Given required and optional text fields, When validating them, Then values are trimmed and bounded", () => {
  assert.deepEqual(validateTextLength("  Makanan  ", 100, "Kategori", { required: true }), {
    ok: true,
    value: "Makanan",
  });
  assert.deepEqual(validateTextLength(null, 500, "Deskripsi"), { ok: true, value: null });
  assert.deepEqual(validateTextLength("   ", 100, "Kategori", { required: true }), {
    ok: false,
    error: "Kategori wajib diisi",
  });
  assert.deepEqual(validateTextLength("abc", 2, "Deskripsi"), {
    ok: false,
    error: "Deskripsi maksimal 2 karakter",
  });
});

test("Given an expense update in the same allowance period, When planning the balance change, Then only the amount difference is deducted", () => {
  assert.deepEqual(
    planExpenseBalanceChange({
      existingAmount: 20_000,
      existingAllowanceId: "allowance-1",
      nextAmount: 25_000,
      targetAllowance: { id: "allowance-1" },
    }),
    {
      isSamePeriod: true,
      difference: 5_000,
      refundAmount: 0,
      targetDeduction: 5_000,
    },
  );
});

test("Given an expense moved to another allowance period, When planning the balance change, Then the old amount is refunded and the new amount is deducted", () => {
  assert.deepEqual(
    planExpenseBalanceChange({
      existingAmount: 20_000,
      existingAllowanceId: "allowance-1",
      nextAmount: 25_000,
      targetAllowance: { id: "allowance-2" },
    }),
    {
      isSamePeriod: false,
      difference: 5_000,
      refundAmount: 20_000,
      targetDeduction: 25_000,
    },
  );
});
