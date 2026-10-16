"use client";

import { useMemo, useState } from "react";
import { Pencil, Plus, Trash2, WalletCards } from "lucide-react";

import CurrencyAmount from "@/components/finance/CurrencyAmount";
import Button from "@/components/ui/Button";
import Dialog, { ConfirmDialog } from "@/components/ui/Dialog";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";
import FormField from "@/components/ui/FormField";
import Skeleton from "@/components/ui/Skeleton";
import useBudgetReminders from "@/hooks/useBudgetReminders";
import { DEFAULT_EXPENSE_CATEGORIES } from "@/lib/finance";
import {
  getBudgetStatusLabel,
  getBudgetStatusTone,
  mergeBudgetCategories,
} from "./categoryBudgetPresentation";
import useCategoryBudgets from "./useCategoryBudgets";

const getPeriodLabel = ({ month, year }) =>
  new Date(year, month - 1, 1).toLocaleDateString("id-ID", {
    month: "long",
    year: "numeric",
  });

function BudgetForm({ budget, categories, errorMessage, isSaving, onClose, onSave }) {
  const [category, setCategory] = useState(budget?.category || categories[0] || "");
  const [amount, setAmount] = useState(budget ? String(budget.amount) : "");
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    const numericAmount = Number(amount);

    if (!category) {
      setError("Kategori wajib dipilih.");
      return;
    }

    if (!Number.isInteger(numericAmount) || numericAmount <= 0) {
      setError("Batas anggaran harus berupa angka bulat lebih dari 0.");
      return;
    }

    setError("");
    try {
      await onSave({ category, amount: numericAmount });
      onClose();
    } catch {
      return;
    }
  };

  return (
    <form className="grid min-w-0 gap-3" onSubmit={handleSubmit}>
      <FormField label="Kategori" error={errorMessage || (error && !category ? error : "")} required>
        <select value={category} onChange={(event) => setCategory(event.target.value)}>
          {categories.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </FormField>
      <FormField
        label="Batas per bulan"
        error={errorMessage || (error && category ? error : "")}
        helperText="Masukkan angka rupiah tanpa titik atau simbol."
        required
      >
        <input
          type="number"
          min="1"
          step="1"
          inputMode="numeric"
          value={amount}
          onChange={(event) => {
            setAmount(event.target.value);
            if (error) setError("");
          }}
          placeholder="Contoh: 500000"
        />
      </FormField>
      <div className="flex flex-wrap justify-end gap-2">
        <Button type="button" variant="quiet" onClick={onClose} disabled={isSaving}>
          Batal
        </Button>
        <Button type="submit" isLoading={isSaving} loadingLabel="Menyimpan…">
          Simpan batas
        </Button>
      </div>
    </form>
  );
}

