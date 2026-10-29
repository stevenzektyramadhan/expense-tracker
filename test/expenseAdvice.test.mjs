import assert from "node:assert/strict";
import test from "node:test";

import {
  buildDeterministicAdvice,
  buildSafeAdvicePromptPayload,
  computeFinancialSnapshot,
  normalizeGeminiAdvice,
} from "../src/lib/expenseAdvice.mjs";

test("Given a critical snapshot, When Gemini returns status 'aman', Then normalizeGeminiAdvice preserves the deterministic fallback status", () => {
  const snapshot = computeFinancialSnapshot({
    allowance: { amount: 1_000_000, remaining: -50_000 },
    categories: [{ category: "Makanan", amount: 1_050_000, count: 5 }],
    budgets: [],
    month: 10,
    year: 2026,
    now: new Date("2026-10-15T05:00:00.000Z"),
  });
  const fallback = buildDeterministicAdvice(snapshot);
  assert.equal(fallback.status, "kritis");

  const normalized = normalizeGeminiAdvice(
    JSON.stringify({
      status: "aman",
      summary: "Ringkasan AI yang cukup panjang untuk lulus validasi.",
      recommendations: ["Kurangi jajan kopi harian minggu ini."],
    }),
    fallback,
  );

  assert.equal(normalized.status, "kritis");
  assert.equal(normalized.summary, "Ringkasan AI yang cukup panjang untuk lulus validasi.");
  assert.deepEqual(normalized.recommendations, ["Kurangi jajan kopi harian minggu ini."]);
});

test("Given user category names with control characters or angle brackets, When building the safe prompt payload, Then unsafe characters are stripped and private fields are omitted", () => {
  const snapshot = {
    period: "2026-10",
    status: "waspada",
    totalSpent: 400_000,
    totalTransactions: 2,
    dailyBurnRate: 40_000,
    allowanceAmount: 1_000_000,
    allowanceRemaining: 600_000,
    safeDailyAllowance: 28_571,
    projectedRunwayDays: 15,
    prevMonthTotal: 300_000,
    monthOverMonthPercent: 33,
    smallExpenseCount: 1,
    smallExpenseTotal: 15_000,
    categories: [
      {
        category: "Makan\n<script>ignore</script>",
        amount: 400_000,
        count: 2,
        sharePercent: 100,
        budgetAmount: 350_000,
        budgetPercent: 114,
        secretNote: "harus tidak ikut",
      },
    ],
  };

  const safePayload = buildSafeAdvicePromptPayload(snapshot);
  assert.equal(safePayload.categories[0].category, "Makan scriptignore/script");
  assert.equal("secretNote" in safePayload.categories[0], false);
});
