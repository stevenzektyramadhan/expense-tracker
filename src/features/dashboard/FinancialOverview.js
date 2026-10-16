"use client";

/* Hallmark · pre-emit critique: P5 H5 E5 S5 R5 V5
 * Hallmark · genre: modern-minimal · macrostructure: Overview Console · tone: calm, trustworthy ledger
 */
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  CircleAlert,
  Clock3,
  Coins,
  RefreshCw,
  WalletCards,
} from "lucide-react";

import CurrencyAmount from "@/components/finance/CurrencyAmount";
import Button from "@/components/ui/Button";
import Skeleton from "@/components/ui/Skeleton";

const wrappingAmountStyle = {
  overflowWrap: "anywhere",
  whiteSpace: "normal",
};

const getCombinedStatus = (...statuses) => {
  if (statuses.includes("error")) return "error";
  if (statuses.some((status) => status === "idle" || status === "loading")) {
    return "loading";
  }
  return "success";
};

function MetricCard({
  amount,
  icon: Icon,
  label,
  onRetry,
  status,
  tone = "neutral",
}) {
  const isLoading = status === "idle" || status === "loading";
  const numericAmount = Number(amount);
  const isZero = Number.isFinite(numericAmount) && numericAmount === 0;
  const resolvedTone = isZero ? "neutral" : tone;

  return (
    <div className="flex min-w-0 flex-col justify-between rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-surface)] p-3.5 transition-colors">
      <div className="flex items-center gap-2 text-[var(--color-text-muted)]">
        <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-[var(--color-surface-subtle)] text-[var(--color-text-muted)]">
          <Icon className="size-3.5" aria-hidden="true" />
        </span>
        <p className="truncate text-xs font-semibold">{label}</p>
      </div>

      <div className="mt-2 min-w-0">
        {isLoading ? (
          <Skeleton width="6.5rem" height="1.25rem" />
        ) : status === "error" ? (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--color-expense-strong)]">
              <CircleAlert className="size-3.5" aria-hidden="true" />
              Gagal
            </span>
            <Button size="compact" variant="quiet" onClick={onRetry}>
              Coba lagi
            </Button>
          </div>
        ) : (
          <CurrencyAmount
            amount={amount}
            tone={resolvedTone}
            showSign={!isZero && resolvedTone === "expense"}
            className="block truncate text-base font-bold sm:text-lg"
            style={wrappingAmountStyle}
          />
        )}
      </div>
    </div>
  );
}

function BreakdownValue({
  amount,
  label,
  onRetry,
  status,
  tone = "neutral",
}) {
  const isLoading = status === "idle" || status === "loading";
  const numericAmount = Number(amount);
  const resolvedTone =
    Number.isFinite(numericAmount) && numericAmount === 0 ? "neutral" : tone;

  return (
    <div className="min-w-0">
      <dt className="text-xs font-medium text-[var(--color-text-muted)]">
        {label}
      </dt>
      <dd className="mt-1 min-w-0">
        {isLoading ? (
          <Skeleton width="6rem" height="1rem" />
        ) : status === "error" ? (
          <Button size="compact" variant="quiet" onClick={onRetry}>
            Coba lagi
          </Button>
        ) : status === "missing" ? (
          <span className="text-sm font-semibold text-[var(--color-text-muted)]">—</span>
        ) : (
          <CurrencyAmount
            amount={amount}
            tone={resolvedTone}
            className="block truncate text-sm font-bold text-[var(--color-text)]"
            style={wrappingAmountStyle}
          />
        )}
      </dd>
    </div>
  );
}

