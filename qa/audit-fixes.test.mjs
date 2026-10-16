import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

// 1. Verify ExpenseDetailContent exports and structure
const expenseDetailContentCode = fs.readFileSync(
  path.resolve("src/features/expenses/ExpenseDetailContent.js"),
  "utf8"
);
assert.ok(expenseDetailContentCode.includes("defaultExpenseDetailLabels"));
assert.ok(expenseDetailContentCode.includes("export default function ExpenseDetailContent"));

// 2. Verify CategoryBudgetSection token fix
const categorySectionCode = fs.readFileSync(
  path.resolve("src/features/dashboard/CategoryBudgetSection.js"),
  "utf8"
);
assert.ok(
  categorySectionCode.includes("bg-[var(--color-surface-subtle)]"),
  "CategoryBudgetSection must use valid token --color-surface-subtle"
);
assert.ok(
  !categorySectionCode.includes("bg-[var(--color-surface-muted)]"),
  "CategoryBudgetSection must not use undefined token --color-surface-muted"
);

// 3. Verify ExpenseForm showHeader prop and DashboardPage usage
const expenseFormCode = fs.readFileSync(
  path.resolve("src/features/expenses/ExpenseForm.js"),
  "utf8"
);
assert.ok(expenseFormCode.includes("showHeader = true"));

const dashboardPageCode = fs.readFileSync(
  path.resolve("src/features/dashboard/DashboardPage.js"),
  "utf8"
);
assert.ok(dashboardPageCode.includes("showHeader={false}"));
assert.ok(dashboardPageCode.includes("<RecentTransactions"));

// 4. Verify Allowance page hydrates allowance on mount
const allowancePageCode = fs.readFileSync(
  path.resolve("src/app/(dashboard)/allowance/page.js"),
  "utf8"
);
assert.ok(allowancePageCode.includes('authenticatedFetch("/api/allowances")'));

// 5. Verify AppShell app-status-region has flex column gap
const appShellCode = fs.readFileSync(
  path.resolve("src/components/navigation/AppShell.js"),
  "utf8"
);
assert.ok(appShellCode.includes("flex max-w-lg flex-col gap-2"));

// 6. Verify H1 visibility on mobile
const incomePageCode = fs.readFileSync(
  path.resolve("src/app/(dashboard)/income/page.js"),
  "utf8"
);
assert.ok(!incomePageCode.includes("sr-only min-w-0 font-[family-name:var(--font-display-family)]"));

const incomeAddPageCode = fs.readFileSync(
  path.resolve("src/app/(dashboard)/income/add/page.js"),
  "utf8"
);
assert.ok(!incomeAddPageCode.includes("sr-only min-w-0 font-[family-name:var(--font-display-family)]"));

const summaryPageCode = fs.readFileSync(
  path.resolve("src/features/reports/MonthlySummary.js"),
  "utf8"
);
assert.ok(!summaryPageCode.includes("sr-only min-w-0 font-[family-name:var(--font-display-family)]"));

// 7. Verify Dashboard redesign structure
assert.ok(
  dashboardPageCode.includes("lg:grid-cols-12"),
  "DashboardPage must use 12-column responsive workbench layout"
);

const financialOverviewCode = fs.readFileSync(
  path.resolve("src/features/dashboard/FinancialOverview.js"),
  "utf8"
);
assert.ok(
  financialOverviewCode.includes("Sisa uang saku"),
  "FinancialOverview must display Sisa uang saku"
);
assert.ok(
  financialOverviewCode.includes("Rincian alokasi"),
  "FinancialOverview must display Rincian alokasi"
);

console.log("All punch list assert checks passed successfully.");

