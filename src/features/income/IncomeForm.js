"use client";

/* Hallmark · component: IncomeForm · genre: modern-minimal · theme: Calm Ledger
 * states: default · hover · focus · active · disabled · loading · error · success
 * contrast: shared semantic tokens · macrostructure: component-scope
 */
import { useId, useRef, useState } from "react";

import Button from "@/components/ui/Button";
import FormField from "@/components/ui/FormField";
import StatusBanner from "@/components/ui/StatusBanner";
import { formatRupiah, parseRupiah } from "@/lib/utils";

const AUTHENTICATION_MESSAGE =
  "Sesi Anda berakhir. Masuk kembali lalu coba lagi.";
const SPENT_BALANCE_MESSAGE =
  "Pendapatan tidak dapat diubah karena saldo sudah terpakai.";

export function getIncomeRequestError({
  fallback,
  message = "",
  status,
}) {
  if (
    status === 401 ||
    /sesi anda berakhir|sesi login|login ulang|unauthorized|jwt|token/i.test(
      message,
    )
  ) {
    return new Error(AUTHENTICATION_MESSAGE);
  }

  if (/saldo sudah terpakai/i.test(message)) {
    return new Error(SPENT_BALANCE_MESSAGE);
  }

  if (status === 404) {
    return new Error("Pendapatan tidak ditemukan atau tidak lagi tersedia.");
  }

  if (message === fallback) {
    return new Error(fallback);
  }

  return new Error(fallback);
}

function createInitialValues(initialValues) {
  return {
    amount: initialValues?.amount ?? "",
    source: initialValues?.source ?? "",
    note: initialValues?.note ?? "",
    date: initialValues?.date ?? "",
  };
}

