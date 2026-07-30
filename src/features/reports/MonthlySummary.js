"use client";

/* Hallmark · pre-emit critique: P5 H5 E4 S5 R5 V5
 * Hallmark · genre: modern-minimal · macrostructure: Index-First · design-system: Calm Ledger · designed-as-app
 */
import dynamic from "next/dynamic";
import { BarChart3, CalendarRange } from "lucide-react";

import CurrencyAmount from "@/components/finance/CurrencyAmount";
import FormField from "@/components/ui/FormField";
import Skeleton from "@/components/ui/Skeleton";
import RankedCategoryList from "@/features/reports/RankedCategoryList";

function ChartSkeleton() {
  return (
    <div
      className="flex h-72 items-center justify-center"
      role="status"
      aria-label="Memuat visualisasi kategori"
    >
      <Skeleton
        width="12rem"
        height="12rem"
        radius="var(--radius-pill)"
      />
    </div>
  );
}

const CategoryDonutChart = dynamic(
  () => import("@/features/reports/CategoryDonutChart"),
  { ssr: false, loading: ChartSkeleton },
);

const countFormatter = new Intl.NumberFormat("id-ID", {
  maximumFractionDigits: 0,
});

export function MonthlySummarySkeleton() {
  return (
    <div
      className="mx-auto grid w-full max-w-6xl min-w-0 gap-6 px-4 sm:px-0"
      role="status"
      aria-label="Memuat ringkasan bulanan"
    >
      <div className="space-y-2">
        <Skeleton width="12rem" height="1.75rem" />
        <Skeleton width="min(100%, 28rem)" height="1rem" />
      </div>
      <Skeleton height="9rem" radius="var(--radius-prominent)" />
      <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(18rem,0.65fr)]">
        <Skeleton height="24rem" radius="var(--radius-surface)" />
        <Skeleton height="24rem" radius="var(--radius-surface)" />
      </div>
      <Skeleton height="16rem" radius="var(--radius-surface)" />
    </div>
  );
}

