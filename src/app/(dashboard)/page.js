"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { getExpenses, supabase } from "@/lib/supabaseClient";

export default function DashboardPage() {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [editingExpense, setEditingExpense] = useState(null);
  const [zoomImage, setZoomImage] = useState(null);

  useEffect(() => {
    if (user) {
      loadExpenses();
    }
  }, [user]);

  const loadExpenses = async () => {
    setLoading(true);
    const { data, error } = await getExpenses(user.id);

    if (error) {
      setError(error.message);
    } else {
      setExpenses(data || []);
    }
    setLoading(false);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };
  const handleDelete = async (id) => {
    if (!confirm("Yakin mau hapus pengeluaran ini?")) return;

    const { error } = await supabase.from("expenses").delete().eq("id", id);

    if (error) {
      console.error("Delete error:", error.message);
      alert("Gagal menghapus: " + error.message);
    } else {
      // update state list & tutup modal
      setExpenses(expenses.filter((e) => e.id !== id));
      setSelectedExpense(null);
    }
  };

  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };
  const getCategoryColor = (category) => {
    const colors = {
      Makanan: "bg-green-100 text-green-800",
      Transportasi: "bg-blue-100 text-blue-800",
      Lainnya: "bg-gray-100 text-gray-800",
    };
    return colors[category] || "bg-gray-100 text-gray-800";
  };

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <Link href="/add" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium">
            Tambah Pengeluaran
          </Link>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-8 w-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Pengeluaran</dt>
                    <dd className="text-lg font-medium text-gray-900">{formatCurrency(totalExpenses)}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Transaksi</dt>
                    <dd className="text-lg font-medium text-gray-900">{expenses.length}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-8 w-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Rata-rata per Transaksi</dt>
                    <dd className="text-lg font-medium text-gray-900">{expenses.length > 0 ? formatCurrency(totalExpenses / expenses.length) : formatCurrency(0)}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="text-sm text-red-700">{error}</div>
          </div>
        )}

        {/* Expenses List */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Daftar Pengeluaran</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">Pengeluaran terbaru Anda</p>
          </div>
          <div className="border-t border-gray-200">
            {expenses.length === 0 ? (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">Belum ada pengeluaran</h3>
                <p className="mt-1 text-sm text-gray-500">Mulai dengan menambahkan pengeluaran pertama Anda.</p>
                <div className="mt-6">
                  <Link
                    href="/add"
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Tambah Pengeluaran
                  </Link>
                </div>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {expenses.map((expense) => (
                  <li key={expense.id} onClick={() => setSelectedExpense(expense)} className="px-4 py-4 sm:px-6 hover:bg-gray-50 cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(expense.category)}`}>{expense.category}</span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{expense.description || "Tidak ada deskripsi"}</div>
                          <div className="text-sm text-gray-500">{formatDate(expense.date)}</div>
                        </div>
                      </div>
                      <div className="text-sm font-medium text-gray-900">{formatCurrency(expense.amount)}</div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Modal untuk Detail Pengeluaran */}

      {selectedExpense && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-[90%] max-w-md relative">
            {/* Tombol Close */}
            <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-700" onClick={() => setSelectedExpense(null)}>
              ✕
            </button>

            <h2 className="text-black font-bold mb-4">Detail Pengeluaran</h2>

            {/* Foto Struk */}
            {selectedExpense.receipt_url ? (
              <img src={selectedExpense.receipt_url} alt="Bukti Struk" className="rounded mb-3 max-h-60 w-auto mx-auto object-contain cursor-pointer hover:opacity-90" onClick={() => setZoomImage(selectedExpense.receipt_url)} />
            ) : (
              <p className="text-sm text-black mb-3">Tidak ada foto struk</p>
            )}

            {/* Detail Pengeluaran */}
            <div className="text-black">
              <p>
                <strong>Kategori:</strong> {selectedExpense.category}
              </p>
              <p>
                <strong>Tanggal:</strong> {formatDate(selectedExpense.date)}
              </p>
              <p>
                <strong>Total:</strong> {formatCurrency(selectedExpense.amount)}
              </p>
            </div>

            {/* Tombol Edit & Hapus */}
            <div className="mt-4 flex justify-between">
              <button className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600" onClick={() => setEditingExpense(selectedExpense)}>
                Edit
              </button>
              <button className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600" onClick={() => handleDelete(selectedExpense.id)}>
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
      {/* modal edit */}
      {editingExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 text-black">
          <div className="bg-white rounded-lg p-6 w-[90%] max-w-md relative">
            {/* Tombol Close */}
            <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-700" onClick={() => setEditingExpense(null)}>
              ✕
            </button>

            <h2 className="text-lg font-bold mb-4">Edit Pengeluaran</h2>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const updatedData = {
                  amount: parseFloat(formData.get("amount")),
                  category: formData.get("category"),
                  date: formData.get("date"),
                  description: formData.get("description"),
                };

                const { error } = await supabase.from("expenses").update(updatedData).eq("id", editingExpense.id);

                if (!error) {
                  // update list locally
                  setExpenses(expenses.map((e) => (e.id === editingExpense.id ? { ...e, ...updatedData } : e)));
                  setEditingExpense(null);
                  setSelectedExpense(null); // tutup modal detail juga
                } else {
                  alert("Gagal update: " + error.message);
                }
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium">Jumlah</label>
                <input type="number" name="amount" defaultValue={editingExpense.amount} step="0.01" className="w-full border rounded px-2 py-1" />
              </div>

              <div>
                <label className="block text-sm-text-black font-medium">Kategori</label>
                <select name="category" defaultValue={editingExpense.category} className="w-full max-w-full border rounded px-2 py-1 bg-white">
                  <option value="Makanan">Makanan</option>
                  <option value="Transportasi">Transportasi</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium">Tanggal</label>
                <input type="date" name="date" defaultValue={formatDateForInput(editingExpense.date)} className="w-full border rounded px-2 py-1" />
              </div>

              <div>
                <label className="block text-sm font-medium">Deskripsi</label>
                <textarea name="description" defaultValue={editingExpense.description} className="w-full border rounded px-2 py-1" />
              </div>

              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setEditingExpense(null)} className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400">
                  Batal
                </button>
                <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* zoom foto */}
      {zoomImage && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
          <img src={zoomImage} alt="Zoomed" className="max-h-[90%] max-w-[90%] object-contain" />
          <button className="absolute top-4 right-4 text-white text-2xl" onClick={() => setZoomImage(null)}>
            ✕
          </button>
        </div>
      )}
    </>
  );
}
