const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;
const MAX_TEXT_LENGTH = 100;

const SORTS = new Set(["date-desc", "date-asc", "amount-desc", "amount-asc"]);

const invalid = (field, message) => ({ ok: false, error: `${field} ${message}` });

const parseInteger = (params, field, minimum, maximum) => {
  const value = params.get(field);
  if (value === null) return { ok: true, value: null };
  if (!/^\d+$/.test(value)) return invalid(field, "must be an integer");

  const number = Number(value);
  if (number < minimum || number > maximum) {
    return invalid(field, `must be between ${minimum} and ${maximum}`);
  }

  return { ok: true, value: number };
};

const parseText = (params, field) => {
  const value = params.get(field);
  if (value === null) return { ok: true, value: null };

  const trimmed = value.trim();
  if (!trimmed) return invalid(field, "must not be empty");
  if (trimmed.length > MAX_TEXT_LENGTH) {
    return invalid(field, `must be at most ${MAX_TEXT_LENGTH} characters`);
  }

  return { ok: true, value: trimmed };
};

export const parseExpenseDiscoveryQuery = (params, referenceDate = new Date()) => {
  const period = params.get("period") ?? "month";
  if (period !== "month" && period !== "all") return invalid("period", "must be month or all");

  const month = parseInteger(params, "month", 1, 12);
  if (!month.ok) return month;
  const year = parseInteger(params, "year", 1970, 3000);
  if (!year.ok) return year;
  const minAmount = parseInteger(params, "minAmount", 0, Number.MAX_SAFE_INTEGER);
  if (!minAmount.ok) return minAmount;
  const maxAmount = parseInteger(params, "maxAmount", 0, Number.MAX_SAFE_INTEGER);
  if (!maxAmount.ok) return maxAmount;
  if (minAmount.value !== null && maxAmount.value !== null && minAmount.value > maxAmount.value) {
    return invalid("minAmount", "must not exceed maxAmount");
  }

  const category = parseText(params, "category");
  if (!category.ok) return category;
  const q = parseText(params, "q");
  if (!q.ok) return q;

  const sort = params.get("sort") ?? "date-desc";
  if (!SORTS.has(sort)) return invalid("sort", "is not supported");
  const limit = parseInteger(params, "limit", 1, MAX_LIMIT);
  if (!limit.ok) return limit;

  const now = new Date(referenceDate);
  const defaultMonth = now.getUTCMonth() + 1;
  const defaultYear = now.getUTCFullYear();

  return {
    ok: true,
    value: {
      period,
      month: period === "month" ? (month.value ?? defaultMonth) : null,
      year: period === "month" ? (year.value ?? defaultYear) : null,
      category: category.value,
      q: q.value,
      minAmount: minAmount.value,
      maxAmount: maxAmount.value,
      sort,
      limit: limit.value ?? DEFAULT_LIMIT,
    },
  };
};

const getOrderBy = (sort) => {
  if (sort === "date-asc") return [{ date: "asc" }, { id: "asc" }];
  if (sort === "amount-desc") return [{ amount: "desc" }, { id: "desc" }];
  if (sort === "amount-asc") return [{ amount: "asc" }, { id: "asc" }];
  return [{ date: "desc" }, { id: "desc" }];
};

export const buildExpenseDiscoveryQuery = (userId, filters) => {
  const where = { user_id: userId };

  if (filters.period === "month") {
    where.date = {
      gte: new Date(Date.UTC(filters.year, filters.month - 1, 1)),
      lt: new Date(Date.UTC(filters.year, filters.month, 1)),
    };
  }
  if (filters.category) where.category = filters.category;
  if (filters.minAmount !== null || filters.maxAmount !== null) {
    where.amount = {
      ...(filters.minAmount !== null ? { gte: filters.minAmount } : {}),
      ...(filters.maxAmount !== null ? { lte: filters.maxAmount } : {}),
    };
  }
  if (filters.q) {
    where.OR = [
      { description: { contains: filters.q, mode: "insensitive" } },
      { category: { contains: filters.q, mode: "insensitive" } },
    ];
  }

  return { where, orderBy: getOrderBy(filters.sort), take: filters.limit };
};
