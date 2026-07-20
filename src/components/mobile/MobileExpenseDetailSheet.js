"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { Maximize2, X } from "lucide-react";

import CurrencyAmount from "@/components/finance/CurrencyAmount";
import Button from "@/components/ui/Button";
import { formatDate } from "@/lib/utils";

const wrappingAmountStyle = {
  overflowWrap: "anywhere",
  whiteSpace: "normal",
};

const fallbackLabels = {
  title: "Detail pengeluaran",
  description: "Deskripsi",
  category: "Kategori",
  date: "Tanggal",
  amount: "Jumlah",
  receipt: "Struk",
  noDescription: "Tanpa deskripsi",
  noReceipt: "Tidak ada foto struk",
  zoom: "Perbesar struk",
  edit: "Edit",
  delete: "Hapus",
  close: "Tutup",
};

export default function MobileExpenseDetailSheet({
  expense,
  labels = fallbackLabels,
  onClose,
  onEdit,
  onDelete,
  onZoom,
}) {
  const dialogRef = useRef(null);
  const closeButtonRef = useRef(null);
  const copy = { ...fallbackLabels, ...labels };

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return undefined;

    if (!dialog.open) dialog.showModal();
    closeButtonRef.current?.focus();

    return () => {
      if (dialog.open) dialog.close();
    };
  }, []);

  if (!expense) return null;

  return (
    <dialog
      ref={dialogRef}
      className="fixed inset-x-0 bottom-0 top-auto z-[var(--z-modal)] m-0 w-full max-w-none overflow-visible border-0 bg-transparent p-0 text-[var(--color-text)] backdrop:bg-[var(--color-text)]/60"
      aria-labelledby="mobile-expense-detail-title"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <article
        className="mx-auto flex min-h-0 w-full max-w-md flex-col overflow-hidden rounded-t-[var(--radius-prominent)] border border-b-0 border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--elevation-2)]"
        style={{
          maxHeight:
            "calc(100dvh - env(safe-area-inset-top, 0px) - var(--space-sm))",
        }}
        onClick={(event) => event.stopPropagation()}
      >
        <header className="flex shrink-0 items-center justify-between gap-4 border-b border-[var(--color-border)] px-5 py-4">
          <h2
            id="mobile-expense-detail-title"
            className="font-[family-name:var(--font-display-family)] text-lg font-bold"
          >
            {copy.title}
          </h2>
          <Button
            ref={closeButtonRef}
            size="icon"
            variant="quiet"
            onClick={onClose}
            aria-label={copy.close}
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </Button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5">
          <dl className="grid min-w-0 gap-4">
            <div className="min-w-0">
              <dt className="text-sm font-medium text-[var(--color-text-muted)]">
                {copy.description}
              </dt>
              <dd className="mt-1 break-words font-semibold">
                {expense.description?.trim() || copy.noDescription}
              </dd>
            </div>
            <div className="flex min-w-0 items-start justify-between gap-4">
              <dt className="shrink-0 text-sm font-medium text-[var(--color-text-muted)]">
                {copy.category}
              </dt>
              <dd className="min-w-0 break-words text-right font-semibold">
                {expense.category}
              </dd>
            </div>
            <div className="flex min-w-0 items-start justify-between gap-4">
              <dt className="shrink-0 text-sm font-medium text-[var(--color-text-muted)]">
                {copy.date}
              </dt>
              <dd className="text-right font-semibold">
                <time dateTime={expense.date}>{formatDate(expense.date)}</time>
              </dd>
            </div>
            <div className="flex min-w-0 items-start justify-between gap-4">
              <dt className="shrink-0 text-sm font-medium text-[var(--color-text-muted)]">
                {copy.amount}
              </dt>
              <dd className="min-w-0 break-words text-right">
                <CurrencyAmount
                  amount={expense.amount}
                  tone="expense"
                  showSign
                  className="text-xl font-bold"
                  style={wrappingAmountStyle}
                />
              </dd>
            </div>
          </dl>

          <div className="mt-6">
            <p className="mb-2 text-sm font-medium text-[var(--color-text-muted)]">
              {copy.receipt}
            </p>
            {expense.receipt_url ? (
              <button
                type="button"
                onClick={() => onZoom?.(expense.receipt_url)}
                className="group relative block min-h-44 w-full overflow-hidden rounded-[var(--radius-surface)] border border-[var(--color-border)] bg-[var(--color-surface-subtle)] outline-none hover:border-[var(--color-primary-strong)] focus-visible:outline-[var(--focus-ring-width)] focus-visible:outline-offset-[var(--focus-ring-offset)] focus-visible:outline-[var(--color-focus)] active:bg-[var(--color-primary-soft)] disabled:cursor-not-allowed disabled:opacity-55"
                aria-label={copy.zoom}
              >
                <span className="relative block h-48 w-full">
                  <Image
                    src={expense.receipt_url}
                    alt="Bukti struk pengeluaran"
                    fill
                    sizes="(max-width: 448px) 100vw, 448px"
                    className="object-contain"
                  />
                </span>
                <span className="absolute bottom-3 right-3 inline-flex min-h-11 items-center gap-2 rounded-full bg-[var(--color-text)] px-4 text-sm font-semibold text-[var(--color-surface)]">
                  <Maximize2 className="h-4 w-4" aria-hidden="true" />
                  {copy.zoom}
                </span>
              </button>
            ) : (
              <div className="rounded-[var(--radius-surface)] border border-dashed border-[var(--color-border-strong)] bg-[var(--color-surface-subtle)] px-4 py-8 text-center text-sm text-[var(--color-text-muted)]">
                {copy.noReceipt}
              </div>
            )}
          </div>
        </div>

        <footer
          className="shrink-0 border-t border-[var(--color-border)] bg-[var(--color-surface)] px-5 pt-4"
          style={{
            paddingBottom:
              "calc(var(--space-lg) + env(safe-area-inset-bottom, 0px))",
          }}
        >
          <div className="grid grid-cols-2 gap-2">
            {onEdit ? (
              <Button fullWidth variant="secondary" onClick={() => onEdit(expense)}>
                {copy.edit}
              </Button>
            ) : null}
            {onDelete ? (
              <Button
                fullWidth
                variant="destructive"
                onClick={() => onDelete(expense.id)}
              >
                {copy.delete}
              </Button>
            ) : null}
            <Button
              className="col-span-2"
              fullWidth
              variant="quiet"
              onClick={onClose}
            >
              {copy.close}
            </Button>
          </div>
        </footer>
      </article>
    </dialog>
  );
}
