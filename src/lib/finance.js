import { endOfMonth, endOfWeek, isWithinInterval, startOfMonth, startOfWeek } from "date-fns";

export const DEFAULT_EXPENSE_CATEGORIES = [
  "Makanan",
  "Transportasi",
  "Belanja",
  "Hiburan",
  "Kesehatan",
  "Lainnya",
];

export const CATEGORY_BADGE_COLORS = {
  Makanan: "bg-green-100 text-green-800",
  Transportasi: "bg-blue-100 text-blue-800",
  Belanja: "bg-purple-100 text-purple-800",
  Hiburan: "bg-pink-100 text-pink-800",
  Kesehatan: "bg-red-100 text-red-800",
  Lainnya: "bg-gray-100 text-gray-800",
};

export const CATEGORY_DOT_COLORS = {
  Makanan: "bg-green-500",
  Transportasi: "bg-blue-500",
  Belanja: "bg-purple-500",
  Hiburan: "bg-pink-500",
  Kesehatan: "bg-red-500",
  Lainnya: "bg-gray-500",
};

export const getCategoryBadgeColor = (category) => {
  return CATEGORY_BADGE_COLORS[category] || CATEGORY_BADGE_COLORS.Lainnya;
};

export const getCategoryDotColor = (category) => {
  return CATEGORY_DOT_COLORS[category] || CATEGORY_DOT_COLORS.Lainnya;
};

export const getExpensesForPeriod = (expenses, frequency) => {
  const now = new Date();
  const period =
    frequency === "weekly"
      ? {
          start: startOfWeek(now, { weekStartsOn: 1 }),
          end: endOfWeek(now, { weekStartsOn: 1 }),
        }
      : {
          start: startOfMonth(now),
          end: endOfMonth(now),
        };

  return expenses.filter((expense) => {
    const expenseDate = new Date(expense.date);
    return isWithinInterval(expenseDate, period);
  });
};

export const getPeriodLabel = (frequency) => {
  return frequency === "weekly" ? "Minggu Ini" : "Bulan Ini";
};
