import CurrencyAmount from "@/components/finance/CurrencyAmount";

const comparisonCopy = {
  higher: "lebih tinggi",
  lower: "lebih rendah",
  equal: "sama",
};

export default function SpendingInsights({ insights }) {
  const largestCategory = insights?.largestCategory;
  const comparison = insights?.sevenDayComparison;

  if (!largestCategory && !comparison) return null;

  return (
    <section
      className="grid min-w-0 gap-3 rounded-[var(--radius-surface)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-4 shadow-[var(--elevation-1)] sm:grid-cols-2 sm:p-5"
      aria-labelledby="spending-insights-title"
    >
      <h2
        id="spending-insights-title"
        className="sm:col-span-2 font-[family-name:var(--font-display-family)] text-base font-bold"
      >
        Insight pengeluaran
      </h2>

      {largestCategory ? (
        <p className="min-w-0 text-sm leading-6 text-[var(--color-text-muted)]">
          Kategori terbesar bulan ini: {" "}
          <strong className="text-[var(--color-text)]">{largestCategory.category}</strong>{" "}
          sebesar <CurrencyAmount amount={largestCategory.amount} showSign={false} />{" "}
          ({Math.round(largestCategory.share * 100)}% dari total pengeluaran bulan ini).
        </p>
      ) : null}

      {comparison ? (
        <p className="min-w-0 text-sm leading-6 text-[var(--color-text-muted)]">
          Pengeluaran 7 hari terakhir {comparisonCopy[comparison.comparison]} dibanding
          7 hari sebelumnya: <CurrencyAmount amount={comparison.currentTotal} showSign={false} />{" "}
          dibanding <CurrencyAmount amount={comparison.previousTotal} showSign={false} />.
        </p>
      ) : null}
    </section>
  );
}
