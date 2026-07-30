"use client";

/**
 * @deprecated Phase 9: replaced by the shared responsive dashboard in
 * `src/features/dashboard`. Retained only as rollback input until cleanup is
 * explicitly approved. Do not add new imports.
 */
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronDown, Search } from "./icons";
import { Pencil } from "lucide-react";
import MobileShell from "./MobileShell";
import Swal from "sweetalert2";
import { supabase } from "@/lib/supabaseClient";
import { DEFAULT_EXPENSE_CATEGORIES, getCategoryDotColor } from "@/lib/finance";
import { formatCurrency } from "@/lib/utils";

const formatMetricCurrency = (amount) =>
  amount === null ? "-" : formatCurrency(amount);

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
};

const getPeriodName = ({ month, year }) => {
  return new Date(year, month - 1, 1).toLocaleDateString("id-ID", {
    month: "long",
    year: "numeric",
  });
};

export default function MobileDashboard({
  user,
  expenses,
  filteredExpenses,
  additionalIncomes,
  allowance,
  filters,
  availableExpensePeriods,
  metrics,
  requestState,
  onFilterChange,
  onRetryAllowance = () => {},
  onRetryExpenses = () => {},
  onRetryIncomes = () => {},
  onSelectExpense = () => {},
  onEditBudget = () => {},
}) {
  const router = useRouter();

  // =============================================================================
  // MISSING INFORMATION DETECTOR
  // =============================================================================
  /**
   * This useEffect detects old users who registered before the full_name field
   * was added to the registration form. When detected, it prompts them to add
   * their name for a more personalized experience.
   * 
   * HOW supabase.auth.updateUser() WORKS:
   * -------------------------------------
   * - `updateUser()` patches the currently authenticated user's data
   * - The `data` object parameter maps directly to `user_metadata`
   * - This is a PATCH operation: only specified fields are updated
   * - No separate database query is needed - Supabase Auth handles it
   * - The updated user_metadata becomes available on the next getUser() call
   * - Benefits: Simple, atomic update without managing a profiles table
   * 
   * Example: supabase.auth.updateUser({ data: { full_name: "John" } })
   * This only updates full_name, leaving other metadata fields untouched.
   */
  useEffect(() => {
    // Skip if no user or if they already have a full_name
    if (!user || user.user_metadata?.full_name) return;

    const promptForName = async () => {
      const result = await Swal.fire({
        title: "Satu langkah lagi!",
        text: "Demi kenyamanan, boleh kami tahu siapa nama panggilan Anda?",
        input: "text",
        inputPlaceholder: "Masukkan nama Anda...",
        allowOutsideClick: false,    // Force user to complete the form
        allowEscapeKey: false,       // Prevent escape key from closing
        showCancelButton: false,     // No cancel button - they must fill it
        confirmButtonText: "Simpan",
        confirmButtonColor: "#2563eb", // Blue to match the app theme
        inputValidator: (value) => {
          // Validation: input cannot be empty
          if (!value || !value.trim()) {
            return "Nama tidak boleh kosong!";
          }
          return null;
        },
      });

      if (result.isConfirmed && result.value) {
        // Update user_metadata with the new full_name
        const { error } = await supabase.auth.updateUser({
          data: { full_name: result.value.trim() },
        });

        if (error) {
          Swal.fire("Error", "Gagal menyimpan nama. Silakan coba lagi.", "error");
        } else {
          // Success - use Next.js router.refresh() instead of window.location.reload()
          // router.refresh() re-fetches the route's data without a full page reload,
          // which is compatible with Next.js App Router and won't break the layout
          Swal.fire({
            title: "Terima kasih!",
            text: `Halo, ${result.value.trim()}! Selamat datang.`,
            icon: "success",
            timer: 2000,
            showConfirmButton: false,
          }).then(() => {
            router.refresh();
          });
        }
      }
    };

    promptForName();
  }, [user, router]); // Re-run when auth user or router instance changes

  const safeExpenses = Array.isArray(expenses) ? expenses : [];
  const safeAdditionalIncomes = Array.isArray(additionalIncomes)
    ? additionalIncomes
    : [];
  const selectedPeriod =
    filters.period === "all"
      ? "all"
      : `${filters.year}-${String(filters.month).padStart(2, "0")}`;
  const categories = (() => {
    const unique = new Set(safeExpenses.map((e) => e.category));
    return unique.size ? Array.from(unique) : DEFAULT_EXPENSE_CATEGORIES;
  })();
  const latestIncomes = safeAdditionalIncomes.slice(0, 3);

  // Get the current budget frequency (default to 'monthly')
  const currentFrequency = allowance?.frequency || "monthly";
  const totalExpense = metrics.currentAllowancePeriodSpending;
  const totalAdditionalIncome =
    metrics.currentAllowancePeriodAdditionalIncome;
  const baseBudget = metrics.baseAllowanceDisplay;
  const avgPerTransaction = metrics.currentAllowancePeriodAverageTransaction;
  const totalTransactions = metrics.currentAllowancePeriodTransactionCount;
  const remainingBudget =
    requestState.allowance.status === "success"
      ? Number(allowance.remaining)
      : requestState.allowance.status === "missing"
        ? 0
        : null;
  const sortLabel = {
    "date-desc": "Latest",
    "date-asc": "Oldest",
    "amount-desc": "Jumlah terbesar",
    "amount-asc": "Jumlah terkecil",
  }[filters.sort];

  const handlePeriodChange = (value) => {
    if (value === "all") {
      onFilterChange({ ...filters, period: "all" });
      return;
    }

    const [year, month] = value.split("-").map(Number);
    onFilterChange({
      ...filters,
      period: "month",
      month,
      year,
    });
  };

  return (
    <MobileShell>
      <div className="p-6">
        {/* ===================================================================
            USER GREETING SECTION
            ===================================================================
            Displays user's full name from user_metadata if available.
            Falls back to email for users who registered before we added
            the full_name field (backward compatibility).
            
            user_metadata is set during signUp via options.data and is
            automatically available on the user object after login.
        */}
        <div className="flex justify-between items-start mb-6">
          <div className="min-w-0 flex-1 mr-3">
            <p className="text-gray-400 text-sm mb-1">Welcome back</p>
            <h1 className="text-2xl font-bold truncate">
              {/* Prioritize full_name, fallback to email */}
              {user?.user_metadata?.full_name || user?.email || "Pengguna"}
            </h1>
          </div>
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-orange-500 flex-shrink-0" aria-hidden />
        </div>


        {/* ===================================================================
            BALANCE CARD WITH EDIT BUTTON
            ===================================================================
            The main gradient card showing remaining budget. Includes a subtle
            edit button (Pencil icon) at top-right corner to allow users to
            update their monthly budget without searching for the option.
        */}
        <div className="bg-gradient-to-r from-blue-600 to-orange-500 rounded-3xl p-6 mb-4 relative">
          {/* Edit Budget Button - Top Right Corner 
              z-20 relative ensures the button is clickable above the gradient background */}
          <button
            onClick={onEditBudget}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors z-20"
            aria-label="Edit Budget"
          >
            <Pencil className="w-4 h-4 text-white" />
          </button>
          <p className="text-white text-sm mb-2 opacity-90">
            Balance {currentFrequency === 'weekly' ? '(Mingguan)' : '(Bulanan)'}
          </p>
          <h2 className="text-4xl font-bold text-white">{formatMetricCurrency(remainingBudget)}</h2>
          <p className="text-white text-xs mt-2 opacity-80">Budget awal {formatMetricCurrency(baseBudget)} + tambahan {formatMetricCurrency(totalAdditionalIncome)}</p>
          {requestState.allowance.status === "error" && (
            <button
              type="button"
              onClick={onRetryAllowance}
              className="mt-2 text-xs text-white underline"
            >
              Gagal memuat uang saku. Coba lagi
            </button>
          )}
        </div>

        <div className="bg-gradient-to-r from-emerald-600 to-green-500 rounded-3xl p-5 mb-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-white text-sm opacity-90">Pendapatan Tambahan</p>
            <Link href="/income" className="text-xs bg-white/20 px-2 py-1 rounded-lg">Lihat</Link>
          </div>
          <h3 className="text-2xl font-bold text-white">{formatMetricCurrency(totalAdditionalIncome)}</h3>
          <Link href="/income/add" className="inline-block mt-3 text-xs bg-white/20 px-3 py-1.5 rounded-lg">
            + Tambah Pendapatan
          </Link>
        </div>

        <div className="bg-gradient-to-r from-blue-700 to-blue-900 rounded-3xl p-6 mb-6">
          <p className="text-white text-sm mb-2 opacity-90">Total Pengeluaran</p>
          <h3 className="text-2xl font-bold text-white">{formatMetricCurrency(totalExpense)}</h3>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-blue-600 rounded-2xl p-4">
            <p className="text-white text-xs mb-1 opacity-90">Total Transaksi</p>
            <p className="text-2xl font-bold text-white">{totalTransactions ?? "-"}</p>
          </div>
          <div className="bg-orange-500 rounded-2xl p-4">
            <p className="text-white text-xs mb-1 opacity-90">Rata-rata Transaksi</p>
            <p className="text-lg font-bold text-white">{formatMetricCurrency(avgPerTransaction === null ? null : Math.round(avgPerTransaction))}</p>
          </div>
        </div>

        <div className="flex gap-3 mb-4">
          <div className="flex-1 bg-gray-800 rounded-xl px-4 py-3 flex items-center">
            <Search className="w-5 h-5 text-gray-400 mr-2" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
              placeholder="Search here"
              className="bg-transparent text-white outline-none w-full text-sm placeholder-gray-500"
            />
          </div>
          <div className="bg-gray-800 rounded-xl px-4 py-3" aria-hidden>
            <ChevronDown className="w-5 h-5 text-white" />
          </div>
        </div>

        <div className="space-y-3 mb-6">
          <select
            value={selectedPeriod}
            onChange={(e) => handlePeriodChange(e.target.value)}
            className="w-full bg-gray-800 rounded-xl px-4 py-3 text-white outline-none"
          >
            <option value="all">Semua Bulan</option>
            {availableExpensePeriods.map((period) => (
              <option key={period.key} value={period.key}>
                {getPeriodName(period)}
              </option>
            ))}
          </select>

          <select
            value={filters.category || "all"}
            onChange={(e) => onFilterChange({ ...filters, category: e.target.value })}
            className="w-full bg-gray-800 rounded-xl px-4 py-3 text-white outline-none"
          >
            <option value="all">Semua Kategori</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <select
            value={filters.sort}
            onChange={(e) => onFilterChange({ ...filters, sort: e.target.value })}
            className="w-full bg-gray-800 rounded-xl px-4 py-3 text-white outline-none"
          >
            <option value="date-desc">Tanggal terbaru</option>
            <option value="date-asc">Tanggal terlama</option>
            {filters.sort === "amount-desc" && (
              <option value="amount-desc">Jumlah terbesar</option>
            )}
            {filters.sort === "amount-asc" && (
              <option value="amount-asc">Jumlah terkecil</option>
            )}
          </select>
        </div>

        <div className="mb-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold">Transactions</h3>
            <span className="text-orange-400 text-sm flex items-center">
              Sort by: {sortLabel} <ChevronDown className="w-4 h-4 ml-1" />
            </span>
          </div>

          <div className="space-y-3">
            {requestState.expenses.status === "loading" ? (
              <div className="text-center text-gray-400 py-8">Loading...</div>
            ) : requestState.expenses.status === "error" ? (
              <div className="text-center text-gray-400 py-8">
                <p>Gagal memuat pengeluaran.</p>
                <button
                  type="button"
                  onClick={onRetryExpenses}
                  className="mt-2 text-sm text-orange-400 underline"
                >
                  Coba lagi
                </button>
              </div>
            ) : (
              <>
              {filteredExpenses.map((expense) => (
              <button
                key={expense.id}
                type="button"
                onClick={() => onSelectExpense(expense)}
                className="bg-gray-800 rounded-2xl p-4 w-full flex items-center justify-between text-left hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 ${getCategoryDotColor(expense.category)} rounded-full flex items-center justify-center`}>
                    <span className="text-white text-lg">💰</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">{expense.description || "Tidak ada deskripsi"}</h4>
                    <p className="text-gray-400 text-xs">{formatDate(expense.date)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-white">{expense.category}</p>
                  <p className="text-green-400 text-xs">{formatCurrency(expense.amount)}</p>
                </div>
              </button>
            ))}

            {filteredExpenses.length === 0 && (
              <div className="text-center text-gray-400 py-8">Belum ada pengeluaran untuk filter ini.</div>
            )}
              </>
            )}
          </div>
        </div>

        <div className="mb-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold">Pendapatan Terbaru</h3>
            <Link href="/income" className="text-emerald-400 text-sm">Semua</Link>
          </div>

          <div className="space-y-3">
            {requestState.incomes.status === "loading" ? (
              <div className="text-center text-gray-400 py-6 bg-gray-800 rounded-2xl">
                Loading...
              </div>
            ) : requestState.incomes.status === "error" ? (
              <div className="text-center text-gray-400 py-6 bg-gray-800 rounded-2xl">
                <p>Gagal memuat pendapatan tambahan.</p>
                <button
                  type="button"
                  onClick={onRetryIncomes}
                  className="mt-2 text-sm text-emerald-400 underline"
                >
                  Coba lagi
                </button>
              </div>
            ) : (
              <>
              {latestIncomes.map((income) => (
              <div key={income.id} className="bg-gray-800 rounded-2xl p-4 w-full flex items-center justify-between">
                <div>
                  <p className="font-semibold text-white">{income.source || "Pendapatan tambahan"}</p>
                  <p className="text-gray-400 text-xs">{formatDate(income.date)}</p>
                </div>
                <p className="text-emerald-400 font-semibold">{formatCurrency(income.amount)}</p>
              </div>
            ))}

            {latestIncomes.length === 0 && (
              <div className="text-center text-gray-400 py-6 bg-gray-800 rounded-2xl">Belum ada pendapatan tambahan.</div>
            )}
              </>
            )}
          </div>
        </div>
      </div>
    </MobileShell>
  );
}
