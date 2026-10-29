import test from "node:test";
import assert from "node:assert/strict";

import {
  getBudgetStatusLabel,
  getBudgetStatusTone,
  getOwnedBudgetData,
  mergeBudgetCategories,
} from "../src/features/dashboard/categoryBudgetPresentation.js";

test("budget status labels keep text meaning alongside semantic tones", () => {
  assert.equal(getBudgetStatusLabel("on_track"), "Aman");
  assert.equal(getBudgetStatusLabel("warning"), "Perlu diperhatikan");
  assert.equal(getBudgetStatusLabel("limit_reached"), "Batas tercapai");
  assert.equal(getBudgetStatusLabel("exceeded"), "Melewati batas");
  assert.equal(getBudgetStatusTone("warning"), "warning");
  assert.equal(getBudgetStatusTone("limit_reached"), "limit_reached");
  assert.equal(getBudgetStatusTone("exceeded"), "expense");
});

test("budget categories preserve defaults and append exact expense and budget identities once", () => {
  assert.deepEqual(
    mergeBudgetCategories(["Makanan", "Lainnya"], [
      " Transportasi ",
      "Makanan",
    ], [
      { category: "Transportasi" },
      { category: "Makanan" },
      { category: "  Makan  " },
    ]),
    ["Makanan", "Lainnya", " Transportasi ", "Transportasi", "  Makan  "],
  );
});

test("budget resource data is synchronously suppressed for another account", () => {
  assert.deepEqual(
    getOwnedBudgetData({ userId: "user-a", data: [{ id: "budget-a" }] }, "user-b"),
    null,
  );
  assert.deepEqual(
    getOwnedBudgetData({ userId: "user-a", data: [{ id: "budget-a" }] }, "user-a"),
    [{ id: "budget-a" }],
  );
});
