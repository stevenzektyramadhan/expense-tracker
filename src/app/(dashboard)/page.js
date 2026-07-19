"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useAuth } from "@/hooks/useAuth";
import { useIsMobile } from "@/hooks/useIsMobile";
import { authenticatedFetch } from "@/lib/authenticatedFetch";
import { DEFAULT_EXPENSE_CATEGORIES, getPeriodLabel } from "@/lib/finance";
import { formatCurrency } from "@/lib/utils";
import useDashboardData from "@/features/dashboard/useDashboardData";

// Components
import SummaryCards from "./components/SummaryCards";
import ExpenseListItem from "./components/ExpenseListItem";
import ExpenseDetailModal from "./components/ExpenseDetailModal";
import EditExpenseModal from "./components/EditExpenseModal";
import ImageZoomModal from "./components/ImageZoomModal";
import DashboardFilters from "./components/DashboardFilters";
import AllowanceModal from "./components/AllowanceModal";

const MobileDashboard = dynamic(() => import("@/components/mobile/MobileDashboard"), {
  ssr: false,
});

const MobileExpenseDetailSheet = dynamic(() => import("@/components/mobile/MobileExpenseDetailSheet"), {
  ssr: false,
});

export default function DashboardPage() {
  const { user } = useAuth();
  const { isMobile, isReady } = useIsMobile();
  const userId = user?.id || null;
  const {
    allowance,
    expenses,
    additionalIncomes,
    filters,
    updateFilters,
    filteredExpenses,
    availableExpensePeriods,
    currentAllowancePeriod,
    metrics,
    requestState,
    refreshAllowance,
    refreshExpenses,
    refreshIncomes,
    removeExpense,
    replaceExpense,
  } = useDashboardData({ userId });
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [editingExpense, setEditingExpense] = useState(null);
  const [zoomImage, setZoomImage] = useState(null);
  const [open, setOpen] = useState(false);
  const allowancePromptPeriodRef = useRef(null);

  // 🔹 Cek allowance bulan ini, kalau belum ada → buat
  useEffect(() => {
    const allowanceStatus = requestState.allowance.status;

    if (
      !userId ||
      allowanceStatus === "idle" ||
      allowanceStatus === "loading" ||
      allowanceStatus === "error"
    ) {
      return;
    }

    const periodKey = `${currentAllowancePeriod.year}-${currentAllowancePeriod.month}`;
    const sessionKey = `allowancePrompted:${userId}:${periodKey}`;
    const hasPromptedThisSession =
      allowancePromptPeriodRef.current === periodKey ||
      (typeof window !== "undefined" &&
        sessionStorage.getItem(sessionKey) === "true");

    if (allowanceStatus === "missing" && !hasPromptedThisSession) {
      setOpen(true);
    }

    allowancePromptPeriodRef.current = periodKey;
    if (typeof window !== "undefined") {
      sessionStorage.setItem(sessionKey, "true");
    }
  }, [
    currentAllowancePeriod.month,
    currentAllowancePeriod.year,
    requestState.allowance.status,
    userId,
  ]);

  const handleDelete = async (id) => {
    const { default: Swal } = await import("sweetalert2");

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

    const response = await authenticatedFetch("/api/expenses", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id }),
    });

    if (response.ok) {
      removeExpense(id);
      setSelectedExpense(null);
      refreshAllowance();

      Swal.fire("Terhapus!", "Pengeluaran berhasil dihapus.", "success");
    } else {
      const payload = await response.json().catch(() => ({}));
      Swal.fire("Gagal!", "Gagal menghapus pengeluaran.", "error");
      console.error("Failed deleting expense", payload);
    }
  };

  const handleUpdate = (updatedExpense) => {
    replaceExpense(updatedExpense);
    refreshAllowance();
  };

  // Get current frequency from allowance (default to 'monthly')
  const currentFrequency = allowance?.frequency || "monthly";
  const periodLabel = getPeriodLabel(currentFrequency);
  const totalPeriodExpenses = metrics.currentAllowancePeriodSpending;
  const totalExpenses = metrics.filteredExpenseTotal;
  const totalAdditionalIncome =
    metrics.currentAllowancePeriodAdditionalIncome;
  const baseAllowance = metrics.baseAllowanceDisplay;
  const requestErrors = [
    {
      key: "allowance",
      message: requestState.allowance.error,
      retry: refreshAllowance,
    },
    {
      key: "expenses",
      message: requestState.expenses.error,
      retry: refreshExpenses,
    },
    {
      key: "incomes",
      message: requestState.incomes.error,
      retry: refreshIncomes,
    },
  ].filter((requestError) => requestError.message);
  const formatMetricCurrency = (value) =>
    value === null ? "-" : formatCurrency(value);
  const retryFailedRequests = () => {
    return Promise.all(requestErrors.map((requestError) => requestError.retry()));
  };

  if (!isReady) return <div className="flex items-center justify-center min-h-64">Loading...</div>;

  if (
    requestState.expenses.status === "idle" ||
    (requestState.expenses.status === "loading" && !Array.isArray(expenses))
  ) {
    return <div className="flex items-center justify-center min-h-64">Loading...</div>;
  }
  
  return (
    <>
      {!isMobile && <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <div className="flex gap-2">
            <Link href="/income/add" className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md text-sm font-medium">
              Tambah Pendapatan
            </Link>
            <Link href="/add" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium">
              Tambah Pengeluaran
            </Link>
          </div>
        </div>

        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-lg flex items-center justify-between gap-3">
          <div>
            <p className="text-sm text-emerald-700">Pendapatan tambahan bulan ini</p>
            <p className="text-xl font-bold text-emerald-800">{formatMetricCurrency(totalAdditionalIncome)}</p>
          </div>
          <Link href="/income" className="bg-emerald-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-emerald-700">
            Lihat Riwayat
          </Link>
        </div>

        {/* 🔹 Allowance Info - Dynamic Label Based on Frequency */}
        {allowance && (
          <div className="bg-white p-6 shadow rounded-lg">
            <h2 className="text-lg font-semibold text-gray-700">
              Sisa Uang Saku {periodLabel}
            </h2>
            <p className="mt-2 text-2xl font-bold text-gray-900">{formatCurrency(allowance.remaining)}</p>
            <p className="text-sm text-gray-500">
              Dari {formatCurrency(allowance.amount)} ({currentFrequency === "weekly" ? "Mingguan" : "Bulanan"})
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Uang saku awal: {formatMetricCurrency(baseAllowance)} | Pendapatan tambahan: {formatMetricCurrency(totalAdditionalIncome)}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Total Pengeluaran {periodLabel}: {formatMetricCurrency(totalPeriodExpenses)}
            </p>
            <div className="mt-3 flex gap-2">
              <button className="text-sm bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700" onClick={() => setOpen(true)}>
                Atur
              </button>
              <Link href="/income" className="text-sm bg-emerald-600 text-white px-3 py-1 rounded-md hover:bg-emerald-700">
                Pendapatan
              </Link>
            </div>
          </div>
        )}
        {/* Summary Cards */}
        {requestState.expenses.status === "success" && (
          <SummaryCards
            totalExpenses={totalExpenses}
            totalTransactions={metrics.filteredTransactionCount}
            allowanceTotal={allowance?.total || 0}
            allowanceRemaining={allowance?.remaining || 0}
          />
        )}

        {/* Error */}
        {requestErrors.length > 0 && (
          <div className="rounded-md bg-red-50 p-4">
            {requestErrors.map((requestError) => (
              <div key={requestError.key} className="text-sm text-red-700">
                {requestError.message}
              </div>
            ))}
            <button
              type="button"
              onClick={retryFailedRequests}
              className="mt-2 text-sm font-medium text-red-700 underline"
            >
              Coba lagi
            </button>
          </div>
        )}

        {/* Filter Bar */}
        <DashboardFilters
          categories={DEFAULT_EXPENSE_CATEGORIES}
          filters={filters}
          currentYear={currentAllowancePeriod.year}
          onFilterChange={updateFilters}
        />
        {/* List */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Daftar Pengeluaran</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">Pengeluaran terbaru Anda</p>
          </div>
          <div className="border-t border-gray-200">
            {requestState.expenses.status === "loading" ? (
              <div className="text-center py-12 text-gray-500">Loading...</div>
            ) : requestState.expenses.status === "error" ? (
              <div className="text-center py-12 text-gray-500">
                Data pengeluaran tidak tersedia.
              </div>
            ) : filteredExpenses.length === 0 ? (
              <div className="text-center py-12 text-gray-500">Belum ada pengeluaran</div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {filteredExpenses.map((expense) => (
                  <ExpenseListItem key={expense.id} expense={expense} onClick={setSelectedExpense} />
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>}

      {isMobile && <div>
        <MobileDashboard
          user={user}
          expenses={expenses}
          filteredExpenses={filteredExpenses}
          additionalIncomes={additionalIncomes}
          allowance={allowance}
          filters={filters}
          availableExpensePeriods={availableExpensePeriods}
          metrics={metrics}
          requestState={requestState}
          onFilterChange={updateFilters}
          onRetryAllowance={refreshAllowance}
          onRetryExpenses={refreshExpenses}
          onRetryIncomes={refreshIncomes}
          onSelectExpense={setSelectedExpense}
          onEditBudget={() => setOpen(true)}
        />
      </div>}

      {/* Modals */}
      {selectedExpense && (
        <>
          {!isMobile && <div>
            <ExpenseDetailModal
              expense={selectedExpense}
              onClose={() => setSelectedExpense(null)}
              onEdit={setEditingExpense}
              onDelete={handleDelete}
              onZoom={setZoomImage}
            />
          </div>}
          {isMobile && <div>
            <MobileExpenseDetailSheet
              expense={selectedExpense}
              onClose={() => setSelectedExpense(null)}
              onEdit={setEditingExpense}
              onDelete={handleDelete}
              onZoom={setZoomImage}
            />
          </div>}
        </>
      )}

      {editingExpense && <EditExpenseModal expense={editingExpense} onClose={() => setEditingExpense(null)} onUpdate={handleUpdate} />}

      {zoomImage && <ImageZoomModal imageUrl={zoomImage} onClose={() => setZoomImage(null)} />}

      <AllowanceModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onSaved={() => {
          setOpen(false);
          refreshAllowance(); // refresh data di parent
        }}
        initialAmount={allowance && baseAllowance !== null ? baseAllowance : 0}
        initialFrequency={allowance?.frequency || "monthly"}
      />
    </>
  );
}
