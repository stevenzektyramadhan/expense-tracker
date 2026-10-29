"use client";

import {
  Minus,
  PieChart,
  Sparkles,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

import CurrencyAmount from "@/components/finance/CurrencyAmount";

const comparisonDetails = {
  higher: {
    label: "Meningkat",
    badgeClass: "bg-[var(--color-warning-soft)] text-[var(--color-warning-strong)]",
    Icon: TrendingUp,
  },
  lower: {
    label: "Lebih hemat",
    badgeClass: "bg-[var(--color-income-soft)] text-[var(--color-income-strong)]",
    Icon: TrendingDown,
  },
  equal: {
    label: "Stabil",
    badgeClass: "bg-[var(--color-surface-subtle)] text-[var(--color-text-muted)]",
    Icon: Minus,
  },
};

export default function SpendingInsights({ insights }) {
  const largestCategory = insights?.largestCategory;
  const comparison = insights?.sevenDayComparison;

  if (!largestCategory && !comparison) return null;

  const comparisonMeta = comparison
    ? comparisonDetails[comparison.comparison] || comparisonDetails.equal
    : null;

  return (
    <section
      className="overflow-hidden rounded-[var(--radius-surface)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-4 shadow-[var(--elevation-1)] sm:p-5"
      aria-labelledby="spending-insights-title"
    >
      <div className="flex items-center gap-2">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-[var(--radius-control)] bg-[var(--color-primary-soft)] text-[var(--color-primary-strong)]">
          <Sparkles className="size-4" aria-hidden="true" />
        </span>
        <h2
          id="spending-insights-title"
          className="font-[family-name:var(--font-display-family)] text-base font-bold text-[var(--color-text)]"
        >
          Insight pengeluaran
        </h2>
      </div>

      <div className="mt-3.5 grid min-w-0 gap-3 sm:grid-cols-2">
        {largestCategory ? (
          <div className="flex min-w-0 flex-col justify-between rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-surface)] p-3.5">
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-[var(--color-text-muted)]">
                  Kategori Terbesar
                </span>
                <span className="flex size-5 items-center justify-center rounded bg-[var(--color-surface-subtle)] text-[var(--color-text-muted)]">
                  <PieChart className="size-3" aria-hidden="true" />
                </span>
              </div>
              <div className="mt-1 flex items-baseline gap-2">
                <p className="truncate text-base font-bold text-[var(--color-text)]">
                  {largestCategory.category}
                </p>
                <span className="rounded-[var(--radius-pill)] bg-[var(--color-primary-soft)] px-2 py-0.5 text-[0.6875rem] font-bold text-[var(--color-primary-strong)]">
                  {Math.round(largestCategory.share * 100)}%
                </span>
              </div>
            </div>

            <div className="mt-3">
              <CurrencyAmount
                amount={largestCategory.amount}
                showSign={false}
                className="text-sm font-semibold text-[var(--color-text)]"
              />
              <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-[var(--radius-pill)] bg-[var(--color-surface-subtle)]">
                <div
                  className="h-full rounded-[var(--radius-pill)] bg-[var(--color-primary)] transition-all duration-300"
                  style={{ width: `${Math.min(Math.round(largestCategory.share * 100), 100)}%` }}
                />
              </div>
            </div>
          </div>
        ) : null}

        {comparison && comparisonMeta ? (
          <div className="flex min-w-0 flex-col justify-between rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-surface)] p-3.5">
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-[var(--color-text-muted)]">
                  Tren 7 Hari Terakhir
                </span>
                <span
                  className={`inline-flex items-center gap-1 rounded-[var(--radius-pill)] px-2 py-0.5 text-xs font-semibold ${comparisonMeta.badgeClass}`}
                >
                  <comparisonMeta.Icon className="size-3" aria-hidden="true" />
                  {comparisonMeta.label}
                </span>
              </div>
              <div className="mt-1">
                <CurrencyAmount
                  amount={comparison.currentTotal}
                  showSign={false}
                  className="text-base font-bold text-[var(--color-text)]"
                />
              </div>
            </div>

            <p className="mt-3 text-xs text-[var(--color-text-muted)]">
              vs{" "}
              <CurrencyAmount
                amount={comparison.previousTotal}
                showSign={false}
                className="font-semibold text-[var(--color-text)]"
              />{" "}
              pada 7 hari sebelumnya.
            </p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