function BudgetRow({ budget, disabled, onDelete, onEdit }) {
  const statusLabel = getBudgetStatusLabel(budget.status);
  const tone = getBudgetStatusTone(budget.status);
  const toneClass =
    tone === "expense"
      ? "bg-[var(--color-expense-soft)] text-[var(--color-expense-strong)]"
      : tone === "warning"
        ? "bg-[var(--color-warning-soft)] text-[var(--color-warning-strong)]"
        : tone === "limit_reached"
          ? "bg-[var(--color-primary-soft)] text-[var(--color-primary-strong)]"
          : "bg-[var(--color-income-soft)] text-[var(--color-income-strong)]";

  const isOver = budget.remaining < 0;
  const progressFill = isOver
    ? "bg-[var(--color-expense)]"
    : tone === "warning"
      ? "bg-[var(--color-warning)]"
      : "bg-[var(--color-primary)]";

  const spentPercent =
    budget.amount > 0
      ? Math.min(Math.max(Math.round((budget.spent / budget.amount) * 100), 0), 100)
      : 0;

  return (
    <li className="min-w-0 rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-surface)] p-3.5 transition-colors hover:border-[var(--color-border-strong)]">
      <div className="flex min-w-0 items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <p className="truncate text-sm font-bold text-[var(--color-text)]">
            {budget.category}
          </p>
          <span
            className={`inline-flex shrink-0 items-center rounded-[var(--radius-pill)] px-2 py-0.5 text-[0.6875rem] font-semibold ${toneClass}`}
          >
            {statusLabel}
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <Button
            size="icon"
            variant="quiet"
            disabled={disabled}
            onClick={() => onEdit(budget)}
            aria-label={`Edit anggaran ${budget.category}`}
          >
            <Pencil className="size-3.5" aria-hidden="true" />
          </Button>
          <Button
            size="icon"
            variant="quiet"
            disabled={disabled}
            onClick={() => onDelete(budget)}
            aria-label={`Hapus anggaran ${budget.category}`}
          >
            <Trash2 className="size-3.5" aria-hidden="true" />
          </Button>
        </div>
      </div>

      <div className="mt-2.5">
        <div className="h-1.5 w-full overflow-hidden rounded-[var(--radius-pill)] bg-[var(--color-surface-subtle)]">
          <div
            className={`h-full rounded-[var(--radius-pill)] transition-all duration-300 ${progressFill}`}
            style={{ width: `${spentPercent}%` }}
          />
        </div>
      </div>

      <div className="mt-2.5 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-xs">
        <div className="text-[var(--color-text-muted)]">
          <span>Terpakai </span>
          <CurrencyAmount
            amount={budget.spent}
            tone="expense"
            showSign={false}
            className="font-bold text-[var(--color-text)]"
          />
          <span> dari </span>
          <CurrencyAmount
            amount={budget.amount}
            showSign={false}
            className="font-semibold text-[var(--color-text-muted)]"
          />
        </div>

        <div className="text-right">
          <span className="text-[var(--color-text-muted)]">Sisa: </span>
          <CurrencyAmount
            amount={budget.remaining}
            tone={isOver ? "expense" : "neutral"}
            showSign={false}
            className={`font-bold ${isOver ? "text-[var(--color-expense-strong)]" : "text-[var(--color-text)]"}`}
          />
        </div>
      </div>
    </li>
  );
}

