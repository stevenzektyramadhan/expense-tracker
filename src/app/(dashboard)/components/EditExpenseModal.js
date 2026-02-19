"use client";

import { useState } from "react";
import { formatDateForInput } from "@/lib/utils";
import { authenticatedFetch } from "@/lib/authenticatedFetch";
import CategorySelect from "./CategorySelect";

export default function EditExpenseModal({ expense, onClose, onUpdate }) {
  const [selectedCategory, setSelectedCategory] = useState(expense.category || "Makanan");
  const [customCategory, setCustomCategory] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // kalau pilih Lainnya + isi kategori custom
    const categoryToSave = selectedCategory === "Lainnya" && customCategory.trim() !== "" ? customCategory.trim() : selectedCategory;

    const updatedData = {
      amount: parseFloat(e.target.amount.value),
      category: categoryToSave, // ✅ pakai ini, bukan dari FormData
      date: e.target.date.value,
      description: e.target.description.value,
    };

    try {
      const response = await authenticatedFetch("/api/expenses", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: expense.id,
          ...updatedData,
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Gagal update pengeluaran");
      }

      onUpdate(payload);
      onClose();
    } catch (error) {
      alert("Gagal update: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm text-black">
      <div className="bg-white rounded-lg p-6 w-[90%] max-w-md relative">
        {/* Tombol Close */}
        <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-700" onClick={onClose}>
          ✕
        </button>

        <h2 className="text-lg font-bold mb-4">Edit Pengeluaran</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Jumlah */}
          <div>
            <label className="block text-sm font-medium">Jumlah</label>
            <input type="number" name="amount" defaultValue={expense.amount} step="0.01" className="w-full border rounded px-2 py-1" />
          </div>

          {/* ✅ Kategori pakai reusable */}
          <CategorySelect value={selectedCategory} onChange={setSelectedCategory} customValue={customCategory} onCustomChange={setCustomCategory} />

          {/* Tanggal */}
          <div>
            <label className="block text-sm font-medium">Tanggal</label>
            <input type="date" name="date" defaultValue={formatDateForInput(expense.date)} className="w-full border rounded px-2 py-1" />
          </div>

          {/* Deskripsi */}
          <div>
            <label className="block text-sm font-medium">Deskripsi</label>
            <textarea name="description" defaultValue={expense.description} className="w-full border rounded px-2 py-1" />
          </div>

          {/* Tombol */}
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400">
              Batal
            </button>
            <button type="submit" disabled={loading} className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">
              {loading ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
