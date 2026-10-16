"use client";

/* Hallmark · pre-emit critique: P5 H5 E5 S5 R5 V4
 * Hallmark · genre: modern-minimal · macrostructure: Workbench · design-system: Calm Ledger · designed-as-app
 */
import { useMemo, useState } from "react";
import Link from "next/link";
import { PlusCircle, UserRound } from "lucide-react";

import Button from "@/components/ui/Button";
import Dialog from "@/components/ui/Dialog";
import FormField from "@/components/ui/FormField";
import StatusBanner from "@/components/ui/StatusBanner";
import { DEFAULT_EXPENSE_CATEGORIES } from "@/lib/finance";
import DashboardFilters from "@/app/(dashboard)/components/DashboardFilters";
import ExpenseForm from "@/features/expenses/ExpenseForm";
import FinancialOverview from "./FinancialOverview";
import DashboardSkeleton from "./DashboardSkeleton";
import TransactionSection from "@/features/transactions/TransactionSection";
import CategoryBudgetSection from "./CategoryBudgetSection";
import SpendingInsights from "./SpendingInsights";

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

export default function DashboardPage({
  allowance,
  availableExpensePeriods,
  currentAllowancePeriod,
  expenses,
  displayedExpenses,
  discoveryResult,
  discoveryPending,
  filters,
  frequentExpenseCategories = [],
  spendingInsights,
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
  onRetryDiscovery,
  onRetryIncomes,
  onSelectExpense,
  onExpenseCreated,
  requestState,
  showProfilePrompt = false,
  userId,
}) {
  const [quickCaptureOpen, setQuickCaptureOpen] = useState(false);
  const [isQuickCaptureSubmitting, setIsQuickCaptureSubmitting] = useState(false);
  const safeExpenses = useMemo(
    () => (Array.isArray(expenses) ? expenses : []),
    [expenses],
  );
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
          onClick={(event) => {
            event.preventDefault();
            setQuickCaptureOpen(true);
          }}
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

      <div className="order-4 min-w-0 md:col-span-2">
        <SpendingInsights insights={spendingInsights} />
      </div>

      <Dialog
        open={quickCaptureOpen}
        onClose={() => setQuickCaptureOpen(false)}
        preventClose={isQuickCaptureSubmitting}
        size="lg"
        title="Tambah pengeluaran"
        description="Catat pengeluaran tanpa meninggalkan ringkasan keuangan."
      >
        <ExpenseForm
          onCancel={() => setQuickCaptureOpen(false)}
          onSuccess={() => {
            setIsQuickCaptureSubmitting(false);
            setQuickCaptureOpen(false);
            onExpenseCreated?.();
          }}
           onSubmittingChange={setIsQuickCaptureSubmitting}
           frequentExpenseCategories={frequentExpenseCategories}
         />
      </Dialog>

      <div className="order-3 md:hidden">
        <Link
          href="/add"
          onClick={(event) => {
            event.preventDefault();
            setQuickCaptureOpen(true);
          }}
          className="ui-button whitespace-nowrap"
          data-variant="primary"
          data-width="full"
        >
          <PlusCircle className="h-5 w-5" aria-hidden="true" />
          Tambah pengeluaran
        </Link>
      </div>

      {showProfilePrompt ? (
        <div className="order-4 min-w-0 md:col-span-2">
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
        <CategoryBudgetSection
          currentPeriod={currentAllowancePeriod}
          expenseCategories={safeExpenses.map((expense) => expense.category).filter(Boolean)}
          userId={userId}
        />
      </div>

      <div className="order-8 min-w-0 md:col-span-2">
        <TransactionSection
          transactions={Array.isArray(displayedExpenses) ? displayedExpenses : []}
          resultCount={discoveryResult}
          isPending={discoveryPending}
          hasAnyTransactions={discoveryResult.total > 0}
          filtersAreActive={filtersAreActive}
          requestState={requestState.discovery}
          onSelect={onSelectExpense}
          onEdit={onEditExpense}
          onDelete={onDeleteExpense}
          onResetFilters={resetFilters}
          onRetry={onRetryDiscovery}
        />
      </div>
    </div>
  );
}
