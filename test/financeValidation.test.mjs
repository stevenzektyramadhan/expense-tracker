import assert from "node:assert/strict";
import test from "node:test";

import {
  MAX_FINANCE_AMOUNT,
  decrementAllowanceRemainingAtomically,
  findOrCreateAllowanceForPeriod,
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

test("Given concurrent expense deductions, When remaining balance is insufficient on the second deduction, Then decrementAllowanceRemainingAtomically rejects the second deduction", async () => {
  let remaining = 50_000;
  const tx = {
    allowances: {
      updateMany: async ({ where, data }) => {
        if (where.id !== "allowance-1" || where.user_id !== "user-1") return { count: 0 };
        if (where.remaining?.gte !== undefined && remaining < where.remaining.gte) {
          return { count: 0 };
        }
        if (data.remaining?.decrement) {
          remaining -= data.remaining.decrement;
        } else if (data.remaining?.increment) {
          remaining += data.remaining.increment;
        }
        return { count: 1 };
      },
    },
  };

  const first = await decrementAllowanceRemainingAtomically(tx, "user-1", "allowance-1", 40_000);
  const second = await decrementAllowanceRemainingAtomically(tx, "user-1", "allowance-1", 20_000);
  const refund = await decrementAllowanceRemainingAtomically(tx, "user-1", "allowance-1", -5_000);

  assert.equal(first, true);
  assert.equal(second, false);
  assert.equal(refund, true);
  assert.equal(remaining, 15_000);
});

test("Given a concurrent unique-constraint conflict (P2002) when creating a period allowance, When findOrCreateAllowanceForPeriod runs, Then it recovers by returning the winning allowance row", async () => {
  let findCalls = 0;
  const winningRow = { id: "allowance-winner", user_id: "user-1", month: 10, year: 2026, amount: 0, remaining: 0 };
  const tx = {
    allowances: {
      findFirst: async () => {
        findCalls += 1;
        return findCalls === 1 ? null : winningRow;
      },
      create: async () => {
        const err = new Error("Unique constraint failed");
        err.code = "P2002";
        throw err;
      },
    },
  };

  const result = await findOrCreateAllowanceForPeriod(tx, "user-1", { month: 10, year: 2026 });
  assert.deepEqual(result, { allowance: winningRow, created: false });
  assert.equal(findCalls, 2);
});

test("Given a YYYY-MM-DD date or a timestamp near midnight WIB, When parsing with parseFinanceDate, Then period month and year follow Asia/Jakarta (UTC+7)", () => {
  const plain = parseFinanceDate("2026-11-01");
  assert.equal(plain.ok, true);
  assert.equal(plain.month, 11);
  assert.equal(plain.year, 2026);
  assert.equal(plain.date.toISOString(), "2026-10-31T17:00:00.000Z");

  // 2026-10-31T18:30:00Z is 2026-11-01 01:30:00 WIB -> November 2026
  const nearMidnightWib = parseFinanceDate("2026-10-31T18:30:00.000Z");
  assert.equal(nearMidnightWib.ok, true);
  assert.equal(nearMidnightWib.month, 11);
  assert.equal(nearMidnightWib.year, 2026);
});

