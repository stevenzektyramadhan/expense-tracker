"use client";

import { formatCurrency, formatDate } from "@/lib/utils";

export default function ExpenseDetailModal({ expense, onClose, onEdit, onDelete, onZoom }) {
  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[90%] max-w-md relative">
        {/* Tombol Close */}
        <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-700" onClick={onClose}>
          ✕
        </button>

        <h2 className="text-black font-bold mb-4">Detail Pengeluaran</h2>

        {/* Foto Struk */}
        {expense.receipt_url ? (
          <img src={expense.receipt_url} alt="Bukti Struk" className="rounded mb-3 max-h-60 w-auto mx-auto object-contain cursor-pointer hover:opacity-90" onClick={() => onZoom(expense.receipt_url)} />
        ) : (
          <p className="text-sm text-black mb-3">Tidak ada foto struk</p>
        )}

        {/* Detail */}
        <div className="text-black">
          <p>
            <strong>Kategori:</strong> {expense.category}
          </p>
          <p>
            <strong>Tanggal:</strong> {formatDate(expense.date)}
          </p>
          <p>
            <strong>Total:</strong> {formatCurrency(expense.amount)}
          </p>
        </div>

        {/* Tombol Edit & Hapus */}
        <div className="mt-4 flex justify-between">
          <button className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600" onClick={() => onEdit(expense)}>
            Edit
          </button>
          <button className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600" onClick={() => onDelete(expense.id)}>
            Hapus
          </button>
        </div>
      </div>
    </div>
  );
}
