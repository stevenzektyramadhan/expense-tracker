export const getBudgetStatusLabel = (status) => {
  if (status === "warning") return "Perlu diperhatikan";
  if (status === "limit_reached") return "Batas tercapai";
  if (status === "exceeded") return "Melewati batas";
  return "Aman";
};

export const getBudgetStatusTone = (status) => {
  if (status === "warning") return "warning";
  if (status === "limit_reached") return "limit_reached";
  if (status === "exceeded") return "expense";
  return "income";
};

export const mergeBudgetCategories = (
  defaultCategories,
  expenseCategories = [],
  budgets = [],
) => {
  return Array.from(
    new Set([
      ...defaultCategories,
      ...expenseCategories,
      ...(Array.isArray(budgets)
        ? budgets.map((budget) => budget.category).filter(Boolean)
        : []),
    ]),
  );
};

export const getOwnedBudgetData = (resource, userId) =>
  resource?.userId === userId ? resource.data : null;
