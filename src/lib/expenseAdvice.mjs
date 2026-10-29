const MONTH_KEY_PATTERN = /^(\d{4})-(0[1-9]|1[0-2])$/;
const VALID_STATUSES = new Set(["aman", "waspada", "kritis"]);

const idrFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

const formatIdr = (value) => idrFormatter.format(Math.round(Number(value) || 0));

export const parseAdviceMonthKey = (monthKey) => {
  const match = MONTH_KEY_PATTERN.exec(String(monthKey ?? "").trim());
  if (!match) return { ok: false, error: "Format periode harus YYYY-MM." };

  const year = Number(match[1]);
  const month = Number(match[2]);
  if (year < 1970 || year > 3000) {
    return { ok: false, error: "Tahun periode tidak valid." };
  }

  return { ok: true, value: { year, month, key: `${year}-${match[2]}` } };
};

export const computeFinancialSnapshot = ({
  year,
  month,
  now = new Date(),
  allowance = null,
  categories = [],
  budgets = [],
  prevMonthTotal = 0,
  smallExpenseSummary = { count: 0, total: 0 },
}) => {
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const isCurrentMonth =
    now.getUTCFullYear() === year && now.getUTCMonth() + 1 === month;
  const elapsedDays = isCurrentMonth
    ? Math.max(1, Math.min(daysInMonth, now.getUTCDate()))
    : daysInMonth;
  const remainingDays = isCurrentMonth ? Math.max(0, daysInMonth - elapsedDays) : 0;

  const totalSpent = categories.reduce(
    (sum, item) => sum + (Number(item.amount) || 0),
    0,
  );
  const totalTransactions = categories.reduce(
    (sum, item) => sum + (Number(item.count) || 0),
    0,
  );
  const dailyBurnRate = elapsedDays > 0 ? Math.round(totalSpent / elapsedDays) : 0;

  const allowanceAmount = allowance ? Number(allowance.amount) || 0 : null;
  const allowanceRemaining = allowance ? Number(allowance.remaining) || 0 : null;
  const safeDailyAllowance =
    allowanceRemaining !== null && remainingDays > 0
      ? Math.max(0, Math.floor(allowanceRemaining / remainingDays))
      : null;
  const projectedRunwayDays =
    allowanceRemaining !== null && dailyBurnRate > 0
      ? Math.max(0, Math.floor(allowanceRemaining / dailyBurnRate))
      : null;

  const budgetMap = new Map(
    budgets.map((budget) => [budget.category, Number(budget.amount) || 0]),
  );

  const enrichedCategories = categories.map((item) => {
    const amount = Number(item.amount) || 0;
    const budgetAmount = budgetMap.get(item.category) ?? null;
    const sharePercent =
      totalSpent > 0 ? Math.round((amount / totalSpent) * 100) : 0;
    const budgetPercent =
      budgetAmount && budgetAmount > 0
        ? Math.round((amount / budgetAmount) * 100)
        : null;

    return {
      category: item.category,
      amount,
      count: Number(item.count) || 0,
      sharePercent,
      budgetAmount,
      budgetPercent,
    };
  });

  const overBudgetCategories = enrichedCategories.filter(
    (item) => item.budgetPercent !== null && item.budgetPercent >= 80,
  );

  const monthOverMonthPercent =
    prevMonthTotal > 0
      ? Math.round(((totalSpent - prevMonthTotal) / prevMonthTotal) * 100)
      : null;

  let status = "aman";
  if (
    (allowanceRemaining !== null && allowanceRemaining <= 0) ||
    overBudgetCategories.some((item) => item.budgetPercent > 100) ||
    (projectedRunwayDays !== null && projectedRunwayDays < remainingDays)
  ) {
    status = "kritis";
  } else if (
    overBudgetCategories.length > 0 ||
    (allowanceAmount && allowanceRemaining / allowanceAmount < 0.2) ||
    (monthOverMonthPercent !== null && monthOverMonthPercent >= 25)
  ) {
    status = "waspada";
  }

  const unbudgetedTop =
    enrichedCategories.find((item) => !item.budgetAmount && item.amount > 0) ||
    enrichedCategories[0] ||
    null;
  const suggestedBudgetAction =
    unbudgetedTop && unbudgetedTop.amount > 0
      ? {
          year,
          month,
          category: unbudgetedTop.category,
          currentAmount: unbudgetedTop.budgetAmount,
          suggestedAmount: Math.max(
            10000,
            Math.round((unbudgetedTop.amount * 0.9) / 5000) * 5000,
          ),
        }
      : null;

  return {
    period: `${year}-${String(month).padStart(2, "0")}`,
    isCurrentMonth,
    daysInMonth,
    elapsedDays,
    remainingDays,
    totalSpent,
    totalTransactions,
    dailyBurnRate,
    allowanceAmount,
    allowanceRemaining,
    safeDailyAllowance,
    projectedRunwayDays,
    prevMonthTotal: Number(prevMonthTotal) || 0,
    monthOverMonthPercent,
    smallExpenseCount: Number(smallExpenseSummary.count) || 0,
    smallExpenseTotal: Number(smallExpenseSummary.total) || 0,
    categories: enrichedCategories,
    overBudgetCategories,
    suggestedBudgetAction,
    status,
  };
};

