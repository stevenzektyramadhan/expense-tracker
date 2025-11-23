"use client";

import Image from "next/image";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function MobileExpenseDetailSheet({ expense, onClose, onEdit, onDelete, onZoom }) {
  if (!expense) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 md:hidden" role="dialog" aria-modal="true">
      <div className="w-full max-w-md rounded-t-3xl bg-gray-900 text-white shadow-2xl p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-xs text-gray-400">Detail Pengeluaran</p>
            <h2 className="text-lg font-bold mt-1">{expense.description || "Tidak ada deskripsi"}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 rounded-full"
            aria-label="Tutup detail pengeluaran"
          >
            ✕
          </button>
        </div>

        <div className="space-y-3 mb-5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Kategori</span>
            <span className="text-sm font-semibold">{expense.category}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Tanggal</span>
            <span className="text-sm font-semibold">{formatDate(expense.date)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Jumlah</span>
            <span className="text-lg font-bold text-purple-300">{formatCurrency(expense.amount)}</span>
          </div>
        </div>

        <div className="mb-5">
          <p className="text-sm text-gray-400 mb-2">Struk</p>
          {expense.receipt_url ? (
            <button
              type="button"
              onClick={() => onZoom?.(expense.receipt_url)}
              className="relative block w-full overflow-hidden rounded-2xl border border-gray-800 bg-gray-800 hover:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
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
              <span className="absolute bottom-2 right-2 text-xs bg-black/60 px-2 py-1 rounded-full text-white">Perbesar</span>
            </button>
          ) : (
            <div className="rounded-2xl border border-dashed border-gray-700 bg-gray-800 px-4 py-6 text-center text-sm text-gray-400">
              Tidak ada foto struk
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => onEdit?.(expense)}
            className="flex-1 rounded-2xl bg-purple-600 px-4 py-3 font-semibold text-white hover:bg-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => onDelete?.(expense.id)}
            className="flex-1 rounded-2xl bg-red-600 px-4 py-3 font-semibold text-white hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            Hapus
          </button>
        </div>
      </div>
    </div>
  );
}
