const VALID_STATUSES = new Set(["warning", "limit_reached", "exceeded"]);

const STATUS_LABELS = {
  warning: "Perlu diperhatikan",
  limit_reached: "Batas tercapai",
  exceeded: "Melewati batas",
};

const scopedKey = (userId, suffix) =>
  `kitecatat:budget-reminders:${encodeURIComponent(userId)}:${suffix}`;

export const getBudgetReminderStorageKeys = (userId) => ({
  optIn: scopedKey(userId, "opt-in"),
  sent: scopedKey(userId, "sent"),
});

export const isBudgetReminderOptedIn = (storage, userId) => {
  if (!storage || !userId) return false;
  try {
    return storage.getItem(getBudgetReminderStorageKeys(userId).optIn) === "enabled";
  } catch {
    return false;
  }
};

export const getBudgetReminderKey = ({ userId, budgetId, month, year, status }) =>
  [userId, budgetId, year, month, status].map((value) => encodeURIComponent(value)).join(":");

export const getBudgetReminderStatusLabel = (status) => STATUS_LABELS[status] || "";

const isMatchingBudget = (budget, month, year) =>
  budget &&
  (typeof budget.id === "string" || typeof budget.id === "number") &&
  typeof budget.category === "string" &&
  budget.category.length > 0 &&
  budget.month === month &&
  budget.year === year &&
  VALID_STATUSES.has(budget.status);

export const getBudgetReminderDecision = ({
  budgets,
  requestStatus,
  userId,
  month,
  year,
  permission = "default",
  optedIn = false,
  sentKeys = [],
  supported = true,
}) => {
  const candidate = Array.isArray(budgets)
    ? budgets.find((budget) => isMatchingBudget(budget, month, year))
    : null;
  const eligible = Boolean(
    supported &&
      requestStatus === "success" &&
      userId &&
      Number.isInteger(month) &&
      Number.isInteger(year) &&
      permission === "granted" &&
      optedIn &&
      candidate,
  );

  if (!eligible) return { eligible: false };

  const key = getBudgetReminderKey({
    userId,
    budgetId: candidate.id,
    month,
    year,
    status: candidate.status,
  });
  if (sentKeys.includes(key)) return { eligible: false, key };

  return {
    eligible: true,
    body: `${candidate.category}: ${getBudgetReminderStatusLabel(candidate.status)}.`,
    key,
    status: candidate.status,
    tag: `kitecatat-budget-${candidate.id}-${year}-${month}`,
    title: "Pengingat batas kategori",
  };
};
