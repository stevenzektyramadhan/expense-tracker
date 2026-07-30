"use client";

/* Hallmark · pre-emit critique: P5 H5 E5 S5 R5 V4
 * Hallmark · genre: modern-minimal · macrostructure: Workbench · design-system: Calm Ledger · designed-as-app
 */
import { useMemo, useState } from "react";
import Link from "next/link";
import { PlusCircle, UserRound } from "lucide-react";

import Button from "@/components/ui/Button";
import FormField from "@/components/ui/FormField";
import StatusBanner from "@/components/ui/StatusBanner";
import CurrencyAmount from "@/components/finance/CurrencyAmount";
import { DEFAULT_EXPENSE_CATEGORIES } from "@/lib/finance";
import DashboardFilters from "@/app/(dashboard)/components/DashboardFilters";
import FinancialOverview from "./FinancialOverview";
import RecentTransactions from "./RecentTransactions";
import DashboardSkeleton from "./DashboardSkeleton";
import TransactionSection from "@/features/transactions/TransactionSection";

const wrappingAmountStyle = {
  overflowWrap: "anywhere",
  whiteSpace: "normal",
};

function ProfileCompletionPrompt({ onDismiss, onSave }) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const trimmedName = name.trim();

    if (!trimmedName) {
      setError("Nama panggilan perlu diisi sebelum disimpan.");
      return;
    }

    setError("");
    setIsSaving(true);

    try {
      await onSave(trimmedName);
    } catch (saveError) {
      setError(
        saveError instanceof Error && saveError.message
          ? saveError.message
          : "Nama belum dapat disimpan. Coba lagi.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const actions = !isEditing ? (
    <div className="flex flex-wrap gap-2">
      <Button size="compact" onClick={() => setIsEditing(true)}>
        Tambahkan nama
      </Button>
      <Button size="compact" variant="quiet" onClick={onDismiss}>
        Nanti
      </Button>
    </div>
  ) : null;

  return (
    <StatusBanner
      tone="info"
      icon={UserRound}
      title="Lengkapi profil"
      action={actions}
      aria-label="Lengkapi nama panggilan"
    >
      <p>
        Nama panggilan membantu mempersonalisasi kiteCatat, tetapi tidak wajib
        untuk mencatat transaksi.
      </p>

      {isEditing ? (
        <form
          className="mt-3 grid min-w-0 gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start"
          onSubmit={handleSubmit}
        >
          <FormField
            className="min-w-0"
            label="Nama panggilan"
            error={error}
            required
          >
            <input
              type="text"
              autoComplete="nickname"
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                if (error) setError("");
              }}
              placeholder="Contoh: Dita"
              maxLength={80}
            />
          </FormField>

          <div className="flex flex-wrap gap-2 sm:pt-7">
            <Button
              type="submit"
              size="compact"
              isLoading={isSaving}
              loadingLabel="Menyimpan…"
            >
              Simpan nama
            </Button>
            <Button
              type="button"
              size="compact"
              variant="quiet"
              onClick={onDismiss}
              disabled={isSaving}
            >
              Nanti
            </Button>
          </div>
        </form>
      ) : null}
    </StatusBanner>
  );
}

function FilteredMetrics({ metrics, requestState }) {
  if (requestState.expenses.status !== "success") return null;

  return (
    <section
      className="grid gap-px overflow-hidden rounded-[var(--radius-surface)] border border-[var(--color-border)] bg-[var(--color-border)] sm:grid-cols-3"
      aria-labelledby="filtered-metrics-title"
    >
      <h2 id="filtered-metrics-title" className="sr-only">
        Ringkasan hasil transaksi
      </h2>

      <div className="bg-[var(--color-surface)] p-4 sm:p-5">
        <p className="text-sm text-[var(--color-text-muted)]">Total hasil</p>
        <CurrencyAmount
          amount={metrics.filteredExpenseTotal}
          tone="expense"
          showSign
          className="mt-1 block text-lg font-bold"
          style={wrappingAmountStyle}
        />
      </div>
      <div className="bg-[var(--color-surface)] p-4 sm:p-5">
        <p className="text-sm text-[var(--color-text-muted)]">Jumlah transaksi</p>
        <p className="mt-1 text-lg font-bold [font-variant-numeric:tabular-nums]">
          {metrics.filteredTransactionCount}
        </p>
      </div>
      <div className="bg-[var(--color-surface)] p-4 sm:p-5">
        <p className="text-sm text-[var(--color-text-muted)]">Rata-rata transaksi</p>
        <CurrencyAmount
          amount={Math.round(metrics.filteredAverageTransaction || 0)}
          className="mt-1 block text-lg font-bold"
          style={wrappingAmountStyle}
        />
      </div>
    </section>
  );
}

