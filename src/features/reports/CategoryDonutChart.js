"use client";

/* Hallmark · pre-emit critique: P5 H5 E5 S5 R5 V5
 * Hallmark · component: CategoryDonutChart · genre: modern-minimal · theme: Calm Ledger
 * states: populated · empty · large-values · decorative-non-focusable
 * contrast: category labels and values remain available in the ranked text list
 */
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import CurrencyAmount from "@/components/finance/CurrencyAmount";
import {
  formatReportPercentage,
  getReportCategoryColor,
} from "@/features/reports/RankedCategoryList";

function CategoryTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;

  const category = payload[0]?.payload;
  if (!category) return null;

  return (
    <div className="max-w-56 rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-3 shadow-[var(--elevation-2)]">
      <p className="break-words font-semibold text-[var(--color-text)]">
        {category.name}
      </p>
      <CurrencyAmount
        amount={category.amount}
        className="mt-1 block font-bold"
        style={{ overflowWrap: "anywhere", whiteSpace: "normal" }}
      />
      <p className="mt-1 text-sm tabular-nums text-[var(--color-text-muted)]">
        {formatReportPercentage(category.percentage)}% dari total
      </p>
    </div>
  );
}

export default function CategoryDonutChart({ categories = [] }) {
  return (
    <div className="h-72 min-w-0" aria-hidden="true">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart
          margin={{ top: 16, right: 16, bottom: 16, left: 16 }}
          accessibilityLayer={false}
        >
          <Pie
            data={categories}
            dataKey="amount"
            nameKey="name"
            innerRadius="48%"
            outerRadius="78%"
            paddingAngle={2}
            stroke="var(--color-surface-subtle)"
            strokeWidth={2}
            isAnimationActive={false}
            rootTabIndex={-1}
          >
            {categories.map((category) => (
              <Cell
                key={category.name}
                fill={getReportCategoryColor(category.name)}
              />
            ))}
          </Pie>
          <Tooltip content={<CategoryTooltip />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
