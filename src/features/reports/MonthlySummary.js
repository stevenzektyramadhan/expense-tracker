"use client";

/* Hallmark · pre-emit critique: P5 H5 E4 S5 R5 V5
 * Hallmark · genre: modern-minimal · macrostructure: Index-First · design-system: Calm Ledger · designed-as-app
 */
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  BarChart3,
  CalendarDays,
  CalendarRange,
  Download,
  PieChart,
  Sparkles,
  WalletCards,
} from "lucide-react";

import CurrencyAmount from "@/components/finance/CurrencyAmount";
import Button from "@/components/ui/Button";
import FormField from "@/components/ui/FormField";
import Skeleton from "@/components/ui/Skeleton";
import RankedCategoryList from "@/features/reports/RankedCategoryList";
import { formatCurrency } from "@/lib/utils";

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

const ADVICE_STATUS_META = {
  aman: {
    label: "Kondisi Aman",
    className:
      "border-[var(--color-income)] bg-[var(--color-income-soft)] text-[var(--color-income-strong)]",
  },
  waspada: {
    label: "Perlu Waspada",
    className:
      "border-[var(--color-warning)] bg-[var(--color-warning-soft)] text-[var(--color-warning-strong)]",
  },
  kritis: {
    label: "Perlu Penyesuaian",
    className:
      "border-[var(--color-expense)] bg-[var(--color-expense-soft)] text-[var(--color-expense-strong)]",
  },
};

