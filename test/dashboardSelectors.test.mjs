import test from "node:test";
import assert from "node:assert/strict";

import {
  createDashboardFilters,
  createExpenseDiscoveryQuery,
  areDashboardFiltersEqual,
  normalizeExpenseDiscoveryPayload,
  normalizeDashboardFilters,
  parseLocalDashboardDate,
  selectFrequentExpenseCategories,
  selectLargestMonthlyExpenseCategory,
  selectSevenDayExpenseComparison,
} from "../src/features/dashboard/dashboardSelectors.js";

test("discovery results are pending when typed filters differ from applied filters", () => {
  const appliedFilters = createDashboardFilters(new Date("2026-10-05T12:00:00Z"));

  assert.equal(areDashboardFiltersEqual(appliedFilters, appliedFilters), true);
  assert.equal(
    areDashboardFiltersEqual(
      appliedFilters,
      { ...appliedFilters, search: "nasi" }
    ),
    false
  );
});

test("discovery payload normalization preserves page rows and bounded totals", () => {
  assert.deepEqual(
    normalizeExpenseDiscoveryPayload({
      data: [{ id: "expense-1" }],
      pageInfo: { limit: 20, returned: 1 },
      totals: { count: 4, amount: 100000 },
    }),
    {
      data: [{ id: "expense-1" }],
      returned: 1,
      total: 4,
    }
  );
});

test("normalized dashboard filters serialize to the bounded discovery query", () => {
  const filters = normalizeDashboardFilters(
    {
      ...createDashboardFilters(new Date("2026-10-05T12:00:00Z")),
      category: "Makan",
      search: "  nasi goreng  ",
      sort: "amount-desc",
    },
    new Date("2026-10-05T12:00:00Z")
  );

  assert.equal(
    createExpenseDiscoveryQuery(filters),
    "period=month&sort=amount-desc&limit=20&month=10&year=2026&category=Makan&q=nasi+goreng"
  );
});

test("frequent categories use the inclusive 90-day local calendar window", () => {
  const suggestions = selectFrequentExpenseCategories(
    [
      { category: "Kesehatan", date: "2026-07-08" },
      { category: "Makanan", date: "2026-07-09" },
      { category: "Transportasi", date: "2026-07-09" },
      { category: "Belanja", date: "2026-07-10" },
      { category: "Hiburan", date: "2026-07-11" },
    ],
    "2026-10-06"
  );

  assert.deepEqual(suggestions, ["Hiburan", "Belanja", "Makanan", "Transportasi"]);
});

test("frequent categories aggregate counts and break ties by recency then Indonesian name", () => {
  const suggestions = selectFrequentExpenseCategories(
    [
      { category: "Belanja", date: "2026-10-01" },
      { category: "Makanan", date: "2026-10-02" },
      { category: "Belanja", date: "2026-09-01" },
      { category: "Transportasi", date: "2026-10-02" },
      { category: "Kesehatan", date: "2026-10-03" },
    ],
    "2026-10-06"
  );

  assert.deepEqual(suggestions, ["Belanja", "Kesehatan", "Makanan", "Transportasi"]);
});

test("frequent categories ignore invalid or unknown expenses and return at most four", () => {
  const suggestions = selectFrequentExpenseCategories(
    [
      { category: "Makanan", date: "not-a-date" },
      { category: "Tidak valid", date: "2026-10-05" },
      { category: "Transportasi", date: "2026-10-05" },
      { category: "Belanja", date: "2026-10-05" },
      { category: "Hiburan", date: "2026-10-05" },
      { category: "Kesehatan", date: "2026-10-05" },
      { category: "Lainnya", date: "2026-10-05" },
    ],
    "2026-10-06"
  );

  assert.deepEqual(suggestions, [
    "Belanja",
    "Hiburan",
    "Kesehatan",
    "Lainnya",
  ]);
  assert.deepEqual(selectFrequentExpenseCategories(null, "2026-10-06"), []);
});

test("largest category uses the active local calendar month bounds", () => {
  const referenceDate = parseLocalDashboardDate("2026-10-06");

  assert.deepEqual(
    selectLargestMonthlyExpenseCategory(
      [
        { category: "Makanan", amount: 100, date: "2026-09-30" },
        { category: "Makanan", amount: 200, date: "2026-10-01" },
        { category: "Transportasi", amount: 300, date: "2026-10-31" },
        { category: "Transportasi", amount: 400, date: "2026-11-01" },
      ],
      referenceDate
    ),
    { category: "Transportasi", amount: 300, share: 0.6, total: 500 }
  );
});

test("largest category breaks amount ties by deterministic category order", () => {
  assert.deepEqual(
    selectLargestMonthlyExpenseCategory(
      [
        { category: "Transportasi", amount: 250, date: "2026-10-02" },
        { category: "Makanan", amount: 250, date: "2026-10-03" },
      ],
      "2026-10-06"
    ),
    { category: "Makanan", amount: 250, share: 0.5, total: 500 }
  );
});

test("seven-day comparison reports higher, lower, and equal totals", () => {
  const expenses = [
    { amount: 300, date: "2026-10-06" },
    { amount: 200, date: "2026-10-02" },
    { amount: 100, date: "2026-09-29" },
  ];

  assert.deepEqual(selectSevenDayExpenseComparison(expenses, "2026-10-06"), {
    currentTotal: 500,
    previousTotal: 100,
    comparison: "higher",
  });
  assert.equal(
    selectSevenDayExpenseComparison(
      [{ amount: 100, date: "2026-10-06" }, { amount: 200, date: "2026-09-29" }],
      "2026-10-06"
    ).comparison,
    "lower"
  );
  assert.equal(
    selectSevenDayExpenseComparison(
      [{ amount: 100, date: "2026-10-06" }, { amount: 100, date: "2026-09-29" }],
      "2026-10-06"
    ).comparison,
    "equal"
  );
});

test("seven-day comparison suppresses incomplete windows", () => {
  assert.equal(
    selectSevenDayExpenseComparison(
      [{ amount: 100, date: "2026-10-06" }],
      "2026-10-06"
    ),
    null
  );
  assert.equal(selectLargestMonthlyExpenseCategory([], "2026-10-06"), null);
});
