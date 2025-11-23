"use client";

import { useMemo } from "react";
import MobileShell from "./MobileShell";

const formatCurrency = (value) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(Number(value) || 0);

export default function MobileAddExpense({
  formData,
  setFormData,
  selectedCategory,
  setSelectedCategory,
  customCategory,
  setCustomCategory,
  onFileChange,
  receipt,
  onSubmit,
  onCancel,
  submitting,
  uploading,
}) {
  const categories = useMemo(
    () => ["Makanan", "Transportasi", "Belanja", "Hiburan", "Kesehatan", "Lainnya"],
    []
  );

  return (
    <MobileShell>
      <div className="p-6 space-y-5">
        <h1 className="text-2xl font-bold mb-2">Tambah Pengeluaran</h1>
        <p className="text-sm text-gray-400 mb-6">Catat pengeluaran baru Anda</p>

        <div className="bg-gray-800 rounded-2xl p-5">
          <label className="text-sm text-gray-400 mb-3 block">Jumlah Pengeluaran *</label>
          <input
            type="number"
            value={formData.amount}
            onChange={(e) => setFormData((prev) => ({ ...prev, amount: e.target.value }))}
            placeholder="Rp 0"
            className="w-full bg-gray-700 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-purple-500 text-2xl font-bold"
          />
          <p className="text-xs text-gray-400 mt-2">{formatCurrency(formData.amount || 0)}</p>
        </div>

        <div className="bg-gray-800 rounded-2xl p-5 space-y-3">
          <label className="text-sm text-gray-400 mb-1 block">Kategori</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full bg-gray-700 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-purple-500"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          {selectedCategory === "Lainnya" && (
            <input
              type="text"
              value={customCategory}
              onChange={(e) => setCustomCategory(e.target.value)}
              placeholder="Masukkan kategori custom"
              className="w-full bg-gray-700 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-purple-500"
            />
          )}
        </div>

        <div className="bg-gray-800 rounded-2xl p-5">
          <label className="text-sm text-gray-400 mb-3 block">Tanggal *</label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
            className="w-full bg-gray-700 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div className="bg-gray-800 rounded-2xl p-5">
          <label className="text-sm text-gray-400 mb-3 block">Deskripsi</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
            placeholder="Masukkan deskripsi pengeluaran (opsional)"
            rows={4}
            className="w-full bg-gray-700 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-purple-500 resize-none"
          />
        </div>

        <div className="bg-gray-800 rounded-2xl p-5">
          <label className="text-sm text-gray-400 mb-3 block">Upload Struk (Opsional)</label>
          <div className="bg-gray-700 rounded-xl p-4 text-center border-2 border-dashed border-gray-600">
            <input type="file" id="receipt" accept="image/*" className="hidden" onChange={onFileChange} />
            <label htmlFor="receipt" className="text-purple-400 cursor-pointer hover:text-purple-300">
              Pilih File
            </label>
            <span className="text-gray-500 ml-2">{receipt ? receipt.name : "Tidak ada file"}</span>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={onCancel}
            type="button"
            className="flex-1 bg-gray-700 text-white rounded-2xl py-4 font-bold hover:bg-gray-600 transition"
          >
            Batal
          </button>
          <button
            onClick={onSubmit}
            type="button"
            disabled={submitting || uploading}
            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-500 rounded-2xl py-4 font-bold text-white hover:from-purple-700 hover:to-pink-600 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting || uploading ? "Menyimpan..." : "Simpan Pengeluaran"}
          </button>
        </div>
      </div>
    </MobileShell>
  );
}
