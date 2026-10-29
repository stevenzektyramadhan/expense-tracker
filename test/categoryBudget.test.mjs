import test from "node:test";
import assert from "node:assert/strict";

import {
  buildCategoryBudgetPeriodRange,
  calculateCategoryBudgetStatus,
  parseCategoryBudgetInput,
  parseCategoryBudgetPeriod,
} from "../src/lib/categoryBudget.mjs";

test("Given valid budget boundary values, When parsing a budget input, Then category whitespace is normalized to match expense storage", () => {
  assert.deepEqual(
    parseCategoryBudgetInput({ month: 10, year: 2026, category: "  Makan  ", amount: 250000 }),
    {
      ok: true,
      value: { month: 10, year: 2026, category: "Makan", amount: 250000 },
    },
  );
});

test("Given missing, fractional, negative, or out-of-range budget amounts, When parsing a budget input, Then parsing rejects them", () => {
  for (const amount of [undefined, 0, -1, 1.5, 2_147_483_648, Number.MAX_SAFE_INTEGER + 1]) {
    const result = parseCategoryBudgetInput({ month: 10, year: 2026, category: "Makan", amount });
    assert.deepEqual(result, { ok: false, error: "amount must be a positive integer" });
  }
});

test("Given invalid periods or categories, When parsing query and body boundaries, Then parsing rejects before querying", () => {
  for (const params of [
    new URLSearchParams(),
    new URLSearchParams("month=0&year=2026"),
    new URLSearchParams("month=10&year=1969"),
    new URLSearchParams("month=10.5&year=2026"),
  ]) {
    assert.equal(parseCategoryBudgetPeriod(params).ok, false);
  }

  assert.deepEqual(
    parseCategoryBudgetInput({ month: 10, year: 2026, category: "   ", amount: 1 }),
    { ok: false, error: "category must not be empty" },
  );
});

test("Given category spending below, at, and above status boundaries, When calculating status, Then spent and remaining are exact", () => {
  assert.deepEqual(calculateCategoryBudgetStatus(100, 79), {
    spent: 79,
    remaining: 21,
    status: "on_track",
  });
  assert.deepEqual(calculateCategoryBudgetStatus(100, 80), {
    spent: 80,
    remaining: 20,
    status: "warning",
  });
  assert.deepEqual(calculateCategoryBudgetStatus(100, 100), {
    spent: 100,
    remaining: 0,
    status: "limit_reached",
  });
  assert.deepEqual(calculateCategoryBudgetStatus(100, 125), {
    spent: 125,
    remaining: -25,
    status: "exceeded",
  });
});

test("Given a WIB month and year, When building category budget period range, Then boundaries align with 00:00:00+07:00", () => {
  const range = buildCategoryBudgetPeriodRange(2026, 11);
  assert.equal(range.start.toISOString(), "2026-10-31T17:00:00.000Z");
  assert.equal(range.end.toISOString(), "2026-11-30T17:00:00.000Z");
});
