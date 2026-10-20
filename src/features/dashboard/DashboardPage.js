"use client";

/* Hallmark · pre-emit critique: P5 H5 E5 S5 R5 V5
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
import RecentTransactions from "./RecentTransactions";
import SpendingInsights from "./SpendingInsights";

const QUICK_CAPTURE_FORM_ID = "dashboard-quick-capture-expense-form";

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
    <div className="flex min-w-0 flex-col gap-5 px-4 sm:px-0">
      {/* 1. Header with dynamic context & desktop quick actions */}
      <header className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="font-[family-name:var(--font-display-family)] text-2xl font-bold tracking-tight text-[var(--color-text)]">
            Ringkasan keuangan
          </h1>
          <p className="mt-0.5 text-sm text-[var(--color-text-muted)]">
            Pantau sisa uang saku dan transaksi harian dalam satu tampilan.
          </p>
        </div>

        <div className="hidden items-center gap-2.5 sm:flex">
          <Link
            href="/income/add"
            className="ui-button whitespace-nowrap"
            data-variant="secondary"
          >
            Tambah pendapatan
          </Link>
          <Button
            type="button"
            variant="primary"
            onClick={() => setQuickCaptureOpen(true)}
          >
            <PlusCircle className="size-4" aria-hidden="true" />
            Tambah pengeluaran
          </Button>
        </div>
      </header>

      {/* 2. Dominant Financial Hero Overview */}
      <div className="min-w-0">
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

      {/* Quick capture modal */}
      <Dialog
        open={quickCaptureOpen}
        onClose={() => setQuickCaptureOpen(false)}
        preventClose={isQuickCaptureSubmitting}
        size="lg"
        title="Tambah pengeluaran"
        description="Catat pengeluaran tanpa meninggalkan ringkasan keuangan."
        footer={
          <div className="flex w-full flex-col gap-2 sm:flex-row-reverse sm:justify-start">
            <Button
              type="submit"
              form={QUICK_CAPTURE_FORM_ID}
              variant="primary"
              isLoading={isQuickCaptureSubmitting}
              loadingLabel="Simpan pengeluaran"
              fullWidth
              className="sm:w-auto sm:min-w-56"
            >
              Simpan pengeluaran
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setQuickCaptureOpen(false)}
              disabled={isQuickCaptureSubmitting}
              fullWidth
              className="sm:w-auto"
            >
              Batal
            </Button>
          </div>
        }
      >
        <ExpenseForm
          onSuccess={() => {
            setIsQuickCaptureSubmitting(false);
            setQuickCaptureOpen(false);
            onExpenseCreated?.();
          }}
          onSubmittingChange={setIsQuickCaptureSubmitting}
          frequentExpenseCategories={frequentExpenseCategories}
          showHeader={false}
          actionPlacement="external"
          formId={QUICK_CAPTURE_FORM_ID}
        />
      </Dialog>

      {/* 3. Mobile Action Buttons */}
      <div className="grid grid-cols-2 gap-2 sm:hidden">
        <Button
          type="button"
          variant="primary"
          onClick={() => setQuickCaptureOpen(true)}
          className="w-full justify-center"
        >
          <PlusCircle className="size-4" aria-hidden="true" />
          Tambah pengeluaran
        </Button>
        <Link
          href="/income/add"
          className="ui-button w-full justify-center whitespace-nowrap"
          data-variant="secondary"
        >
          Tambah pendapatan
        </Link>
      </div>

      {/* 4. Mobile Recent Transactions preview (top 3 for fast glance) */}
      <div className="min-w-0 lg:hidden">
        <RecentTransactions
          transactions={safeExpenses}
          requestStatus={requestState.expenses}
          filtersAreActive={filtersAreActive}
          onSelect={onSelectExpense}
          onEdit={onEditExpense}
          onDelete={onDeleteExpense}
        />
      </div>

      {/* 5. Non-blocking Profile Prompt */}
      {showProfilePrompt ? (
        <div className="min-w-0">
          <ProfileCompletionPrompt
            onDismiss={onDismissProfilePrompt}
            onSave={onCompleteProfile}
          />
        </div>
      ) : null}

      {/* 6. Responsive Workbench Layout: Desktop 2-column (Ledger + Workbench Analytics) */}
      <div className="grid min-w-0 grid-cols-1 gap-5 lg:grid-cols-12 lg:gap-6">
        {/* Left Column: Ledger (Filters + Transaction Section) */}
        <div className="order-2 flex min-w-0 flex-col gap-4 lg:order-1 lg:col-span-7 xl:col-span-8">
          <DashboardFilters
            categories={categories}
            filters={filters}
            availableExpensePeriods={availableExpensePeriods}
            hasActiveFilters={filtersAreActive}
            onFilterChange={onFilterChange}
            onReset={resetFilters}
          />

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

        {/* Right Column: Workbench Analytics (Category Budgets + Spending Insights) */}
        <div className="order-1 flex min-w-0 flex-col gap-4 lg:order-2 lg:col-span-5 xl:col-span-4">
          <CategoryBudgetSection
            currentPeriod={currentAllowancePeriod}
            expenseCategories={safeExpenses.map((expense) => expense.category).filter(Boolean)}
            userId={userId}
          />

          <SpendingInsights insights={spendingInsights} />
        </div>
      </div>
    </div>
  );
}
