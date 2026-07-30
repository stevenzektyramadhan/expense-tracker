"use client";

import Image from "next/image";
import { Maximize2 } from "lucide-react";

import CurrencyAmount from "@/components/finance/CurrencyAmount";
import Button from "@/components/ui/Button";
import Dialog from "@/components/ui/Dialog";
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

export default function ExpenseDetailModal({
  expense,
  labels = fallbackLabels,
  onClose,
  onEdit,
  onDelete,
  onZoom,
}) {
  const copy = { ...fallbackLabels, ...labels };

  if (!expense) return null;

  return (
    <Dialog
      open
      onClose={onClose}
      size="lg"
      title={copy.title}
      closeLabel={copy.close}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            {copy.close}
          </Button>
          {onEdit ? (
            <Button variant="secondary" onClick={() => onEdit(expense)}>
              {copy.edit}
            </Button>
          ) : null}
          {onDelete ? (
            <Button variant="destructive" onClick={() => onDelete(expense.id)}>
              {copy.delete}
            </Button>
          ) : null}
        </>
      }
    >
          <dl className="grid min-w-0 gap-5 sm:grid-cols-2">
            <div className="min-w-0 sm:col-span-2">
              <dt className="text-sm font-medium text-[var(--color-text-muted)]">
                {copy.description}
              </dt>
              <dd className="mt-1 break-words text-base font-semibold">
                {expense.description?.trim() || copy.noDescription}
              </dd>
            </div>
            <div className="min-w-0">
              <dt className="text-sm font-medium text-[var(--color-text-muted)]">
                {copy.category}
              </dt>
              <dd className="mt-1 break-words font-semibold">{expense.category}</dd>
            </div>
            <div className="min-w-0">
              <dt className="text-sm font-medium text-[var(--color-text-muted)]">
                {copy.date}
              </dt>
              <dd className="mt-1 font-semibold">
                <time dateTime={expense.date}>{formatDate(expense.date)}</time>
              </dd>
            </div>
            <div className="min-w-0 sm:col-span-2">
              <dt className="text-sm font-medium text-[var(--color-text-muted)]">
                {copy.amount}
              </dt>
              <dd className="mt-1 break-words">
                <CurrencyAmount
                  amount={expense.amount}
                  tone="expense"
                  showSign
                  className="text-2xl font-bold"
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
                <span className="relative block h-72 w-full">
                  <Image
                    src={expense.receipt_url}
                    alt="Bukti struk pengeluaran"
                    fill
                    sizes="(max-width: 768px) 90vw, 640px"
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
    </Dialog>
  );
}
