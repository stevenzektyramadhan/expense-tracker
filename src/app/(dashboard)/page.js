"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { getExpenses, supabase } from "@/lib/supabaseClient";
import Swal from "sweetalert2";

// Components
import SummaryCards from "./components/SummaryCards";
import ExpenseListItem from "./components/ExpenseListItem";
import ExpenseDetailModal from "./components/ExpenseDetailModal";
import EditExpenseModal from "./components/EditExpenseModal";
import ImageZoomModal from "./components/ImageZoomModal";
import DashboardFilters from "./components/DashboardFilters";
import AllowanceModal from "./components/AllowanceModal";
import MobileDashboard from "@/components/mobile/MobileDashboard";
import MobileExpenseDetailSheet from "@/components/mobile/MobileExpenseDetailSheet";

export default function DashboardPage() {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [allowance, setAllowance] = useState(null);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [editingExpense, setEditingExpense] = useState(null);
  const [zoomImage, setZoomImage] = useState(null);
  const [filters, setFilters] = useState({
    month: "",
    category: "",
    search: "",
    sort: "date-desc",
  });
  const [open, setOpen] = useState(false);
  const allowancePromptPeriodRef = useRef(null);

  // 🔹 Cek allowance bulan ini, kalau belum ada → buat
  const loadAllowance = useCallback(
    async ({ shouldPrompt = false } = {}) => {
      if (!user) return;

      const now = new Date();
      const month = now.getMonth() + 1;
      const year = now.getFullYear();
      const periodKey = `${year}-${month}`;
      const sessionKey = `allowancePrompted:${user.id}:${periodKey}`;
      const hasPromptedThisSession =
        allowancePromptPeriodRef.current === periodKey ||
        (typeof window !== "undefined" && sessionStorage.getItem(sessionKey) === "true");

      const markPeriodHandled = () => {
        allowancePromptPeriodRef.current = periodKey;
        if (typeof window !== "undefined") {
          sessionStorage.setItem(sessionKey, "true");
        }
      };

      const { data, error } = await supabase
        .from("allowances")
        .select("*")
        .eq("user_id", user.id)
        .eq("month", month)
        .eq("year", year)
        .maybeSingle();

      if (error) {
        console.error("Failed to load allowance", error);
        setAllowance(null);

        if (shouldPrompt && !hasPromptedThisSession) {
          setOpen(true);
          markPeriodHandled();
        }
        return;
      }

      if (data) {
        setAllowance(data);
        markPeriodHandled();
        return;
      }

      setAllowance(null);

      if (shouldPrompt && !hasPromptedThisSession) {
        setOpen(true);
        markPeriodHandled();
      }
    },
    [user]
  );

  const loadExpenses = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await getExpenses(user.id);
    if (error) {
      setError(error.message);
    } else {
      setError("");
      setExpenses(data || []);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (user) {
      loadAllowance({ shouldPrompt: true });
      loadExpenses();
    }
  }, [user, loadAllowance, loadExpenses]);

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Yakin mau hapus?",
      text: "Data pengeluaran ini tidak bisa dikembalikan.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
    });

    if (!result.isConfirmed) return;

    const { error } = await supabase.from("expenses").delete().eq("id", id);
    if (!error) {
      setExpenses(expenses.filter((e) => e.id !== id));
      setSelectedExpense(null);

      Swal.fire("Terhapus!", "Pengeluaran berhasil dihapus.", "success");
    } else {
      Swal.fire("Gagal!", "Gagal menghapus pengeluaran.", "error");
    }
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
      <div className="hidden md:block space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <Link href="/add" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium">
            Tambah Pengeluaran
          </Link>
        </div>

        {/* 🔹 Tambahin Allowance Info */}
        {allowance && (
          <div className="bg-white p-6 shadow rounded-lg">
            <h2 className="text-lg font-semibold text-gray-700">Sisa Uang Saku Bulan Ini</h2>
            <p className="mt-2 text-2xl font-bold text-gray-900">Rp {allowance.remaining.toLocaleString()}</p>
            <p className="text-sm text-gray-500">Dari Rp {allowance.amount.toLocaleString()}</p>
            <button className="mt-3 text-sm bg-indigo-600 text-white px-3 py-1 rounded-md hover:bg-indigo-700" onClick={() => setOpen(true)}>
              Atur
            </button>
          </div>
        )}
        {/* Summary Cards */}
        <SummaryCards totalExpenses={totalExpenses} totalTransactions={getFilteredExpenses().length} allowanceTotal={allowance?.total || 0} allowanceRemaining={allowance?.remaining || 0} />

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

      <div className="md:hidden">
        <MobileDashboard
          user={user}
          expenses={expenses}
          allowance={allowance}
          onSelectExpense={setSelectedExpense}
        />
      </div>

      {/* Modals */}
      {selectedExpense && (
        <>
          <div className="hidden md:block">
            <ExpenseDetailModal
              expense={selectedExpense}
              onClose={() => setSelectedExpense(null)}
              onEdit={setEditingExpense}
              onDelete={handleDelete}
              onZoom={setZoomImage}
            />
          </div>
          <div className="md:hidden">
            <MobileExpenseDetailSheet
              expense={selectedExpense}
              onClose={() => setSelectedExpense(null)}
              onEdit={setEditingExpense}
              onDelete={handleDelete}
              onZoom={setZoomImage}
            />
          </div>
        </>
      )}

      {editingExpense && <EditExpenseModal expense={editingExpense} onClose={() => setEditingExpense(null)} onUpdate={handleUpdate} />}

      {zoomImage && <ImageZoomModal imageUrl={zoomImage} onClose={() => setZoomImage(null)} />}

      <AllowanceModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onSaved={() => {
          setOpen(false);
          loadAllowance?.(); // refresh data di parent
        }}
        userId={user?.id}
      />
    </>
  );
}