export const buildDeterministicAdvice = (snapshot) => {
  const topCategory = snapshot.categories[0];
  const tips = [];

  if (snapshot.allowanceRemaining !== null && snapshot.isCurrentMonth) {
    if (
      snapshot.projectedRunwayDays !== null &&
      snapshot.projectedRunwayDays < snapshot.remainingDays
    ) {
      tips.push(
        `Dengan laju ${formatIdr(snapshot.dailyBurnRate)}/hari, sisa uang saku ${formatIdr(snapshot.allowanceRemaining)} diprediksi habis dalam ${snapshot.projectedRunwayDays} hari. Batasi pengeluaran maksimal ${formatIdr(snapshot.safeDailyAllowance)}/hari untuk ${snapshot.remainingDays} hari tersisa.`,
      );
    } else if (snapshot.safeDailyAllowance !== null) {
      tips.push(
        `Sisa uang saku ${formatIdr(snapshot.allowanceRemaining)} masih aman untuk ${snapshot.remainingDays} hari ke depan (batas aman ${formatIdr(snapshot.safeDailyAllowance)}/hari).`,
      );
    }
  }

  if (snapshot.overBudgetCategories.length > 0) {
    const worst = snapshot.overBudgetCategories[0];
    tips.push(
      `Kategori ${worst.category} telah mencapai ${worst.budgetPercent}% dari budget (${formatIdr(worst.amount)} dari ${formatIdr(worst.budgetAmount)}). Tahan pengeluaran non-esensial di kategori ini.`,
    );
  } else if (topCategory) {
    tips.push(
      `Kategori terbesar adalah ${topCategory.category} sebesar ${formatIdr(topCategory.amount)} (${topCategory.sharePercent}% dari total pengeluaran). Evaluasi apakah bisa dipangkas 10–15% bulan depan.`,
    );
  }

  if (snapshot.smallExpenseCount >= 5) {
    tips.push(
      `Tercatat ${snapshot.smallExpenseCount} transaksi kecil (≤ Rp25.000) dengan total ${formatIdr(snapshot.smallExpenseTotal)}. Kurangi frekuensi jajan harian untuk penghematan cepat.`,
    );
  } else if (snapshot.monthOverMonthPercent !== null) {
    const direction = snapshot.monthOverMonthPercent >= 0 ? "naik" : "turun";
    tips.push(
      `Total pengeluaran periode ini ${direction} ${Math.abs(snapshot.monthOverMonthPercent)}% dibanding bulan sebelumnya (${formatIdr(snapshot.prevMonthTotal)}).`,
    );
  }

  while (tips.length < 3) {
    tips.push(
      "Tetapkan batas anggaran per kategori (budget bulanan) agar pengeluaran lebih mudah dikendalikan setiap minggu.",
    );
  }

  const headline = topCategory
    ? `Total pengeluaran ${formatIdr(snapshot.totalSpent)} (${snapshot.totalTransactions} transaksi), didominasi oleh ${topCategory.category} (${topCategory.sharePercent}%).`
    : `Belum ada pengeluaran tercatat pada periode ${snapshot.period}.`;

  return {
    status: snapshot.status,
    summary: headline,
    recommendations: tips.slice(0, 3),
    suggestedBudgetAction: snapshot.suggestedBudgetAction,
  };
};

export const normalizeGeminiAdvice = (rawText, fallbackAdvice) => {
  try {
    const cleaned = String(rawText ?? "")
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/, "")
      .trim();
    const parsed = JSON.parse(cleaned);
    const status = VALID_STATUSES.has(parsed?.status)
      ? parsed.status
      : fallbackAdvice.status;
    const summary =
      typeof parsed?.summary === "string" && parsed.summary.trim().length > 10
        ? parsed.summary.trim().slice(0, 360)
        : fallbackAdvice.summary;
    const recommendations = Array.isArray(parsed?.recommendations)
      ? parsed.recommendations
          .filter((item) => typeof item === "string" && item.trim().length > 5)
          .map((item) => item.trim().slice(0, 280))
          .slice(0, 4)
      : [];

    if (!recommendations.length) return fallbackAdvice;

    return {
      status,
      summary,
      recommendations,
      suggestedBudgetAction: fallbackAdvice.suggestedBudgetAction ?? null,
    };
  } catch {
    return fallbackAdvice;
  }
};