export default function MonthlySummary({
  categories,
  monthlyData,
  onMonthChange,
  selectedMonth,
  selectedMonthData,
  onExport,
  isExporting,
  exportError,
  advice = null,
  onRequestAdvice,
  isLoadingAdvice = false,
  adviceError = "",
  onApplyBudgetAction,
  isApplyingBudget = false,
  budgetActionFeedback = { status: "idle", message: "" },
}) {
  const selectedLabel = selectedMonthData?.label || "Periode terpilih";
  const selectedTotal = Number(selectedMonthData?.total || 0);
  const selectedTransactionCount = Number(
    selectedMonthData?.transactionCount || 0,
  );
  const statusMeta =
    ADVICE_STATUS_META[advice?.status] || ADVICE_STATUS_META.aman;

  return (
    <div className="mx-auto grid w-full max-w-6xl min-w-0 gap-6 px-4 sm:px-0">
      <header className="min-w-0">
        <h1 className="min-w-0 font-[family-name:var(--font-display-family)] text-2xl font-bold tracking-[-0.025em] text-[var(--color-text)] [overflow-wrap:anywhere]">
          Ringkasan bulanan
        </h1>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">
          Lihat pengeluaran berdasarkan periode dan kategori.
        </p>
      </header>

      <section
        className="grid min-w-0 gap-4 rounded-[var(--radius-prominent)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-[var(--elevation-1)] md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] md:items-end md:p-5"
        aria-labelledby="summary-period-heading"
      >
        <div className="flex min-w-0 items-center gap-3">
          <span
            className="flex size-10 shrink-0 items-center justify-center rounded-[var(--radius-control)] bg-[var(--color-primary-soft)] text-[var(--color-primary-strong)]"
            aria-hidden="true"
          >
            <CalendarDays className="size-5" />
          </span>
          <div className="min-w-0">
            <h2
              id="summary-period-heading"
              className="min-w-0 font-[family-name:var(--font-display-family)] text-lg font-bold [overflow-wrap:anywhere]"
            >
              Periode laporan
            </h2>
          </div>
        </div>
        <div className="min-w-0">
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

          <div className="mt-4 flex min-w-0 flex-col items-start gap-2 md:flex-row md:items-center md:justify-end">
            <Button
              size="compact"
              variant="secondary"
              onClick={onExport}
              isLoading={isExporting}
              loadingLabel="Menyiapkan CSV…"
              aria-label={
                isExporting
                  ? `Menyiapkan ekspor pengeluaran ${selectedLabel}`
                  : `Unduh CSV pengeluaran ${selectedLabel}`
              }
            >
              <Download className="size-4" aria-hidden="true" />
              Unduh CSV bulan terpilih
            </Button>
            {exportError ? (
              <p className="text-sm leading-6 text-[var(--color-expense-strong)]" role="alert">
                {exportError}
              </p>
            ) : null}
          </div>
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

      <section
        className="grid min-w-0 gap-4 rounded-[var(--radius-surface)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 sm:p-5"
        aria-labelledby="ai-advice-heading"
      >
        <div className="flex min-w-0 flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <span
              className="flex size-10 shrink-0 items-center justify-center rounded-[var(--radius-control)] bg-[var(--color-primary-soft)] text-[var(--color-primary-strong)]"
              aria-hidden="true"
            >
              <Sparkles className="size-5" />
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2
                  id="ai-advice-heading"
                  className="min-w-0 font-[family-name:var(--font-display-family)] text-lg font-bold [overflow-wrap:anywhere]"
                >
                  Analisis & Rekomendasi AI
                </h2>
                {advice ? (
                  <span
                    className={`rounded-[var(--radius-pill)] border px-2.5 py-0.5 text-xs font-semibold ${statusMeta.className}`}
                  >
                    {statusMeta.label}
                  </span>
                ) : null}
              </div>
              <p className="mt-0.5 text-sm text-[var(--color-text-muted)]">
                Evaluasi laju pengeluaran, anggaran kategori, dan saran penghematan untuk {selectedLabel}.
              </p>
            </div>
          </div>

          {onRequestAdvice ? (
            <Button
              size="compact"
              variant={advice ? "secondary" : "primary"}
              onClick={onRequestAdvice}
              isLoading={isLoadingAdvice}
              loadingLabel="Menganalisis…"
            >
              <Sparkles className="size-4" aria-hidden="true" />
              {advice ? "Perbarui analisis" : "Minta analisis AI"}
            </Button>
          ) : null}
        </div>

        {adviceError ? (
          <p
            className="text-sm leading-6 text-[var(--color-expense-strong)]"
            role="alert"
          >
            {adviceError}
          </p>
        ) : null}

        {advice ? (
          <div className="grid min-w-0 gap-3 border-t border-[var(--color-border)] pt-3">
            <p className="text-sm font-medium leading-6 text-[var(--color-text)]">
              {advice.summary}
            </p>
            <ul className="grid gap-2 text-sm leading-6 text-[var(--color-text-muted)]">
              {(advice.recommendations || []).map((tip, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2.5 rounded-[var(--radius-control)] bg-[var(--color-surface-subtle)] px-3 py-2 text-[var(--color-text)]"
                >
                  <span className="mt-0.5 font-bold text-[var(--color-primary-strong)]">
                    {idx + 1}.
                  </span>
                  <span className="min-w-0 flex-1">{tip}</span>
                </li>
              ))}
            </ul>

            {advice.suggestedBudgetAction && onApplyBudgetAction ? (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-surface-subtle)] px-3 py-2.5">
                <div className="min-w-0 text-xs text-[var(--color-text-muted)]">
                  <span className="font-semibold text-[var(--color-text)]">
                    Aksi cepat:
                  </span>{" "}
                  Pasang batas anggaran{" "}
                  <strong className="text-[var(--color-text)]">
                    {advice.suggestedBudgetAction.category}
                  </strong>{" "}
                  sebesar{" "}
                  <strong className="text-[var(--color-text)]">
                    {formatCurrency(
                      advice.suggestedBudgetAction.suggestedAmount,
                    )}
                    /bulan
                  </strong>{" "}
                  (target hemat 10%).
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    size="compact"
                    variant="primary"
                    onClick={() =>
                      onApplyBudgetAction(advice.suggestedBudgetAction)
                    }
                    isLoading={isApplyingBudget}
                    loadingLabel="Menyimpan…"
                  >
                    <WalletCards className="size-4" aria-hidden="true" />
                    Terapkan budget
                  </Button>
                  <Link
                    href="/#category-budget-heading"
                    className="ui-button"
                    data-variant="quiet"
                    data-size="compact"
                  >
                    Kelola semua budget
                  </Link>
                </div>
              </div>
            ) : null}

            {budgetActionFeedback?.message ? (
              <p
                className={`text-xs font-medium ${
                  budgetActionFeedback.status === "error"
                    ? "text-[var(--color-expense-strong)]"
                    : "text-[var(--color-income-strong)]"
                }`}
                role="status"
              >
                {budgetActionFeedback.message}
              </p>
            ) : null}
          </div>
        ) : null}
      </section>

      <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(18rem,0.65fr)] lg:items-start">
        <section
          className="min-w-0 rounded-[var(--radius-surface)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 sm:p-5"
          aria-labelledby="category-ranking-heading"
        >
          <div className="mb-4 flex min-w-0 items-center gap-3">
            <span
              className="flex size-10 shrink-0 items-center justify-center rounded-[var(--radius-control)] bg-[var(--color-primary-soft)] text-[var(--color-primary-strong)]"
              aria-hidden="true"
            >
              <BarChart3 className="size-5" />
            </span>
            <div className="min-w-0">
              <h2
                id="category-ranking-heading"
                className="min-w-0 font-[family-name:var(--font-display-family)] text-lg font-bold [overflow-wrap:anywhere]"
              >
                Pengeluaran per kategori
              </h2>
              <p className="mt-0.5 text-sm text-[var(--color-text-muted)]">
                Diurutkan dari pengeluaran terbesar pada {selectedLabel}.
              </p>
            </div>
          </div>

          <RankedCategoryList categories={categories} />
        </section>

        <figure className="min-w-0 rounded-[var(--radius-surface)] bg-[var(--color-surface-subtle)] p-4 sm:p-5">
          <div className="mb-4 flex min-w-0 items-center gap-3">
            <span
              className="flex size-10 shrink-0 items-center justify-center rounded-[var(--radius-control)] bg-[var(--color-surface-raised)] text-[var(--color-primary-strong)]"
              aria-hidden="true"
            >
              <PieChart className="size-5" />
            </span>
            <div className="min-w-0">
              <h2 className="min-w-0 font-[family-name:var(--font-display-family)] text-lg font-bold [overflow-wrap:anywhere]">
                Proporsi kategori
              </h2>
              <p className="mt-0.5 text-sm text-[var(--color-text-muted)]">
                Visual pendukung dari peringkat di samping.
              </p>
            </div>
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
