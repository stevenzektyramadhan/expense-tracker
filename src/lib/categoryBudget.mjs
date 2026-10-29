const MIN_YEAR = 1970;
const MAX_YEAR = 3000;
const MAX_CATEGORY_LENGTH = 100;
const MAX_POSTGRES_INTEGER = 2_147_483_647;
const WIB_OFFSET_MS = 7 * 60 * 60 * 1000;

const invalid = (field, message) => ({ ok: false, error: `${field} ${message}` });

const parseInteger = (value, field, minimum, maximum) => {
  if (!Number.isSafeInteger(value) || value < minimum || value > maximum) {
    return invalid(field, `must be between ${minimum} and ${maximum}`);
  }

  return { ok: true, value };
};

const parseCategory = (value) => {
  if (typeof value !== "string") return invalid("category", "must be a string");

  const trimmed = value.trim();
  if (!trimmed) return invalid("category", "must not be empty");
  if (trimmed.length > MAX_CATEGORY_LENGTH) {
    return invalid("category", `must be at most ${MAX_CATEGORY_LENGTH} characters`);
  }

  return { ok: true, value: trimmed };
};

export const parseCategoryBudgetPeriod = (params) => {
  const monthValue = params.get("month");
  const yearValue = params.get("year");

  if (!/^\d+$/.test(monthValue ?? "")) return invalid("month", "must be an integer");
  if (!/^\d+$/.test(yearValue ?? "")) return invalid("year", "must be an integer");

  const month = parseInteger(Number(monthValue), "month", 1, 12);
  if (!month.ok) return month;
  const year = parseInteger(Number(yearValue), "year", MIN_YEAR, MAX_YEAR);
  if (!year.ok) return year;

  return { ok: true, value: { month: month.value, year: year.value } };
};

export const parseCategoryBudgetInput = ({ month, year, category, amount } = {}) => {
  const parsedMonth = parseInteger(month, "month", 1, 12);
  if (!parsedMonth.ok) return parsedMonth;
  const parsedYear = parseInteger(year, "year", MIN_YEAR, MAX_YEAR);
  if (!parsedYear.ok) return parsedYear;
  const parsedCategory = parseCategory(category);
  if (!parsedCategory.ok) return parsedCategory;
  if (!Number.isSafeInteger(amount) || amount <= 0 || amount > MAX_POSTGRES_INTEGER) {
    return invalid("amount", "must be a positive integer");
  }

  return {
    ok: true,
    value: {
      month: parsedMonth.value,
      year: parsedYear.value,
      category: parsedCategory.value,
      amount,
    },
  };
};

export const buildCategoryBudgetPeriodRange = (year, month) => ({
  start: new Date(Date.UTC(year, month - 1, 1) - WIB_OFFSET_MS),
  end: new Date(Date.UTC(year, month, 1) - WIB_OFFSET_MS),
});

export const calculateCategoryBudgetStatus = (amount, spent) => {
  const remaining = amount - spent;
  const status = spent > amount ? "exceeded" : spent === amount ? "limit_reached" : spent * 100 >= amount * 80 ? "warning" : "on_track";

  return { spent, remaining, status };
};
