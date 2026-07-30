/* Hallmark · component: RankedCategoryList · genre: modern-minimal · theme: Calm Ledger
 * states: populated · empty · long-content · large-values
 * contrast: labels and values supplement every colour marker
 */
import CurrencyAmount from "@/components/finance/CurrencyAmount";

const CATEGORY_COLORS = [
  "var(--color-primary)",
  "var(--color-brand-warm)",
  "var(--color-primary-strong)",
  "var(--color-text-muted)",
  "var(--color-border-strong)",
  "var(--color-text)",
];

const KNOWN_CATEGORY_INDEXES = {
  makanan: 0,
  transportasi: 1,
  belanja: 2,
  hiburan: 3,
  kesehatan: 4,
  lainnya: 5,
};

const percentageFormatter = new Intl.NumberFormat("id-ID", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

function getCategoryKey(category) {
  return String(category || "Lainnya").trim().toLocaleLowerCase("id-ID");
}

export function getReportCategoryColor(category) {
  const categoryKey = getCategoryKey(category);
  const knownIndex = KNOWN_CATEGORY_INDEXES[categoryKey];

  if (knownIndex !== undefined) {
    return CATEGORY_COLORS[knownIndex];
  }

  const hash = Array.from(categoryKey).reduce(
    (total, character) => (total * 31 + character.codePointAt(0)) >>> 0,
    0,
  );

  return CATEGORY_COLORS[hash % CATEGORY_COLORS.length];
}

export function formatReportPercentage(value) {
  const percentage = Number(value);
  return percentageFormatter.format(
    Number.isFinite(percentage) ? percentage : 0,
  );
}

export default function RankedCategoryList({ categories = [] }) {
  if (!categories.length) {
    return (
      <p className="rounded-[var(--radius-surface)] bg-[var(--color-surface-subtle)] px-4 py-6 text-sm text-[var(--color-text-muted)]">
        Tidak ada kategori pengeluaran pada periode ini.
      </p>
    );
  }

  return (
    <ol className="divide-y divide-[var(--color-border)]">
      {categories.map((category, index) => {
        const percentage = Math.min(
          100,
          Math.max(0, Number(category.percentage) || 0),
        );
        const color = getReportCategoryColor(category.name);

        return (
          <li
            key={category.name}
            className="grid min-w-0 grid-cols-[2rem_minmax(0,1fr)] gap-3 py-4 first:pt-0 last:pb-0 sm:grid-cols-[2rem_minmax(0,1fr)_minmax(8rem,auto)] sm:items-center"
          >
            <span
              className="flex size-8 items-center justify-center rounded-[var(--radius-pill)] bg-[var(--color-surface-subtle)] text-sm font-bold tabular-nums text-[var(--color-text-muted)]"
              aria-label={`Peringkat ${index + 1}`}
            >
              {index + 1}
            </span>

            <div className="min-w-0">
              <div className="flex min-w-0 items-center gap-2">
                <span
                  className="size-2.5 shrink-0 rounded-[var(--radius-pill)]"
                  style={{ backgroundColor: color }}
                  aria-hidden="true"
                />
                <span className="min-w-0 break-words font-semibold text-[var(--color-text)]">
                  {category.name || "Lainnya"}
                </span>
              </div>

              <div
                className="mt-2 h-2 overflow-hidden rounded-[var(--radius-pill)] bg-[var(--color-surface-subtle)]"
                aria-hidden="true"
              >
                <span
                  className="block h-full rounded-[var(--radius-pill)]"
                  style={{ backgroundColor: color, width: `${percentage}%` }}
                />
              </div>
            </div>

            <div className="col-start-2 min-w-0 sm:col-start-3 sm:text-right">
              <CurrencyAmount
                amount={category.amount}
                className="block min-w-0 font-bold"
                style={{ overflowWrap: "anywhere", whiteSpace: "normal" }}
              />
              <span className="mt-0.5 block text-sm tabular-nums text-[var(--color-text-muted)]">
                {formatReportPercentage(percentage)}% dari total
              </span>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