export default function CategoryBudgetSection({ currentPeriod, expenseCategories = [], userId }) {
  const {
    budgets,
    deleteBudget,
    isMutating,
    mutationError,
    loadBudgets,
    request,
    saveBudget,
  } = useCategoryBudgets({ ...currentPeriod, userId });
  const [formBudget, setFormBudget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteError, setDeleteError] = useState("");
  const categories = useMemo(
    () => mergeBudgetCategories(DEFAULT_EXPENSE_CATEGORIES, expenseCategories, budgets),
    [budgets, expenseCategories],
  );
  const visibleBudgets = Array.isArray(budgets) ? budgets : [];
  const periodLabel = getPeriodLabel(currentPeriod);
  const {
    enable: enableReminders,
    isEnabling: isEnablingReminders,
    isSupported: remindersSupported,
    optedIn: remindersOptedIn,
    permission: reminderPermission,
    stop: stopReminders,
  } = useBudgetReminders({
    budgets: visibleBudgets,
    month: currentPeriod.month,
    requestStatus: request.status,
    userId,
    year: currentPeriod.year,
  });

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteError("");
    try {
      await deleteBudget(deleteTarget.id);
      setDeleteTarget(null);
    } catch (error) {
      setDeleteError(error.message);
    }
  };

  return (
    <>
      <section className="min-w-0 rounded-[var(--radius-surface)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-[var(--elevation-1)] sm:p-5" aria-labelledby="category-budgets-title">
        <div className="flex min-w-0 flex-wrap items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-[var(--radius-control)] bg-[var(--color-primary-soft)] text-[var(--color-primary-strong)]">
              <WalletCards className="size-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <h2 id="category-budgets-title" className="font-[family-name:var(--font-display-family)] text-base font-bold">
                Batas anggaran kategori
              </h2>
              <p className="text-sm text-[var(--color-text-muted)]">Pantau pengeluaran untuk {periodLabel}.</p>
            </div>
          </div>
          <Button size="compact" disabled={isMutating} onClick={() => setFormBudget({})}>
            <Plus className="size-4" aria-hidden="true" />
            Tambah batas
          </Button>
        </div>

        {request.status === "success" ? (
          <div className="mt-4 rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-surface-subtle)] p-3" aria-live="polite">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold">Pengingat batas di perangkat ini</p>
                <p className="mt-1 max-w-2xl text-sm text-[var(--color-text-muted)]">
                  {remindersOptedIn
                    ? "Pengingat aktif saat kiteCatat terbuka di perangkat ini. Pengingat tidak dijadwalkan dan tidak dijamin muncul setelah aplikasi ditutup."
                    : "Aktifkan pengingat lokal untuk melihat notifikasi saat batas kategori berubah menjadi perlu diperhatikan, tercapai, atau terlewati."}
                </p>
              </div>
              {remindersOptedIn ? (
                <Button type="button" size="compact" variant="quiet" onClick={stopReminders}>
                  Hentikan pengingat
                </Button>
              ) : (
                <Button
                  type="button"
                  size="compact"
                  variant="secondary"
                  disabled={!remindersSupported || reminderPermission === "denied"}
                  isLoading={isEnablingReminders}
                  loadingLabel="Mengaktifkan…"
                  onClick={enableReminders}
                >
                  Aktifkan pengingat
                </Button>
              )}
            </div>
            {!remindersSupported ? (
              <p className="mt-2 text-xs text-[var(--color-text-muted)]" role="status">
                Browser ini belum mendukung pengingat lokal.
              </p>
            ) : null}
            {reminderPermission === "denied" ? (
              <p className="mt-2 text-xs text-[var(--color-text-muted)]" role="status">
                Izin notifikasi ditolak di pengaturan browser. Kontrol ini tidak dapat mencabut izin browser.
              </p>
            ) : null}
          </div>
        ) : null}

        {request.status === "idle" || request.status === "loading" || !Array.isArray(budgets) ? (
          <div className="mt-4 grid gap-2" role="status" aria-label="Memuat anggaran kategori">
            {[0, 1].map((item) => <Skeleton key={item} height="5rem" />)}
          </div>
        ) : request.status === "error" ? (
          <ErrorState
            className="mt-3"
            title="Anggaran kategori tidak tersedia"
            description={request.error}
            action={<Button size="compact" variant="secondary" onClick={loadBudgets}>Coba lagi</Button>}
          />
        ) : visibleBudgets.length === 0 ? (
          <EmptyState
            className="mt-3"
            title="Belum ada batas kategori"
            description="Tambahkan batas agar pengeluaran bulan ini lebih mudah dipantau."
            action={<Button size="compact" variant="secondary" disabled={isMutating} onClick={() => setFormBudget({})}>Tambah batas pertama</Button>}
          />
        ) : (
          <>
            {mutationError ? <p className="mt-3 text-sm font-semibold text-[var(--color-expense-strong)]" role="alert">{mutationError}</p> : null}
            <ul className="mt-3 grid gap-2.5" aria-label={`Batas kategori ${periodLabel}`}>
              {visibleBudgets.map((budget) => <BudgetRow key={budget.id} budget={budget} disabled={isMutating} onDelete={setDeleteTarget} onEdit={setFormBudget} />)}
            </ul>
          </>
        )}
      </section>

      <Dialog open={Boolean(formBudget)} onClose={() => setFormBudget(null)} title={formBudget?.id ? "Edit batas kategori" : "Tambah batas kategori"} description={`Batas untuk ${periodLabel}.`}>
        <BudgetForm budget={formBudget?.id ? formBudget : null} categories={categories} errorMessage={mutationError} isSaving={isMutating} onClose={() => setFormBudget(null)} onSave={saveBudget} />
      </Dialog>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Hapus batas kategori?"
        description={deleteTarget ? `Batas ${deleteTarget.category} untuk ${periodLabel} akan dihapus.` : ""}
        confirmLabel="Hapus batas"
        loadingLabel="Menghapus…"
        isLoading={isMutating}
        error={deleteError || mutationError}
        onClose={() => {
          if (!isMutating) {
            setDeleteTarget(null);
            setDeleteError("");
          }
        }}
        onConfirm={handleDelete}
      />
    </>
  );
}
