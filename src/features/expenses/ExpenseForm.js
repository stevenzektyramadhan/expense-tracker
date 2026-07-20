"use client";

// Hallmark · unified expense form · genre: authenticated utility · theme: Calm Ledger
import { ChevronDown, FileText, LoaderCircle } from "lucide-react";
import Button from "@/components/ui/Button";
import FormField from "@/components/ui/FormField";
import StatusBanner from "@/components/ui/StatusBanner";
import CategoryPicker from "@/features/expenses/CategoryPicker";
import ExpenseAmountField from "@/features/expenses/ExpenseAmountField";
import ReceiptUploader from "@/features/expenses/ReceiptUploader";
import useExpenseForm from "@/features/expenses/useExpenseForm";

const PHASE_MESSAGES = {
  compressing: "Mengompres foto struk…",
  uploading: "Mengunggah struk…",
  creating: "Menyimpan pengeluaran…",
};

export default function ExpenseForm() {
  const {
    amountRef,
    categoryRef,
    compressionWarning,
    dateRef,
    detailsOpen,
    fieldErrors,
    handleAmountChange,
    handleCancel,
    handleCategoryChoiceChange,
    handleCustomCategoryChange,
    handleDateChange,
    handleDescriptionChange,
    handleReceiptRemove,
    handleReceiptSelect,
    handleSubmit,
    isSubmitting,
    receipt,
    receiptPreviewUrl,
    requestError,
    setDetailsOpen,
    submitPhase,
    values,
  } = useExpenseForm();
  const phaseMessage = PHASE_MESSAGES[submitPhase] || "";

  return (
    <div className="mx-auto w-full max-w-3xl px-4 sm:px-0">
      <header className="mb-5 min-w-0">
        <h1 className="min-w-0 font-[family-name:var(--font-display-family)] text-2xl font-bold tracking-[-0.025em] text-[var(--color-text)] [overflow-wrap:anywhere]">
          Tambah pengeluaran
        </h1>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">
          Catat jumlah dan kategori terlebih dahulu. Detail lain dapat ditambahkan jika diperlukan.
        </p>
      </header>

      <form
        onSubmit={handleSubmit}
        noValidate
        className="group/expense-form space-y-4"
        aria-describedby={requestError ? "expense-request-error" : undefined}
      >
        <ExpenseAmountField
          inputRef={amountRef}
          value={values.amount}
          onChange={handleAmountChange}
          error={fieldErrors.amount}
          disabled={isSubmitting}
        />

        <CategoryPicker
          category={values.category}
          categoryRef={categoryRef}
          onChoiceChange={handleCategoryChoiceChange}
          onCustomChange={handleCustomCategoryChange}
          error={fieldErrors.category}
          disabled={isSubmitting}
        />

        <details
          open={detailsOpen}
          onToggle={(event) => setDetailsOpen(event.currentTarget.open)}
          className="group rounded-[var(--radius-surface)] border border-[var(--color-border)] bg-[var(--color-surface)]"
        >
          <summary className="flex min-h-11 cursor-pointer list-none items-center gap-3 rounded-[var(--radius-surface)] px-4 py-3 text-left font-semibold text-[var(--color-text)] transition-colors duration-[var(--motion-standard)] marker:content-none hover:bg-[var(--color-surface-subtle)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)] active:bg-[var(--color-primary-soft)] sm:px-5 [&::-webkit-details-marker]:hidden">
            <span className="grid size-9 shrink-0 place-items-center rounded-[var(--radius-control)] bg-[var(--color-surface-subtle)] text-[var(--color-primary-strong)]">
              <FileText className="size-4" aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block">Detail tambahan</span>
              <span className="block text-sm font-normal text-[var(--color-text-muted)]">
                Tanggal, deskripsi, dan struk
              </span>
            </span>
            <ChevronDown
              className="size-5 shrink-0 transition-transform duration-[var(--motion-standard)] group-open:rotate-180 motion-reduce:transition-none"
              aria-hidden="true"
            />
          </summary>

          <div className="space-y-4 border-t border-[var(--color-border)] px-4 py-4 sm:px-5 sm:py-5">
            <FormField
              id="expense-date"
              label="Tanggal"
              required
              error={fieldErrors.date}
              helperText="Tanggal hari ini dipilih secara otomatis."
            >
              <input
                ref={dateRef}
                type="date"
                name="date"
                value={values.date}
                onChange={handleDateChange}
                disabled={isSubmitting}
                className="scroll-mb-48"
              />
            </FormField>

            <FormField
              id="expense-description"
              label="Deskripsi"
              helperText="Opsional. Tambahkan keterangan yang membantu Anda mengingat transaksi."
            >
              <textarea
                name="description"
                value={values.description}
                onChange={handleDescriptionChange}
                disabled={isSubmitting}
                rows={3}
                placeholder="Contoh: makan siang bersama tim"
                className="scroll-mb-48"
              />
            </FormField>

            <div className="border-t border-[var(--color-border)] pt-4">
              <ReceiptUploader
                receipt={receipt}
                previewUrl={receiptPreviewUrl}
                onSelect={handleReceiptSelect}
                onRemove={handleReceiptRemove}
                error={fieldErrors.receipt}
                compressionWarning={compressionWarning}
                disabled={isSubmitting}
              />
            </div>
          </div>
        </details>

        {requestError ? (
          <StatusBanner
            id="expense-request-error"
            tone="error"
            title={requestError.title}
          >
            <p>{requestError.message}</p>
            <p className="mt-1">
              Periksa data Anda, lalu tekan Simpan pengeluaran untuk mencoba kembali.
            </p>
          </StatusBanner>
        ) : null}

        <div
          className="sticky z-[var(--z-sticky)] -mx-4 border-t border-[var(--color-border)] bg-[var(--color-surface-raised)] px-4 py-3 group-focus-within/expense-form:static md:static md:mx-0 md:rounded-[var(--radius-surface)] md:border md:shadow-[var(--elevation-1)]"
          style={{
            bottom:
              "calc(var(--mobile-navigation-height, 4.5rem) + env(safe-area-inset-bottom, 0px))",
          }}
        >
          <div className="flex flex-col gap-2 sm:flex-row-reverse sm:justify-start">
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
              loadingLabel="Simpan pengeluaran"
              className="w-full sm:w-auto sm:min-w-56"
            >
              Simpan pengeluaran
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={handleCancel}
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              Batal
            </Button>
          </div>

          <p
            className="mt-2 flex min-h-5 items-center gap-2 text-sm text-[var(--color-text-muted)]"
            role="status"
            aria-live="polite"
          >
            {phaseMessage ? (
              <>
                <LoaderCircle
                  className="size-4 animate-spin motion-reduce:animate-none"
                  aria-hidden="true"
                />
                {phaseMessage}
              </>
            ) : (
              <span aria-hidden="true">&nbsp;</span>
            )}
          </p>
        </div>
      </form>
    </div>
  );
}
