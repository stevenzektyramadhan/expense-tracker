import {
  endOfMonth,
  endOfWeek,
  isWithinInterval,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { DEFAULT_EXPENSE_CATEGORIES } from "../../lib/finance.js";

export const DASHBOARD_PERIOD_ALL = "all";
export const DASHBOARD_PERIOD_MONTH = "month";

export const DASHBOARD_SORT_DATE_DESC = "date-desc";
export const DASHBOARD_SORT_DATE_ASC = "date-asc";
export const DASHBOARD_SORT_AMOUNT_DESC = "amount-desc";
export const DASHBOARD_SORT_AMOUNT_ASC = "amount-asc";

const DASHBOARD_SORTS = new Set([
  DASHBOARD_SORT_DATE_DESC,
  DASHBOARD_SORT_DATE_ASC,
  DASHBOARD_SORT_AMOUNT_DESC,
  DASHBOARD_SORT_AMOUNT_ASC,
]);

const toFiniteAmount = (value) => {
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : 0;
};

const isValidMonth = (value) => {
  return Number.isInteger(value) && value >= 1 && value <= 12;
};

const isValidYear = (value) => {
  return Number.isInteger(value) && value >= 1970 && value <= 3000;
};

export const parseLocalDashboardDate = (value) => {
  if (value instanceof Date) {
    return new Date(value.getTime());
  }

  if (typeof value === "string") {
    const dateOnlyMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

    if (dateOnlyMatch) {
      const [, year, month, day] = dateOnlyMatch;
      return new Date(Number(year), Number(month) - 1, Number(day));
    }
  }

  return new Date(value);
};

export const selectFrequentExpenseCategories = (
  expenses,
  referenceDate,
  maxResults = 4
) => {
  if (!Array.isArray(expenses)) return [];

  const endDate = parseLocalDashboardDate(referenceDate);
  if (Number.isNaN(endDate.getTime())) return [];

  const startDate = new Date(endDate.getTime());
  startDate.setHours(0, 0, 0, 0);
  startDate.setDate(startDate.getDate() - 89);
  endDate.setHours(23, 59, 59, 999);

  const categoryStats = new Map();
  expenses.forEach((expense) => {
    const category = expense?.category;
    const date = parseLocalDashboardDate(expense?.date);
    if (
      !DEFAULT_EXPENSE_CATEGORIES.includes(category) ||
      Number.isNaN(date.getTime()) ||
      date < startDate ||
      date > endDate
    ) {
      return;
    }

    const current = categoryStats.get(category) || { count: 0, mostRecent: 0 };
    categoryStats.set(category, {
      count: current.count + 1,
      mostRecent: Math.max(current.mostRecent, date.getTime()),
    });
  });

  return Array.from(categoryStats.entries())
    .sort(([leftCategory, left], [rightCategory, right]) => {
      return (
        right.count - left.count ||
        right.mostRecent - left.mostRecent ||
        leftCategory.localeCompare(rightCategory, "id-ID")
      );
    })
    .slice(0, maxResults)
    .map(([category]) => category);
};

export const createDashboardFilters = (referenceDate) => {
  const date = parseLocalDashboardDate(referenceDate);

  return {
    period: DASHBOARD_PERIOD_MONTH,
    month: date.getMonth() + 1,
    year: date.getFullYear(),
    category: "",
    search: "",
    sort: DASHBOARD_SORT_DATE_DESC,
  };
};

export const normalizeDashboardFilters = (filters, referenceDate) => {
  const fallback = createDashboardFilters(referenceDate);
  const month = Number(filters?.month);
  const year = Number(filters?.year);
  const period =
    filters?.period === DASHBOARD_PERIOD_ALL
      ? DASHBOARD_PERIOD_ALL
      : DASHBOARD_PERIOD_MONTH;

  return {
    period,
    month: isValidMonth(month) ? month : fallback.month,
    year: isValidYear(year) ? year : fallback.year,
    category:
      filters?.category && filters.category !== "all"
        ? String(filters.category)
        : "",
    search: typeof filters?.search === "string" ? filters.search : "",
    sort: DASHBOARD_SORTS.has(filters?.sort)
      ? filters.sort
      : DASHBOARD_SORT_DATE_DESC,
  };
};

export const areDashboardFiltersEqual = (left, right) => {
  return (
    left?.period === right?.period &&
    left?.month === right?.month &&
    left?.year === right?.year &&
    left?.category === right?.category &&
    left?.search === right?.search &&
    left?.sort === right?.sort
  );
};

export const createExpenseDiscoveryQuery = (filters, limit = 20) => {
  const params = new URLSearchParams({
    period: filters.period,
    sort: filters.sort,
    limit: String(limit),
  });

  if (filters.period === DASHBOARD_PERIOD_MONTH) {
    params.set("month", String(filters.month));
    params.set("year", String(filters.year));
  }
  if (filters.category) params.set("category", filters.category);
  if (filters.search.trim()) params.set("q", filters.search.trim());

  return params.toString();
};

export const normalizeExpenseDiscoveryPayload = (payload) => {
  if (!Array.isArray(payload?.data)) return null;

  return {
    data: payload.data,
    returned: Number(payload.pageInfo?.returned) || payload.data.length,
    total: Number(payload.totals?.count) || 0,
  };
};

export const matchesTransactionSearch = (transaction, search) => {
  const query = String(search || "").trim().toLocaleLowerCase("id-ID");

  if (!query) return true;

  const description = String(transaction?.description || "").toLocaleLowerCase(
    "id-ID"
  );
  const category = String(transaction?.category || "").toLocaleLowerCase(
    "id-ID"
  );

  return description.includes(query) || category.includes(query);
};

export const filterTransactionsByCategory = (transactions, category) => {
  if (!category) return [...transactions];
  return transactions.filter((transaction) => transaction.category === category);
};

export const filterTransactionsByPeriod = (transactions, filters) => {
  if (filters.period === DASHBOARD_PERIOD_ALL) return [...transactions];

  return transactions.filter((transaction) => {
    const date = parseLocalDashboardDate(transaction.date);

    if (Number.isNaN(date.getTime())) return false;

    return (
      date.getMonth() + 1 === filters.month &&
      date.getFullYear() === filters.year
    );
  });
};

export const sortTransactions = (transactions, sort) => {
  return [...transactions].sort((left, right) => {
    if (sort === DASHBOARD_SORT_DATE_ASC) {
      return (
        parseLocalDashboardDate(left.date).getTime() -
        parseLocalDashboardDate(right.date).getTime()
      );
    }

    if (sort === DASHBOARD_SORT_AMOUNT_DESC) {
      return toFiniteAmount(right.amount) - toFiniteAmount(left.amount);
    }

    if (sort === DASHBOARD_SORT_AMOUNT_ASC) {
      return toFiniteAmount(left.amount) - toFiniteAmount(right.amount);
    }

    return (
      parseLocalDashboardDate(right.date).getTime() -
      parseLocalDashboardDate(left.date).getTime()
    );
  });
};

export const selectFilteredTransactions = (transactions, filters) => {
  if (!Array.isArray(transactions)) return [];

  const periodTransactions = filterTransactionsByPeriod(transactions, filters);
  const categoryTransactions = filterTransactionsByCategory(
    periodTransactions,
    filters.category
  );
  const searchedTransactions = categoryTransactions.filter((transaction) =>
    matchesTransactionSearch(transaction, filters.search)
  );

  return sortTransactions(searchedTransactions, filters.sort);
};

export const selectCurrentAllowancePeriodTransactions = (
  transactions,
  frequency,
  referenceDate
) => {
  if (!Array.isArray(transactions)) return [];

  const date = parseLocalDashboardDate(referenceDate);
  const interval =
    frequency === "weekly"
      ? {
          start: startOfWeek(date, { weekStartsOn: 1 }),
          end: endOfWeek(date, { weekStartsOn: 1 }),
        }
      : {
          start: startOfMonth(date),
          end: endOfMonth(date),
        };

  return transactions.filter((transaction) => {
    const transactionDate = parseLocalDashboardDate(transaction.date);

    return (
      !Number.isNaN(transactionDate.getTime()) &&
      isWithinInterval(transactionDate, interval)
    );
  });
};

export const selectTransactionTotal = (transactions) => {
  if (!Array.isArray(transactions)) return 0;
  return transactions.reduce(
    (total, transaction) => total + toFiniteAmount(transaction.amount),
    0
  );
};

export const selectTransactionCount = (transactions) => {
  return Array.isArray(transactions) ? transactions.length : 0;
};

export const selectAverageTransaction = (transactions) => {
  const count = selectTransactionCount(transactions);
  return count > 0 ? selectTransactionTotal(transactions) / count : 0;
};

export const selectTodaySpending = (transactions, referenceDate) => {
  if (!Array.isArray(transactions)) return 0;

  const date = parseLocalDashboardDate(referenceDate);

  return selectTransactionTotal(
    transactions.filter((transaction) => {
      const transactionDate = parseLocalDashboardDate(transaction.date);

      return (
        !Number.isNaN(transactionDate.getTime()) &&
        transactionDate.getFullYear() === date.getFullYear() &&
        transactionDate.getMonth() === date.getMonth() &&
        transactionDate.getDate() === date.getDate()
      );
    })
  );
};

const isDateInRange = (date, start, end) =>
  !Number.isNaN(date.getTime()) && date >= start && date <= end;

export const selectLargestMonthlyExpenseCategory = (
  transactions,
  referenceDate
) => {
  if (!Array.isArray(transactions)) return null;

  const date = parseLocalDashboardDate(referenceDate);
  if (Number.isNaN(date.getTime())) return null;

  const startDate = new Date(date.getFullYear(), date.getMonth(), 1);
  const endDate = new Date(
    date.getFullYear(),
    date.getMonth() + 1,
    0,
    23,
    59,
    59,
    999
  );
  const categoryTotals = new Map();

  transactions.forEach((transaction) => {
    const transactionDate = parseLocalDashboardDate(transaction?.date);
    if (!isDateInRange(transactionDate, startDate, endDate)) return;

    const category = String(transaction?.category || "").trim();
    const amount = toFiniteAmount(transaction?.amount);
    if (!category || amount <= 0) return;
    categoryTotals.set(category, (categoryTotals.get(category) || 0) + amount);
  });

  const total = Array.from(categoryTotals.values()).reduce(
    (sum, amount) => sum + amount,
    0
  );
  if (total <= 0) return null;

  const [category, amount] = Array.from(categoryTotals.entries()).sort(
    ([leftCategory, leftAmount], [rightCategory, rightAmount]) =>
      rightAmount - leftAmount || leftCategory.localeCompare(rightCategory, "id-ID")
  )[0];

  return { category, amount, share: amount / total, total };
};

export const selectSevenDayExpenseComparison = (transactions, referenceDate) => {
  if (!Array.isArray(transactions)) return null;

  const date = parseLocalDashboardDate(referenceDate);
  if (Number.isNaN(date.getTime())) return null;
  date.setHours(0, 0, 0, 0);

  const currentStart = new Date(date);
  currentStart.setDate(currentStart.getDate() - 6);
  const previousStart = new Date(date);
  previousStart.setDate(previousStart.getDate() - 13);
  const previousEnd = new Date(date);
  previousEnd.setDate(previousEnd.getDate() - 7);
  previousEnd.setHours(23, 59, 59, 999);
  const currentEnd = new Date(date);
  currentEnd.setHours(23, 59, 59, 999);

  const totals = { current: 0, previous: 0 };
  const hasExpenses = { current: false, previous: false };

  transactions.forEach((transaction) => {
    const transactionDate = parseLocalDashboardDate(transaction?.date);
    const amount = toFiniteAmount(transaction?.amount);
    if (amount <= 0) return;

    if (isDateInRange(transactionDate, currentStart, currentEnd)) {
      totals.current += amount;
      hasExpenses.current = true;
    } else if (isDateInRange(transactionDate, previousStart, previousEnd)) {
      totals.previous += amount;
      hasExpenses.previous = true;
    }
  });

  if (!hasExpenses.current || !hasExpenses.previous) return null;

  return {
    currentTotal: totals.current,
    previousTotal: totals.previous,
    comparison:
      totals.current === totals.previous
        ? "equal"
        : totals.current > totals.previous
          ? "higher"
          : "lower",
  };
};

export const selectAdditionalIncomeTotal = (incomes) => {
  if (!Array.isArray(incomes)) return 0;
  return incomes.reduce(
    (total, income) => total + toFiniteAmount(income.amount),
    0
  );
};

export const selectBaseAllowanceDisplay = (
  allowance,
  currentAllowancePeriodAdditionalIncome
) => {
  if (!allowance || currentAllowancePeriodAdditionalIncome === null) return null;

  return Math.max(
    toFiniteAmount(allowance.amount) -
      toFiniteAmount(currentAllowancePeriodAdditionalIncome),
    0
  );
};

export const selectAvailableExpensePeriods = (transactions, referenceDate) => {
  const currentDate = parseLocalDashboardDate(referenceDate);
  const currentKey = `${currentDate.getFullYear()}-${String(
    currentDate.getMonth() + 1
  ).padStart(2, "0")}`;
  const periods = new Map([
    [
      currentKey,
      {
        key: currentKey,
        month: currentDate.getMonth() + 1,
        year: currentDate.getFullYear(),
      },
    ],
  ]);

  if (Array.isArray(transactions)) {
    transactions.forEach((transaction) => {
      const date = parseLocalDashboardDate(transaction.date);
      if (Number.isNaN(date.getTime())) return;

      const period = {
        month: date.getMonth() + 1,
        year: date.getFullYear(),
      };
      const key = `${period.year}-${String(period.month).padStart(2, "0")}`;

      if (!periods.has(key)) {
        periods.set(key, { key, ...period });
      }
    });
  }

  return Array.from(periods.values());
};

export const selectDashboardMetrics = ({
  allowance,
  additionalIncomes,
  expenses,
  filteredExpenses,
  allowanceStatus,
  incomeStatus,
  expenseStatus,
  referenceDate,
}) => {
  const currentFrequency = allowance?.frequency || "monthly";
  const hasKnownAllowancePeriod =
    allowanceStatus === "success" || allowanceStatus === "missing";
  const currentAllowancePeriodExpenses =
    expenseStatus === "success" && hasKnownAllowancePeriod
      ? selectCurrentAllowancePeriodTransactions(
          expenses,
          currentFrequency,
          referenceDate
        )
      : null;
  const currentAllowancePeriodAdditionalIncome =
    incomeStatus === "success"
      ? selectAdditionalIncomeTotal(additionalIncomes)
      : null;

  return {
    currentAllowancePeriodAdditionalIncome,
    currentAllowancePeriodSpending:
      currentAllowancePeriodExpenses === null
        ? null
        : selectTransactionTotal(currentAllowancePeriodExpenses),
    currentAllowancePeriodTransactionCount:
      currentAllowancePeriodExpenses === null
        ? null
        : selectTransactionCount(currentAllowancePeriodExpenses),
    currentAllowancePeriodAverageTransaction:
      currentAllowancePeriodExpenses === null
        ? null
        : selectAverageTransaction(currentAllowancePeriodExpenses),
    filteredExpenseTotal:
      expenseStatus === "success"
        ? selectTransactionTotal(filteredExpenses)
        : null,
    filteredTransactionCount:
      expenseStatus === "success"
        ? selectTransactionCount(filteredExpenses)
        : null,
    filteredAverageTransaction:
      expenseStatus === "success"
        ? selectAverageTransaction(filteredExpenses)
        : null,
    todaySpending:
      expenseStatus === "success"
        ? selectTodaySpending(expenses, referenceDate)
        : null,
    baseAllowanceDisplay:
      allowanceStatus === "success" && incomeStatus === "success"
        ? selectBaseAllowanceDisplay(
            allowance,
            currentAllowancePeriodAdditionalIncome
          )
        : null,
  };
};
