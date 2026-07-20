import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  CircleAlert,
  Clock3,
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

function Metric({ amount, icon: Icon, label, status, tone = "neutral", onRetry }) {
  const isLoading = status === "idle" || status === "loading";
  const numericAmount = Number(amount);
  const isZero = Number.isFinite(numericAmount) && numericAmount === 0;
  const resolvedTone = isZero ? "neutral" : tone;
  const surfaceClass =
    status === "error"
      ? "bg-[var(--color-expense-soft)]"
      : resolvedTone === "expense"
        ? "bg-[var(--color-expense-soft)]"
        : "bg-[var(--color-surface-subtle)]";

  return (
    <div className={`min-w-0 rounded-[var(--radius-control)] p-3 ${surfaceClass}`}>
      <div className="flex min-w-0 items-center gap-2 text-[var(--color-text-muted)]">
        <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
        <p className="min-w-0 text-xs font-semibold leading-4">{label}</p>
      </div>
      {isLoading ? (
        <Skeleton className="mt-2" width="7rem" height="1.25rem" />
      ) : status === "error" ? (
        <div className="mt-1 flex flex-wrap items-center gap-1">
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--color-expense-strong)]">
            <CircleAlert className="h-3.5 w-3.5" aria-hidden="true" />
            Tidak tersedia
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
          className="mt-1 block break-words text-base font-bold sm:text-lg"
          style={wrappingAmountStyle}
        />
      )}
    </div>
  );
}

function BreakdownValue({ amount, label, onRetry, status, tone = "neutral" }) {
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
          <Skeleton width="7rem" height="1.125rem" />
        ) : status === "error" ? (
          <Button size="compact" variant="quiet" onClick={onRetry}>
            Coba lagi
          </Button>
        ) : status === "missing" ? (
          <span className="font-semibold text-[var(--color-text-muted)]">—</span>
        ) : (
          <CurrencyAmount
            amount={amount}
            tone={resolvedTone}
            className="block break-words text-sm font-bold"
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
      className="overflow-hidden rounded-[var(--radius-prominent)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] shadow-[var(--elevation-2)]"
      aria-labelledby="financial-overview-title"
    >
      <div className="p-4 sm:p-5 lg:grid lg:grid-cols-[minmax(0,1.15fr)_minmax(20rem,0.85fr)] lg:gap-6 lg:p-6">
        <div className="min-w-0">
          <div className="flex min-w-0 items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[var(--radius-control)] bg-[var(--color-primary-soft)] text-[var(--color-primary-strong)]">
                <WalletCards className="h-5 w-5" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p
                  id="financial-overview-title"
                  className="text-sm font-bold text-[var(--color-text)]"
                >
                  Sisa uang saku
                </p>
                <p className="text-xs text-[var(--color-text-muted)]">
                  {periodLabel}
                </p>
              </div>
            </div>
            <Button size="compact" variant="quiet" onClick={onEditAllowance}>
              Atur
            </Button>
          </div>

          {allowanceStatus === "idle" ||
          (allowanceStatus === "loading" && !hasAllowanceValue) ? (
            <div className="mt-4" aria-label="Memuat sisa uang saku">
              <Skeleton width="min(17rem, 82%)" height="2.5rem" />
              <Skeleton className="mt-2" width="10rem" height="0.875rem" />
            </div>
          ) : allowanceStatus === "error" ? (
            <div className="mt-4">
              <p className="text-lg font-bold text-[var(--color-text)]">
                Uang saku tidak tersedia
              </p>
              <p className="mt-1 max-w-md text-sm text-[var(--color-text-muted)]">
                Data gagal dimuat dan tidak dianggap sebagai nilai nol.
              </p>
              <Button
                className="mt-2"
                size="compact"
                variant="secondary"
                onClick={onRetryAllowance}
              >
                <RefreshCw className="h-4 w-4" aria-hidden="true" />
                Coba lagi
              </Button>
            </div>
          ) : allowanceStatus === "missing" ? (
            <div className="mt-4">
              <p className="text-lg font-bold text-[var(--color-text)]">
                Uang saku belum diatur
              </p>
              <p className="mt-1 max-w-md text-sm text-[var(--color-text-muted)]">
                Pilih Atur untuk menambahkan uang saku periode ini.
              </p>
            </div>
          ) : (
            <div className="mt-3 min-w-0">
              <CurrencyAmount
                amount={allowance?.remaining}
                className="block max-w-full break-words font-[family-name:var(--font-display-family)] text-[clamp(2rem,9vw,3rem)] font-bold leading-none tracking-[-0.045em]"
                style={wrappingAmountStyle}
              />
              <p className="mt-2 text-xs text-[var(--color-text-muted)] sm:text-sm">
                dari total{" "}
                <CurrencyAmount
                  amount={allowance?.amount}
                  className="font-semibold"
                  style={wrappingAmountStyle}
                />
              </p>
            </div>
          )}

          {hasUsageIndicator ? (
            <div className="mt-3">
              <div className="flex items-center justify-between gap-3 text-xs font-semibold">
                <span className="text-[var(--color-text-muted)]">
                  Penggunaan {usagePercent}%
                </span>
                <span
                  className={
                    isOverBudget
                      ? "text-[var(--color-expense-strong)]"
                      : isLowRemaining
                        ? "text-[var(--color-warning-strong)]"
                        : "text-[var(--color-primary-strong)]"
                  }
                >
                  {isOverBudget ? "Melebihi batas" : `${remainingPercent}% tersisa`}
                </span>
              </div>
              <div
                className="mt-2 h-2 overflow-hidden rounded-[var(--radius-pill)] bg-[var(--color-surface-subtle)]"
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
                  className={`block h-full rounded-[var(--radius-pill)] ${progressClass}`}
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
              <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
              Memperbarui uang saku…
            </p>
          ) : null}
        </div>

        <div className="mt-3 grid min-w-0 grid-cols-2 gap-2 lg:mt-0 lg:self-end">
          <Metric
            amount={metrics.todaySpending}
            icon={Clock3}
            label="Hari ini"
            status={requestState.expenses.status}
            tone="expense"
            onRetry={onRetryExpenses}
          />
          <Metric
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

      <div className="border-t border-[var(--color-border)] bg-[var(--color-income-soft)] px-4 py-2 sm:px-5 lg:px-6">
        <div className="flex min-w-0 items-center justify-between gap-3">
          <p className="text-xs font-bold text-[var(--color-income-strong)]">
            Rincian uang saku
          </p>
          <Link
            href="/income"
            className="inline-flex min-h-11 shrink-0 items-center gap-1 whitespace-nowrap rounded-[var(--radius-control)] px-2 text-xs font-semibold text-[var(--color-income-strong)] outline-none hover:underline focus-visible:outline-[var(--focus-ring-width)] focus-visible:outline-offset-[var(--focus-ring-offset)] focus-visible:outline-[var(--color-focus)] active:text-[var(--color-text)]"
          >
            Riwayat pendapatan
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>
        <dl className="grid min-w-0 grid-cols-2 gap-4 pb-1">
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
        </dl>
      </div>
    </section>
  );
}