export default function DashboardPage({
  allowance,
  availableExpensePeriods,
  currentAllowancePeriod,
  expenses,
  filteredExpenses,
  filters,
  isInitialLoading = false,
  metrics,
  onCompleteProfile,
  onDeleteExpense,
  onDismissProfilePrompt,
  onEditAllowance,
  onEditExpense,
  onFilterChange,
  onRetryAllowance,
  onRetryExpenses,
  onRetryIncomes,
  onSelectExpense,
  requestState,
  showProfilePrompt = false,
}) {
  const safeExpenses = useMemo(
    () => (Array.isArray(expenses) ? expenses : []),
    [expenses],
  );
  const safeFilteredExpenses = Array.isArray(filteredExpenses)
    ? filteredExpenses
    : [];
  const categories = useMemo(() => {
    return Array.from(
      new Set([
        ...DEFAULT_EXPENSE_CATEGORIES,
        ...safeExpenses.map((expense) => expense.category).filter(Boolean),
      ]),
    );
  }, [safeExpenses]);
  const filtersAreActive =
    filters.period === "all" ||
    filters.month !== currentAllowancePeriod.month ||
    filters.year !== currentAllowancePeriod.year ||
    Boolean(filters.category) ||
    Boolean(filters.search.trim()) ||
    filters.sort !== "date-desc";

  const resetFilters = () => {
    onFilterChange({
      period: "month",
      month: currentAllowancePeriod.month,
      year: currentAllowancePeriod.year,
      category: "",
      search: "",
      sort: "date-desc",
    });
  };

  if (isInitialLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="grid min-w-0 grid-cols-1 gap-4 px-4 sm:px-0 md:grid-cols-[minmax(0,1fr)_auto] md:gap-x-8 md:gap-y-6">
      <h1 className="sr-only md:hidden">Ringkasan keuangan</h1>

      <header className="order-1 hidden min-w-0 md:col-start-1 md:row-start-1 md:block">
        <h1 className="min-w-0 [overflow-wrap:anywhere] font-[family-name:var(--font-display-family)] text-2xl font-bold tracking-[-0.025em]">
          Ringkasan keuangan
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-[var(--color-text-muted)]">
          Sisa uang saku dan transaksi dalam satu tampilan.
        </p>
      </header>

      <div className="order-2 hidden gap-2 md:col-start-2 md:row-start-1 md:flex md:items-start">
        <Link
          href="/add"
          className="ui-button whitespace-nowrap"
          data-variant="primary"
          data-width="full"
        >
          Tambah pengeluaran
        </Link>
        <Link
          href="/income/add"
          className="ui-button whitespace-nowrap"
          data-variant="secondary"
          data-width="full"
        >
          Tambah pendapatan
        </Link>
      </div>

      <div className="order-2 min-w-0 md:order-3 md:col-span-2 md:row-start-2">
        <FinancialOverview
          allowance={allowance}
          metrics={metrics}
          requestState={requestState}
          onEditAllowance={onEditAllowance}
          onRetryAllowance={onRetryAllowance}
          onRetryExpenses={onRetryExpenses}
          onRetryIncomes={onRetryIncomes}
        />
      </div>

      <div className="order-3 md:hidden">
        <Link
          href="/add"
          className="ui-button whitespace-nowrap"
          data-variant="primary"
          data-width="full"
        >
          <PlusCircle className="h-5 w-5" aria-hidden="true" />
          Tambah pengeluaran
        </Link>
      </div>

      <div className="order-4 min-w-0 md:col-span-2">
        <RecentTransactions
          transactions={safeFilteredExpenses}
          requestStatus={requestState.expenses.status}
          filtersAreActive={filtersAreActive}
          onSelect={onSelectExpense}
          onEdit={onEditExpense}
          onDelete={onDeleteExpense}
        />
      </div>

      {showProfilePrompt ? (
        <div className="order-5 min-w-0 md:col-span-2">
          <ProfileCompletionPrompt
            onDismiss={onDismissProfilePrompt}
            onSave={onCompleteProfile}
          />
        </div>
      ) : null}

      <div className="order-6 min-w-0 md:col-span-2">
        <DashboardFilters
          categories={categories}
          filters={filters}
          availableExpensePeriods={availableExpensePeriods}
          hasActiveFilters={filtersAreActive}
          onFilterChange={onFilterChange}
          onReset={resetFilters}
        />
      </div>

      <div className="order-7 min-w-0 md:col-span-2">
        <TransactionSection
          transactions={safeFilteredExpenses}
          hasAnyTransactions={safeExpenses.length > 0}
          filtersAreActive={filtersAreActive}
          requestState={requestState.expenses}
          onSelect={onSelectExpense}
          onEdit={onEditExpense}
          onDelete={onDeleteExpense}
          onResetFilters={resetFilters}
          onRetry={onRetryExpenses}
        />
      </div>

      <div className="order-8 min-w-0 md:col-span-2">
        <FilteredMetrics metrics={metrics} requestState={requestState} />
      </div>
    </div>
  );
}
