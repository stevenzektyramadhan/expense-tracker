"use client";

import Image from "next/image";
import { Maximize2 } from "lucide-react";
import CurrencyAmount from "@/components/finance/CurrencyAmount";
import { formatDate } from "@/lib/utils";

const wrappingAmountStyle = {
  overflowWrap: "anywhere",
  whiteSpace: "normal",
};

export const defaultExpenseDetailLabels = {
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

export default function ExpenseDetailContent({
  expense,
  copy = defaultExpenseDetailLabels,
  onZoom,
}) {
  if (!expense) return null;

  return (
    <div>
      <dl className="grid min-w-0 gap-4 sm:grid-cols-2 sm:gap-5">
        <div className="min-w-0 sm:col-span-2">
          <dt className="text-sm font-medium text-[var(--color-text-muted)]">
            {copy.description}
          </dt>
          <dd className="mt-1 break-words font-semibold sm:text-base">
            {expense.description?.trim() || copy.noDescription}
          </dd>
        </div>

        <div className="flex min-w-0 items-start justify-between gap-4 sm:block">
          <dt className="shrink-0 text-sm font-medium text-[var(--color-text-muted)]">
            {copy.category}
          </dt>
          <dd className="min-w-0 break-words text-right font-semibold sm:mt-1 sm:text-left">
            {expense.category}
          </dd>
        </div>

        <div className="flex min-w-0 items-start justify-between gap-4 sm:block">
          <dt className="shrink-0 text-sm font-medium text-[var(--color-text-muted)]">
            {copy.date}
          </dt>
          <dd className="text-right font-semibold sm:mt-1 sm:text-left">
            <time dateTime={expense.date}>{formatDate(expense.date)}</time>
          </dd>
        </div>

        <div className="flex min-w-0 items-start justify-between gap-4 sm:col-span-2 sm:block">
          <dt className="shrink-0 text-sm font-medium text-[var(--color-text-muted)]">
            {copy.amount}
          </dt>
          <dd className="min-w-0 break-words text-right sm:mt-1 sm:text-left">
            <CurrencyAmount
              amount={expense.amount}
              tone="expense"
              showSign
              className="text-xl font-bold sm:text-2xl"
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
            <span className="relative block h-56 w-full sm:h-72">
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
    </div>
  );
}