export default function IncomeForm({
  context = "page",
  initialValues,
  isSubmitting = false,
  mode = "add",
  onCancel,
  onSubmit,
}) {
  const generatedId = useId().replaceAll(":", "");
  const [values, setValues] = useState(() =>
    createInitialValues(initialValues),
  );
  const [fieldErrors, setFieldErrors] = useState({});
  const [requestError, setRequestError] = useState("");
  const amountRef = useRef(null);
  const dateRef = useRef(null);
  const submissionLockRef = useRef(false);

  const updateValue = (name, value) => {
    setValues((current) => ({ ...current, [name]: value }));
    setFieldErrors((current) => ({ ...current, [name]: undefined }));
    setRequestError("");
  };

  const handleAmountChange = (event) => {
    const amount = parseRupiah(event.target.value);
    updateValue("amount", amount || "");
  };

  const validate = () => {
    const errors = {};
    const amount = Number(values.amount);

    if (!Number.isFinite(amount) || amount <= 0) {
      errors.amount = "Masukkan jumlah pendapatan lebih dari Rp 0.";
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(values.date)) {
      errors.date = "Pilih tanggal pendapatan.";
    }

    setFieldErrors(errors);

    if (errors.amount) {
      amountRef.current?.focus();
    } else if (errors.date) {
      dateRef.current?.focus();
    }

    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (submissionLockRef.current || isSubmitting) return;

    setRequestError("");
    if (!validate()) return;

    submissionLockRef.current = true;

    try {
      await onSubmit({
        amount: Number(values.amount),
        source: values.source,
        note: values.note,
        date: values.date,
      });
    } catch (error) {
      setRequestError(
        error instanceof Error && error.message
          ? error.message
          : mode === "edit"
            ? "Pendapatan belum dapat diperbarui. Coba lagi."
            : "Pendapatan belum dapat disimpan. Coba lagi.",
      );
    } finally {
      submissionLockRef.current = false;
    }
  };

  const isDialog = context === "dialog";
  const actionClasses = isDialog
    ? "sticky bottom-0 z-[var(--z-raised)] -mx-5 border-t border-[var(--color-border)] bg-[var(--color-surface-raised)] px-5 pt-3 sm:-mx-6 sm:px-6"
    : "sticky z-[var(--z-sticky)] -mx-4 border-t border-[var(--color-border)] bg-[var(--color-surface-raised)] px-4 py-3 group-focus-within/income-form:static md:static md:mx-0 md:rounded-[var(--radius-surface)] md:border md:shadow-[var(--elevation-1)]";

  return (
    <form
      className="group/income-form min-w-0 space-y-4"
      onSubmit={handleSubmit}
      noValidate
      aria-describedby={requestError ? `${generatedId}-request-error` : undefined}
    >
      <section className="min-w-0 rounded-[var(--radius-prominent)] border border-[var(--color-border)] bg-[var(--color-income-soft)] p-4 shadow-[var(--elevation-1)] sm:p-5">
        <FormField
          id={`${generatedId}-amount`}
          label="Jumlah pendapatan"
          helperText="Masukkan nominal yang menambah uang saku."
          error={fieldErrors.amount}
          required
          disabled={isSubmitting}
        >
          <input
            ref={amountRef}
            type="text"
            name="amount"
            value={formatRupiah(values.amount)}
            onChange={handleAmountChange}
            inputMode="numeric"
            enterKeyHint="next"
            autoComplete="off"
            placeholder="Rp 0"
            className="min-h-16 scroll-mb-48 bg-[var(--color-surface)] px-4 font-[family-name:var(--font-display-family)] text-[clamp(2rem,9vw,3rem)] font-bold leading-none tracking-[-0.04em] [font-feature-settings:'tnum'_1,'lnum'_1] [font-variant-numeric:tabular-nums_lining-nums]"
          />
        </FormField>
      </section>

      <section className="grid min-w-0 gap-4 rounded-[var(--radius-surface)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 sm:grid-cols-2 sm:p-5">
        <FormField
          id={`${generatedId}-source`}
          label="Sumber"
          helperText="Opsional. Contoh: orang tua atau pekerjaan sampingan."
          disabled={isSubmitting}
        >
          <input
            type="text"
            name="source"
            value={values.source}
            onChange={(event) => updateValue("source", event.target.value)}
            autoComplete="off"
            placeholder="Contoh: Orang tua"
            className="scroll-mb-48"
          />
        </FormField>

        <FormField
          id={`${generatedId}-date`}
          label="Tanggal"
          helperText="Tanggal menentukan periode uang saku yang disesuaikan."
          error={fieldErrors.date}
          required
          disabled={isSubmitting}
        >
          <input
            ref={dateRef}
            type="date"
            name="date"
            value={values.date}
            onChange={(event) => updateValue("date", event.target.value)}
            className="scroll-mb-48"
          />
        </FormField>

        <FormField
          id={`${generatedId}-note`}
          label="Catatan"
          helperText="Opsional. Tambahkan konteks yang membantu saat meninjau riwayat."
          disabled={isSubmitting}
          className="sm:col-span-2"
        >
          <textarea
            name="note"
            value={values.note}
            onChange={(event) => updateValue("note", event.target.value)}
            rows={3}
            placeholder="Contoh: tambahan uang transport"
            className="scroll-mb-48"
          />
        </FormField>
      </section>

      {requestError ? (
        <StatusBanner
          id={`${generatedId}-request-error`}
          tone="error"
          title={
            mode === "edit"
              ? "Pendapatan belum diperbarui"
              : "Pendapatan belum disimpan"
          }
        >
          <p>{requestError}</p>
        </StatusBanner>
      ) : null}

      <div
        className={actionClasses}
        style={
          isDialog
            ? {
                paddingBottom:
                  "max(var(--space-sm), env(safe-area-inset-bottom, 0px))",
              }
            : {
                bottom:
                  "calc(var(--mobile-navigation-height, 4.5rem) + env(safe-area-inset-bottom, 0px))",
              }
        }
      >
        <div className="flex flex-col gap-2 sm:flex-row-reverse sm:justify-start">
          <Button
            type="submit"
            isLoading={isSubmitting}
            loadingLabel="Menyimpan…"
            className="w-full sm:w-auto sm:min-w-48"
          >
            {mode === "edit" ? "Simpan perubahan" : "Simpan pendapatan"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={isSubmitting}
            className="w-full sm:w-auto"
          >
            Batal
          </Button>
        </div>
      </div>
    </form>
  );
}
