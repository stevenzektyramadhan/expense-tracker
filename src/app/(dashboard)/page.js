"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { getExpenses, supabase } from "@/lib/supabaseClient";

// Components
import SummaryCards from "./components/SummaryCards";
import ExpenseListItem from "./components/ExpenseListItem";
import ExpenseDetailModal from "./components/ExpenseDetailModal";
import EditExpenseModal from "./components/EditExpenseModal";
import ImageZoomModal from "./components/ImageZoomModal";
import DashboardFilters from "./components/DashboardFilters";

export default function DashboardPage() {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [editingExpense, setEditingExpense] = useState(null);
  const [zoomImage, setZoomImage] = useState(null);
  const [filters, setFilters] = useState({
    month: "",
    category: "",
    search: "",
    sort: "date-desc",
  });

  useEffect(() => {
    if (user) loadExpenses();
  }, [user]);

  const loadExpenses = async () => {
    setLoading(true);
    const { data, error } = await getExpenses(user.id);
    if (error) setError(error.message);
    else setExpenses(data || []);
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!confirm("Yakin mau hapus pengeluaran ini?")) return;
    const { error } = await supabase.from("expenses").delete().eq("id", id);
    if (!error) {
      setExpenses(expenses.filter((e) => e.id !== id));
      setSelectedExpense(null);
    } else alert("Gagal menghapus: " + error.message);
  };

  const handleUpdate = (id, updatedData) => {
    setExpenses(expenses.map((e) => (e.id === id ? { ...e, ...updatedData } : e)));
  };

  if (loading) return <div className="flex items-center justify-center min-h-64">Loading...</div>;

  const getFilteredExpenses = () => {
    let filtered = [...expenses];

    // Filter bulan
    if (filters.month) {
      filtered = filtered.filter((e) => {
        const d = new Date(e.date);
        const m = String(d.getMonth() + 1).padStart(2, "0");
        return m === filters.month;
      });
    }

    // Filter kategori
    if (filters.category) {
      filtered = filtered.filter((e) => e.category === filters.category);
    }

    // Search
    if (filters.search) {
      const q = filters.search.toLowerCase();
      filtered = filtered.filter((e) => e.description?.toLowerCase().includes(q) || e.category.toLowerCase().includes(q));
    }

    // Sort
    if (filters.sort === "date-desc") {
      filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
    } else if (filters.sort === "date-asc") {
      filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
    } else if (filters.sort === "amount-desc") {
      filtered.sort((a, b) => b.amount - a.amount);
    } else if (filters.sort === "amount-asc") {
      filtered.sort((a, b) => a.amount - b.amount);
    }

    return filtered;
  };
  const totalExpenses = getFilteredExpenses().reduce((sum, e) => sum + e.amount, 0);
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
        <SummaryCards totalExpenses={totalExpenses} totalTransactions={getFilteredExpenses().length} />

        {/* Error */}
        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="text-sm text-red-700">{error}</div>
          </div>
        )}

        {/* Filter Bar */}
        <DashboardFilters categories={["Makanan", "Transportasi", "Lainnya"]} onFilterChange={setFilters} />
        {/* List */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Daftar Pengeluaran</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">Pengeluaran terbaru Anda</p>
          </div>
          <div className="border-t border-gray-200">
            {expenses.length === 0 ? (
              <div className="text-center py-12 text-gray-500">Belum ada pengeluaran</div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {getFilteredExpenses().map((expense) => (
                  <ExpenseListItem key={expense.id} expense={expense} onClick={setSelectedExpense} />
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {selectedExpense && <ExpenseDetailModal expense={selectedExpense} onClose={() => setSelectedExpense(null)} onEdit={setEditingExpense} onDelete={handleDelete} onZoom={setZoomImage} />}

      {editingExpense && <EditExpenseModal expense={editingExpense} onClose={() => setEditingExpense(null)} onUpdate={handleUpdate} />}

      {zoomImage && <ImageZoomModal imageUrl={zoomImage} onClose={() => setZoomImage(null)} />}
    </>
  );
}
