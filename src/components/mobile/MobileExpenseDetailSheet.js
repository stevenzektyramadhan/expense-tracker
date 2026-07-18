"use client";

import Image from "next/image";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function MobileExpenseDetailSheet({ expense, onClose, onEdit, onDelete, onZoom }) {
  if (!expense) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 md:hidden"
      role="dialog"
      aria-labelledby="mobile-expense-detail-title"
      aria-modal="true"
    >
      <div
        className="flex w-full max-w-md flex-col overflow-hidden rounded-t-3xl bg-gray-900 text-white shadow-2xl"
        style={{
          maxHeight:
            "calc(100dvh - env(safe-area-inset-top, 0px) - var(--space-sm))",
        }}
      >
        <div className="flex shrink-0 items-start justify-between gap-4 px-6 pb-4 pt-6">
          <div className="min-w-0">
            <p className="text-xs text-gray-400">Detail Pengeluaran</p>
            <h2
              id="mobile-expense-detail-title"
              className="mt-1 max-h-32 overflow-y-auto overscroll-contain break-words pr-1 text-lg font-bold"
            >
              {expense.description || "Tidak ada deskripsi"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="-mr-3 -mt-2 inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-full text-gray-400 hover:bg-gray-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 active:bg-gray-700"
            aria-label="Tutup detail pengeluaran"
          >
            ✕
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 pb-5">
          <div className="mb-5 space-y-3">
            <div className="flex items-center justify-between gap-4">
              <span className="shrink-0 text-sm text-gray-400">Kategori</span>
              <span className="min-w-0 break-words text-right text-sm font-semibold">
                {expense.category}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="shrink-0 text-sm text-gray-400">Tanggal</span>
              <span className="min-w-0 break-words text-right text-sm font-semibold">
                {formatDate(expense.date)}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="shrink-0 text-sm text-gray-400">Jumlah</span>
              <span className="min-w-0 break-words text-right text-lg font-bold text-purple-300 [font-variant-numeric:tabular-nums]">
                {formatCurrency(expense.amount)}
              </span>
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm text-gray-400">Struk</p>
            {expense.receipt_url ? (
              <button
                type="button"
                onClick={() => onZoom?.(expense.receipt_url)}
                className="relative block min-h-11 w-full overflow-hidden rounded-2xl border border-gray-800 bg-gray-800 hover:border-purple-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
              >
                <div className="relative h-44 w-full">
                  <Image
                    src={expense.receipt_url}
                    alt="Bukti Struk"
                    fill
                    sizes="320px"
                    className="object-cover"
                  />
                </div>
                <span className="absolute bottom-2 right-2 rounded-full bg-black/60 px-2 py-1 text-xs text-white">
                  Perbesar
                </span>
              </button>
            ) : (
              <div className="rounded-2xl border border-dashed border-gray-700 bg-gray-800 px-4 py-6 text-center text-sm text-gray-400">
                Tidak ada foto struk
              </div>
            )}
          </div>
        </div>

        <div
          className="shrink-0 bg-gray-900 px-6 pt-4"
          style={{
            paddingBottom:
              "calc(var(--space-xl) + env(safe-area-inset-bottom, 0px))",
          }}
        >
          <div className="flex gap-3">
            {onEdit ? (
              <button
                type="button"
                onClick={() => onEdit(expense)}
                className="min-h-11 flex-1 whitespace-nowrap rounded-2xl bg-purple-600 px-4 py-3 font-semibold text-white hover:bg-purple-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 active:bg-purple-700"
              >
                Edit
              </button>
            ) : null}
            {onDelete ? (
              <button
                type="button"
                onClick={() => onDelete(expense.id)}
                className="min-h-11 flex-1 whitespace-nowrap rounded-2xl bg-red-600 px-4 py-3 font-semibold text-white hover:bg-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 active:bg-red-700"
              >
                Hapus
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
