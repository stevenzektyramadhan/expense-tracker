import test from "node:test";
import assert from "node:assert/strict";

import {
  getBudgetReminderStorageKeys,
  getBudgetReminderDecision,
  getBudgetReminderKey,
  getBudgetReminderStatusLabel,
  isBudgetReminderOptedIn,
} from "../src/features/dashboard/budgetReminderState.js";

const budget = (overrides = {}) => ({
  id: "budget-1",
  category: "Makanan",
  month: 10,
  year: 2026,
  status: "warning",
  ...overrides,
});

const baseDecision = (overrides = {}) => getBudgetReminderDecision({
  budgets: [budget()],
  requestStatus: "success",
  userId: "user-a",
  month: 10,
  year: 2026,
  permission: "granted",
  optedIn: true,
  sentKeys: [],
  ...overrides,
});

test("unsupported and default or denied permission states never become eligible", () => {
  assert.equal(baseDecision({ supported: false }).eligible, false);
  assert.equal(baseDecision({ permission: "default" }).eligible, false);
  assert.equal(baseDecision({ permission: "denied" }).eligible, false);
});

test("opt-in persistence is scoped by user and defaults to disabled", () => {
  const values = new Map();
  const storage = {
    getItem: (key) => values.get(key) || null,
    setItem: (key, value) => values.set(key, value),
  };
  const keys = getBudgetReminderStorageKeys("user-a");

  assert.equal(isBudgetReminderOptedIn(storage, "user-a"), false);
  storage.setItem(keys.optIn, "enabled");
  assert.equal(isBudgetReminderOptedIn(storage, "user-a"), true);
  assert.equal(isBudgetReminderOptedIn(storage, "user-b"), false);
});

test("no reminder is eligible before local opt-in", () => {
  assert.equal(baseDecision({ optedIn: false }).eligible, false);
});

test("only successful matching-period responses with valid server statuses are eligible", () => {
  for (const requestStatus of ["idle", "loading", "error"]) {
    assert.equal(baseDecision({ requestStatus }).eligible, false);
  }

  for (const status of ["on_track", "unknown", undefined]) {
    assert.equal(baseDecision({ budgets: [budget({ status })] }).eligible, false);
  }

  assert.equal(baseDecision({ budgets: [budget({ month: 9 })] }).eligible, false);
  assert.equal(baseDecision({ budgets: [budget({ year: 2025 })] }).eligible, false);
  assert.equal(baseDecision({ budgets: [budget({ id: null })] }).eligible, false);
  assert.equal(baseDecision().eligible, true);
});

test("dedupes the same budget, period, and severity while allowing escalation", () => {
  const warningKey = getBudgetReminderKey({
    userId: "user-a",
    budgetId: "budget-1",
    month: 10,
    year: 2026,
    status: "warning",
  });
  assert.equal(baseDecision({ sentKeys: [warningKey] }).eligible, false);

  const escalation = baseDecision({
    budgets: [budget({ status: "limit_reached" })],
    sentKeys: [warningKey],
  });
  assert.equal(escalation.eligible, true);
  assert.equal(escalation.status, "limit_reached");
});

test("stale and errored budget data is suppressed and notification copy is factual", () => {
  const decision = baseDecision();
  assert.equal(decision.body, "Makanan: Perlu diperhatikan.");
  assert.equal(decision.title, "Pengingat batas kategori");
  assert.equal(decision.tag, "kitecatat-budget-budget-1-2026-10");
  assert.equal(getBudgetReminderStatusLabel("exceeded"), "Melewati batas");
  assert.equal(baseDecision({ requestStatus: "error", budgets: [budget({ status: "exceeded" })] }).eligible, false);
});