export default function FinancialOverview({
  allowance,
  metrics,
  requestState,
  onEditAllowance,
  onRetryAllowance,
  onRetryExpenses,
  onRetryIncomes,
}) {
  const allowanceStatus = requestState.allowance.status;
  const periodLabel =
    allowance?.frequency === "weekly" ? "Minggu ini" : "Bulan ini";
  const hasAllowanceValue =
    Boolean(allowance) &&
    (allowanceStatus === "success" || allowanceStatus === "loading");
  const allowanceAmount = Number(allowance?.amount);
  const allowanceRemaining = Number(allowance?.remaining);
  const hasUsageIndicator =
    hasAllowanceValue &&
    Number.isFinite(allowanceAmount) &&
    allowanceAmount > 0 &&
    Number.isFinite(allowanceRemaining);

  const spentAmount = hasUsageIndicator
    ? Math.max(allowanceAmount - allowanceRemaining, 0)
    : 0;

  const usagePercent = hasUsageIndicator
    ? Math.min(
        Math.max(
          Math.round(
            ((allowanceAmount - allowanceRemaining) / allowanceAmount) * 100,
          ),
          0,
        ),
        100,
      )
    : 0;

  const remainingPercent = hasUsageIndicator
    ? Math.min(
        Math.max(Math.round((allowanceRemaining / allowanceAmount) * 100), 0),
        100,
      )
    : 0;

  const isOverBudget = hasUsageIndicator && allowanceRemaining < 0;
  const isLowRemaining = !isOverBudget && remainingPercent <= 20;

  const progressClass = isOverBudget
    ? "bg-[var(--color-expense)]"
    : isLowRemaining
      ? "bg-[var(--color-warning)]"
      : "bg-[var(--color-primary)]";

  const statusBadge = isOverBudget ? (
    <span className="inline-flex items-center rounded-[var(--radius-pill)] bg-[var(--color-expense-soft)] px-2.5 py-0.5 text-xs font-semibold text-[var(--color-expense-strong)]">
      Melebihi anggaran
    </span>
  ) : isLowRemaining ? (
    <span className="inline-flex items-center rounded-[var(--radius-pill)] bg-[var(--color-warning-soft)] px-2.5 py-0.5 text-xs font-semibold text-[var(--color-warning-strong)]">
      Sisa menipis ({remainingPercent}%)
    </span>
  ) : hasUsageIndicator ? (
    <span className="inline-flex items-center rounded-[var(--radius-pill)] bg-[var(--color-primary-soft)] px-2.5 py-0.5 text-xs font-semibold text-[var(--color-primary-strong)]">
      {remainingPercent}% tersisa
    </span>
  ) : null;

  const periodExpenseStatus = getCombinedStatus(
    requestState.expenses.status,
    requestState.allowance.status,
  );
  const baseAllowanceStatus =
    allowanceStatus === "missing"
      ? "missing"
      : getCombinedStatus(allowanceStatus, requestState.incomes.status);

  return (
    <section
      className="overflow-hidden rounded-[var(--radius-prominent)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] shadow-[var(--elevation-1)]"
      aria-labelledby="financial-overview-title"
    >
      <div className="p-4 sm:p-5 lg:grid lg:grid-cols-[minmax(0,1.25fr)_minmax(18rem,0.75fr)] lg:gap-8 lg:p-6">
        {/* Left Column: Hero Balance */}
        <div className="flex min-w-0 flex-col justify-between">
          <div>
            <div className="flex min-w-0 items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2.5">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-[var(--radius-control)] bg-[var(--color-primary-soft)] text-[var(--color-primary-strong)]">
                  <WalletCards className="size-5" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2
                      id="financial-overview-title"
                      className="text-sm font-bold text-[var(--color-text)]"
                    >
                      Sisa uang saku
                    </h2>
                    <span className="rounded-[var(--radius-pill)] bg-[var(--color-surface-subtle)] px-2 py-0.5 text-[0.6875rem] font-semibold text-[var(--color-text-muted)]">
                      {periodLabel}
                    </span>
                  </div>
                </div>
              </div>

              <Button size="compact" variant="quiet" onClick={onEditAllowance}>
                Atur uang saku
              </Button>
            </div>

            {allowanceStatus === "idle" ||
            (allowanceStatus === "loading" && !hasAllowanceValue) ? (
              <div className="mt-4" aria-label="Memuat sisa uang saku">
                <Skeleton width="min(17rem, 82%)" height="2.75rem" />
                <Skeleton className="mt-2" width="10rem" height="0.875rem" />
              </div>
            ) : allowanceStatus === "error" ? (
              <div className="mt-4 rounded-[var(--radius-control)] bg-[var(--color-expense-soft)] p-3.5">
                <p className="text-base font-bold text-[var(--color-expense-strong)]">
                  Uang saku tidak tersedia
                </p>
                <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                  Data gagal dimuat. Nilai tidak dianggap sebagai nol.
                </p>
                <Button
                  className="mt-2"
                  size="compact"
                  variant="secondary"
                  onClick={onRetryAllowance}
                >
                  <RefreshCw className="size-3.5" aria-hidden="true" />
                  Coba lagi
                </Button>
              </div>
            ) : allowanceStatus === "missing" ? (
              <div className="mt-4 rounded-[var(--radius-control)] border border-dashed border-[var(--color-border)] p-4 text-center sm:text-left">
                <p className="text-base font-bold text-[var(--color-text)]">
                  Uang saku belum diatur
                </p>
                <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                  Atur uang saku agar pengeluaran harian dan sisa saldo dapat dipantau.
                </p>
                <Button
                  className="mt-3"
                  size="compact"
                  variant="primary"
                  onClick={onEditAllowance}
                >
                  Atur sekarang
                </Button>
              </div>
            ) : (
              <div className="mt-4 min-w-0">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <CurrencyAmount
                    amount={allowance?.remaining}
                    className="block font-[family-name:var(--font-display-family)] text-3xl font-extrabold tracking-tight text-[var(--color-text)] sm:text-4xl lg:text-[2.75rem]"
                    style={wrappingAmountStyle}
                  />
                  {statusBadge}
                </div>

                <p className="mt-1.5 text-xs text-[var(--color-text-muted)] sm:text-sm">
                  dari total alokasi{" "}
                  <CurrencyAmount
                    amount={allowance?.amount}
                    className="font-bold text-[var(--color-text)]"
                    style={wrappingAmountStyle}
                  />
                </p>
              </div>
            )}
          </div>

          {hasUsageIndicator ? (
            <div className="mt-5">
              <div className="flex items-center justify-between gap-3 text-xs font-medium">
                <span className="text-[var(--color-text-muted)]">
                  Terpakai:{" "}
                  <CurrencyAmount
                    amount={spentAmount}
                    showSign={false}
                    className="font-bold text-[var(--color-text)]"
                  />{" "}
                  ({usagePercent}%)
                </span>
                <span className="text-[var(--color-text-muted)]">
                  Batas:{" "}
                  <CurrencyAmount
                    amount={allowanceAmount}
                    showSign={false}
                    className="font-bold text-[var(--color-text)]"
                  />
                </span>
              </div>

              <div
                className="mt-2 h-2.5 w-full overflow-hidden rounded-[var(--radius-pill)] bg-[var(--color-surface-subtle)]"
                role="progressbar"
                aria-label="Penggunaan uang saku"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={usagePercent}
                aria-valuetext={
                  isOverBudget
                    ? "Uang saku telah melebihi batas"
                    : `${remainingPercent} persen uang saku tersisa`
                }
              >
                <span
                  className={`block h-full rounded-[var(--radius-pill)] transition-all duration-300 ${progressClass}`}
                  style={{ width: `${usagePercent}%` }}
                  aria-hidden="true"
                />
              </div>
            </div>
          ) : null}

          {allowanceStatus === "loading" && hasAllowanceValue ? (
            <p
              className="mt-2 flex items-center gap-2 text-xs text-[var(--color-text-muted)]"
              role="status"
            >
              <RefreshCw className="size-3 animate-spin" aria-hidden="true" />
              Memperbarui saldo uang saku…
            </p>
          ) : null}
        </div>

        {/* Right Column: Today & Period Metrics */}
        <div className="mt-4 flex min-w-0 flex-col justify-center gap-3 lg:mt-0">
          <p className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)] lg:sr-only">
            Aktivitas pengeluaran
          </p>
          <div className="grid min-w-0 grid-cols-2 gap-2.5">
            <MetricCard
              amount={metrics.todaySpending}
              icon={Clock3}
              label="Hari ini"
              status={requestState.expenses.status}
              tone="expense"
              onRetry={onRetryExpenses}
            />
            <MetricCard
              amount={metrics.currentAllowancePeriodSpending}
              icon={CalendarDays}
              label={periodLabel}
              status={periodExpenseStatus}
              tone="expense"
              onRetry={
                requestState.expenses.status === "error"
                  ? onRetryExpenses
                  : onRetryAllowance
              }
            />
          </div>
        </div>
      </div>

      {/* Bottom Panel: Breakdown */}
      <div className="border-t border-[var(--color-border)] bg-[var(--color-surface-subtle)]/60 px-4 py-3 sm:px-5 lg:px-6">
        <div className="flex min-w-0 items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--color-text)]">
            <Coins className="size-3.5 text-[var(--color-primary-strong)]" aria-hidden="true" />
            <span>Rincian alokasi {periodLabel.toLowerCase()}</span>
          </div>
          <Link
            href="/income"
            className="inline-flex min-h-8 items-center gap-1 rounded-[var(--radius-control)] text-xs font-semibold text-[var(--color-primary-strong)] outline-none hover:underline focus-visible:outline-[var(--focus-ring-width)] focus-visible:outline-offset-[var(--focus-ring-offset)] focus-visible:outline-[var(--color-focus)]"
          >
            Kelola pendapatan
            <ArrowRight className="size-3" aria-hidden="true" />
          </Link>
        </div>

        <dl className="mt-2.5 grid min-w-0 grid-cols-2 gap-4 sm:grid-cols-3">
          <BreakdownValue
            amount={metrics.baseAllowanceDisplay}
            label="Uang saku awal"
            status={baseAllowanceStatus}
            onRetry={
              allowanceStatus === "error" ? onRetryAllowance : onRetryIncomes
            }
          />
          <BreakdownValue
            amount={metrics.currentAllowancePeriodAdditionalIncome}
            label="Pendapatan tambahan"
            status={requestState.incomes.status}
            tone="income"
            onRetry={onRetryIncomes}
          />
          <div className="col-span-2 sm:col-span-1">
            <BreakdownValue
              amount={allowance?.amount}
              label="Total alokasi aktif"
              status={allowanceStatus}
              tone="neutral"
              onRetry={onRetryAllowance}
            />
          </div>
        </dl>
      </div>
    </section>
  );
}
