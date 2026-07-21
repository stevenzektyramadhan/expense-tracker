"use client";

/* Hallmark · pre-emit critique: P5 H5 E4 S5 R5 V5
 * Hallmark · genre: modern-minimal · macrostructure: Stat-Led · design-system: Calm Ledger · designed-as-app
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { PlusCircle, X } from "lucide-react";
import Swal from "sweetalert2";

import CurrencyAmount from "@/components/finance/CurrencyAmount";
import Button from "@/components/ui/Button";
import ErrorState from "@/components/ui/ErrorState";
import FormField from "@/components/ui/FormField";
import Skeleton from "@/components/ui/Skeleton";
import StatusBanner from "@/components/ui/StatusBanner";
import IncomeForm, {
  getIncomeRequestError,
} from "@/features/income/IncomeForm";
import IncomeList from "@/features/income/IncomeList";
import { authenticatedFetch } from "@/lib/authenticatedFetch";
import { formatCurrency, formatDateForInput } from "@/lib/utils";

const MONTH_OPTIONS = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

const getCurrentMonth = () => new Date().getMonth() + 1;
const getCurrentYear = () => new Date().getFullYear();

function IncomeEditDialog({
  income,
  isSubmitting,
  onClose,
  onSubmit,
}) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog?.open) dialog?.showModal();

    return () => {
      if (dialog?.open) dialog.close();
    };
  }, []);

  const requestClose = () => {
    if (!isSubmitting) onClose();
  };

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="edit-income-title"
      aria-describedby="edit-income-description"
      onCancel={(event) => {
        event.preventDefault();
        requestClose();
      }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) requestClose();
      }}
      className="fixed inset-0 m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-2xl overflow-hidden rounded-[var(--radius-prominent)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-0 text-[var(--color-text)] shadow-[var(--elevation-2)] [&::backdrop]:bg-[var(--color-text)]/60"
    >
      <div className="flex max-h-[calc(100dvh-2rem)] min-h-0 flex-col">
        <header className="flex min-w-0 shrink-0 items-start gap-3 border-b border-[var(--color-border)] bg-[var(--color-surface-raised)] px-5 py-4 sm:px-6">
          <div className="min-w-0 flex-1">
            <h2
              id="edit-income-title"
              className="min-w-0 font-[family-name:var(--font-display-family)] text-xl font-bold tracking-[-0.02em] [overflow-wrap:anywhere]"
            >
              Edit pendapatan
            </h2>
            <p
              id="edit-income-description"
              className="mt-1 text-sm text-[var(--color-text-muted)]"
            >
              Perubahan jumlah atau tanggal dapat menyesuaikan saldo periode
              terkait.
            </p>
          </div>
          <Button
            type="button"
            size="icon"
            variant="quiet"
            onClick={requestClose}
            disabled={isSubmitting}
            aria-label="Tutup dialog edit pendapatan"
          >
            <X className="size-5" aria-hidden="true" />
          </Button>
        </header>

        <div className="min-h-0 overflow-y-auto px-5 py-5 sm:px-6">
          <IncomeForm
            key={income.id}
            context="dialog"
            mode="edit"
            initialValues={{
              amount: income.amount,
              source: income.source || "",
              note: income.note || "",
              date: formatDateForInput(income.date),
            }}
            isSubmitting={isSubmitting}
            onSubmit={onSubmit}
            onCancel={requestClose}
          />
        </div>
      </div>
    </dialog>
  );
}

export default function IncomeListPage() {
  const [month, setMonth] = useState(getCurrentMonth);
  const [year, setYear] = useState(getCurrentYear);
  const [incomes, setIncomes] = useState([]);
  const [loadState, setLoadState] = useState({
    status: "loading",
    message: "",
  });
  const [actionError, setActionError] = useState("");
  const [editingIncome, setEditingIncome] = useState(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const activeRequestRef = useRef(null);

  const loadIncomes = useCallback(async () => {
    activeRequestRef.current?.abort();
    const controller = new AbortController();
    activeRequestRef.current = controller;
    setLoadState({ status: "loading", message: "" });

    try {
      const response = await authenticatedFetch(
        `/api/incomes?month=${month}&year=${year}`,
        { signal: controller.signal },
      );
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw getIncomeRequestError({
          status: response.status,
          message: payload.error,
          fallback: "Riwayat pendapatan belum dapat dimuat. Coba lagi.",
        });
      }

      if (controller.signal.aborted) return;

      setIncomes(Array.isArray(payload.data) ? payload.data : []);
      setLoadState({ status: "success", message: "" });
    } catch (error) {
      if (controller.signal.aborted || error?.name === "AbortError") return;

      const safeError = getIncomeRequestError({
        message: error instanceof Error ? error.message : "",
        fallback: "Riwayat pendapatan belum dapat dimuat. Coba lagi.",
      });
      setLoadState({ status: "error", message: safeError.message });
    } finally {
      if (activeRequestRef.current === controller) {
        activeRequestRef.current = null;
      }
    }
  }, [month, year]);

  useEffect(() => {
    loadIncomes();

    return () => {
      activeRequestRef.current?.abort();
    };
  }, [loadIncomes]);

  const years = useMemo(() => {
    const currentYear = getCurrentYear();
    return [currentYear - 1, currentYear, currentYear + 1];
  }, []);

  const totalIncome = useMemo(
    () =>
      incomes.reduce((total, income) => total + Number(income.amount || 0), 0),
    [incomes],
  );

  const handleEditSubmit = async (values) => {
    if (!editingIncome || isSavingEdit) return;

    setIsSavingEdit(true);

    try {
      const response = await authenticatedFetch(
        `/api/incomes/${editingIncome.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        },
      );
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw getIncomeRequestError({
          status: response.status,
          message: payload.error,
          fallback: "Pendapatan belum dapat diperbarui. Coba lagi.",
        });
      }

      setEditingIncome(null);
      await loadIncomes();
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleDelete = async (income) => {
    setActionError("");

    // Phase 6 compatibility: deletion remains consequential because the
    // server may reject it after the income has already been spent. The
    // legacy SweetAlert confirmation migrates in the dedicated dialog phase.
    const result = await Swal.fire({
      title: "Hapus pendapatan?",
      text: `Pendapatan ${formatCurrency(income.amount)} akan dihapus dan saldo akan disesuaikan.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "var(--color-expense)",
      cancelButtonColor: "var(--color-text-muted)",
      confirmButtonText: "Ya, hapus",
      cancelButtonText: "Batal",
    });

    if (!result.isConfirmed) return;

    try {
      const response = await authenticatedFetch(`/api/incomes/${income.id}`, {
        method: "DELETE",
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw getIncomeRequestError({
          status: response.status,
          message: payload.error,
          fallback: "Pendapatan belum dapat dihapus. Coba lagi.",
        });
      }

      setIncomes((current) =>
        current.filter((item) => item.id !== income.id),
      );
    } catch (error) {
      const safeError = getIncomeRequestError({
        message: error instanceof Error ? error.message : "",
        fallback: "Pendapatan belum dapat dihapus. Coba lagi.",
      });
      setActionError(safeError.message);
    }
  };

  const isLoading = loadState.status === "loading";
  const selectedPeriodLabel = `${MONTH_OPTIONS[month - 1]} ${year}`;

  return (
    <div className="mx-auto grid w-full max-w-5xl min-w-0 grid-cols-1 gap-5 px-4 sm:px-0 md:gap-6">
      <header className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="sr-only min-w-0 font-[family-name:var(--font-display-family)] text-2xl font-bold tracking-[-0.025em] [overflow-wrap:anywhere] md:not-sr-only">
            Pendapatan tambahan
          </h1>
          <p className="hidden max-w-2xl text-sm text-[var(--color-text-muted)] md:mt-1 md:block">
            Tinjau uang yang menambah saldo dan periode yang menerimanya.
          </p>
        </div>
        <Link
          href="/income/add"
          className="ui-button w-full sm:w-auto"
          data-variant="primary"
        >
          <PlusCircle className="size-5" aria-hidden="true" />
          Tambah pendapatan
        </Link>
      </header>

      <section
        className="grid min-w-0 gap-4 rounded-[var(--radius-prominent)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-[var(--elevation-1)] md:grid-cols-[minmax(0,1fr)_minmax(15rem,0.7fr)] md:items-end md:p-5"
        aria-labelledby="income-period-heading"
      >
        <div className="min-w-0">
          <h2
            id="income-period-heading"
            className="min-w-0 font-[family-name:var(--font-display-family)] text-lg font-bold [overflow-wrap:anywhere]"
          >
            Periode riwayat
          </h2>
          <div className="mt-3 grid min-w-0 grid-cols-2 gap-3">
            <FormField label="Bulan" id="income-month-filter">
              <select
                value={month}
                onChange={(event) => {
                  setMonth(Number(event.target.value));
                  setActionError("");
                }}
              >
                {MONTH_OPTIONS.map((monthName, index) => (
                  <option key={monthName} value={index + 1}>
                    {monthName}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="Tahun" id="income-year-filter">
              <select
                value={year}
                onChange={(event) => {
                  setYear(Number(event.target.value));
                  setActionError("");
                }}
              >
                {years.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </FormField>
          </div>
        </div>

        <div className="min-w-0 border-t border-[var(--color-border)] pt-4 md:border-l md:border-t-0 md:pb-5 md:pl-5 md:pt-0">
          <p className="text-sm text-[var(--color-text-muted)]">
            Total pendapatan · {selectedPeriodLabel}
          </p>
          {isLoading ? (
            <Skeleton
              className="mt-2"
              width="min(100%, 16rem)"
              height="2.25rem"
              label="Memuat total pendapatan"
            />
          ) : loadState.status === "success" ? (
            <CurrencyAmount
              amount={totalIncome}
              tone={totalIncome > 0 ? "income" : "neutral"}
              showSign={totalIncome > 0}
              className="mt-1 block min-w-0 font-[family-name:var(--font-display-family)] text-[clamp(1.75rem,7vw,2.5rem)] font-bold tracking-[-0.035em]"
              style={{ overflowWrap: "anywhere", whiteSpace: "normal" }}
            />
          ) : (
            <span
              className="mt-1 block text-3xl font-bold text-[var(--color-text-muted)]"
              aria-label="Total pendapatan tidak tersedia"
            >
              —
            </span>
          )}
        </div>
      </section>

      {loadState.status === "error" ? (
        <ErrorState
          title="Riwayat pendapatan belum dimuat"
          description={loadState.message}
          action={
            <Button onClick={loadIncomes} variant="secondary">
              Coba lagi
            </Button>
          }
        />
      ) : null}

      {actionError ? (
        <StatusBanner tone="error" title="Pendapatan belum dihapus">
          <p>{actionError}</p>
        </StatusBanner>
      ) : null}

      {loadState.status !== "error" ? (
        <section className="min-w-0" aria-labelledby="income-history-heading">
          <div className="mb-3 flex min-w-0 items-end justify-between gap-3">
            <div className="min-w-0">
              <h2
                id="income-history-heading"
                className="min-w-0 font-[family-name:var(--font-display-family)] text-lg font-bold [overflow-wrap:anywhere]"
              >
                Riwayat pendapatan
              </h2>
              <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                {loadState.status === "success"
                  ? `${incomes.length} catatan pada ${selectedPeriodLabel}`
                  : `Memuat catatan ${selectedPeriodLabel}`}
              </p>
            </div>
          </div>

          <IncomeList
            incomes={incomes}
            isLoading={isLoading}
            onEdit={(income) => {
              setActionError("");
              setEditingIncome(income);
            }}
            onDelete={handleDelete}
          />
        </section>
      ) : null}

      {editingIncome ? (
        <IncomeEditDialog
          income={editingIncome}
          isSubmitting={isSavingEdit}
          onClose={() => setEditingIncome(null)}
          onSubmit={handleEditSubmit}
        />
      ) : null}
    </div>
  );
}