export default function MonthlySummary({
  categories,
  monthlyData,
  onMonthChange,
  selectedMonth,
  selectedMonthData,
}) {
  const selectedLabel = selectedMonthData?.label || "Periode terpilih";
  const selectedTotal = Number(selectedMonthData?.total || 0);
  const selectedTransactionCount = Number(
    selectedMonthData?.transactionCount || 0,
  );

  return (
    <div className="mx-auto grid w-full max-w-6xl min-w-0 gap-6 px-4 sm:px-0">
      <header className="min-w-0">
        <h1 className="sr-only min-w-0 font-[family-name:var(--font-display-family)] text-2xl font-bold tracking-[-0.025em] [overflow-wrap:anywhere] md:not-sr-only">
          Ringkasan bulanan
        </h1>
        <p className="text-sm text-[var(--color-text-muted)] md:mt-1">
          Lihat pengeluaran berdasarkan periode dan kategori.
        </p>
      </header>

      <section
        className="grid min-w-0 gap-4 rounded-[var(--radius-prominent)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-[var(--elevation-1)] md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] md:items-end md:p-5"
        aria-labelledby="summary-period-heading"
      >
        <div className="min-w-0">
          <h2
            id="summary-period-heading"
            className="min-w-0 font-[family-name:var(--font-display-family)] text-lg font-bold [overflow-wrap:anywhere]"
          >
            Periode laporan
          </h2>
          <FormField
            id="summary-month-filter"
            label="Bulan"
            helperText="Pilih bulan yang ingin ditinjau."
            className="mt-3"
          >
            <select
              value={selectedMonth}
              onChange={(event) => onMonthChange(event.target.value)}
            >
              {monthlyData.map((month) => (
                <option key={month.key} value={month.key}>
                  {month.label}
                </option>
              ))}
            </select>
          </FormField>
        </div>

        <div className="min-w-0 border-t border-[var(--color-border)] pt-4 md:border-l md:border-t-0 md:pb-5 md:pl-5 md:pt-0">
          <p className="text-sm text-[var(--color-text-muted)]">
            Total pengeluaran · {selectedLabel}
          </p>
          <CurrencyAmount
            amount={selectedTotal}
            tone={selectedTotal > 0 ? "expense" : "neutral"}
            showSign={false}
            className="mt-1 block min-w-0 font-[family-name:var(--font-display-family)] text-[clamp(1.75rem,7vw,2.5rem)] font-bold tracking-[-0.035em]"
            style={{ overflowWrap: "anywhere", whiteSpace: "normal" }}
          />
          <p className="mt-1 text-sm tabular-nums text-[var(--color-text-muted)]">
            {countFormatter.format(selectedTransactionCount)} transaksi tercatat
          </p>
        </div>
      </section>

      <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(18rem,0.65fr)] lg:items-start">
        <section
          className="min-w-0 rounded-[var(--radius-surface)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 sm:p-5"
          aria-labelledby="category-ranking-heading"
        >
          <div className="mb-4 min-w-0">
            <h2
              id="category-ranking-heading"
              className="min-w-0 font-[family-name:var(--font-display-family)] text-lg font-bold [overflow-wrap:anywhere]"
            >
              Pengeluaran per kategori
            </h2>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">
              Diurutkan dari pengeluaran terbesar pada {selectedLabel}.
            </p>
          </div>

          <RankedCategoryList categories={categories} />
        </section>

        <figure className="min-w-0 rounded-[var(--radius-surface)] bg-[var(--color-surface-subtle)] p-4 sm:p-5">
          <div className="min-w-0">
            <h2 className="min-w-0 font-[family-name:var(--font-display-family)] text-lg font-bold [overflow-wrap:anywhere]">
              Proporsi kategori
            </h2>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">
              Visual pendukung dari peringkat di samping.
            </p>
          </div>

          <CategoryDonutChart categories={categories} />

          <figcaption className="text-sm leading-6 text-[var(--color-text-muted)]">
            Daftar peringkat memuat nilai dan persentase yang sama dalam bentuk
            teks.
          </figcaption>
        </figure>
      </div>

      <section className="min-w-0" aria-labelledby="monthly-index-heading">
        <div className="mb-3 flex min-w-0 items-center gap-3">
          <span
            className="flex size-10 shrink-0 items-center justify-center rounded-[var(--radius-control)] bg-[var(--color-primary-soft)] text-[var(--color-primary-strong)]"
            aria-hidden="true"
          >
            <CalendarRange className="size-5" />
          </span>
          <div className="min-w-0">
            <h2
              id="monthly-index-heading"
              className="min-w-0 font-[family-name:var(--font-display-family)] text-lg font-bold [overflow-wrap:anywhere]"
            >
              Riwayat semua bulan
            </h2>
            <p className="mt-0.5 text-sm text-[var(--color-text-muted)]">
              Perbandingan total dan jumlah transaksi yang tersedia.
            </p>
          </div>
        </div>

        <ol className="overflow-hidden rounded-[var(--radius-surface)] border border-[var(--color-border)] bg-[var(--color-surface)]">
          {monthlyData.map((month) => {
            const isSelected = month.key === selectedMonth;

            return (
              <li
                key={month.key}
                className={`grid min-w-0 grid-cols-[minmax(0,1fr)_minmax(7rem,auto)] items-center gap-4 border-b border-[var(--color-border)] px-4 py-3 last:border-b-0 sm:px-5 ${
                  isSelected ? "bg-[var(--color-primary-soft)]" : ""
                }`}
                aria-current={isSelected ? "date" : undefined}
              >
                <div className="min-w-0">
                  <div className="flex min-w-0 flex-wrap items-center gap-2">
                    <span className="min-w-0 break-words font-semibold text-[var(--color-text)]">
                      {month.label}
                    </span>
                    {isSelected ? (
                      <span className="rounded-[var(--radius-pill)] border border-[var(--color-primary)] px-2 py-0.5 text-xs font-semibold text-[var(--color-primary-strong)]">
                        Dipilih
                      </span>
                    ) : null}
                  </div>
                  <span className="mt-0.5 block text-sm tabular-nums text-[var(--color-text-muted)]">
                    {countFormatter.format(Number(month.transactionCount || 0))}{" "}
                    transaksi
                  </span>
                </div>

                <CurrencyAmount
                  amount={month.total}
                  className="min-w-0 text-right font-bold"
                  style={{ overflowWrap: "anywhere", whiteSpace: "normal" }}
                />
              </li>
            );
          })}
        </ol>
      </section>

      <p className="flex min-w-0 items-start gap-2 text-sm leading-6 text-[var(--color-text-muted)]">
        <BarChart3 className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        Ringkasan berasal dari agregasi server dan tidak mengubah saldo atau
        transaksi Anda.
      </p>
    </div>
  );
}
