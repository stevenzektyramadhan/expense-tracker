"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import UnifiedDashboardPage from "@/features/dashboard/DashboardPage";
import useDashboardData from "@/features/dashboard/useDashboardData";
import { useAuth } from "@/hooks/useAuth";
import { authenticatedFetch } from "@/lib/authenticatedFetch";
import { supabase } from "@/lib/supabaseClient";
import MobileExpenseDetailSheet from "@/components/mobile/MobileExpenseDetailSheet";
import AllowanceModal from "./components/AllowanceModal";
import EditExpenseModal from "./components/EditExpenseModal";
import ExpenseDetailModal from "./components/ExpenseDetailModal";
import ImageZoomModal from "./components/ImageZoomModal";

const DETAIL_LABELS = {
  title: "Detail pengeluaran",
  description: "Deskripsi",
  category: "Kategori",
  date: "Tanggal",
  amount: "Jumlah",
  receipt: "Struk",
  noDescription: "Tanpa deskripsi",
  noReceipt: "Tidak ada foto struk",
  zoom: "Perbesar struk",
  edit: "Edit",
  delete: "Hapus",
  close: "Tutup",
};

function ResponsiveExpenseDetailOverlay(props) {
  const [useDesktopGeometry, setUseDesktopGeometry] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 768px)");
    const updateGeometry = () => setUseDesktopGeometry(mediaQuery.matches);

    updateGeometry();
    mediaQuery.addEventListener("change", updateGeometry);

    return () => mediaQuery.removeEventListener("change", updateGeometry);
  }, []);

  const DetailOverlay = useDesktopGeometry
    ? ExpenseDetailModal
    : MobileExpenseDetailSheet;

  return <DetailOverlay {...props} />;
}

export default function DashboardRoute() {
  const { user } = useAuth();
  const router = useRouter();
  const userId = user?.id || null;
  const {
    allowance,
    expenses,
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
  const [expenseBehindZoom, setExpenseBehindZoom] = useState(null);
  const [allowanceModalOpen, setAllowanceModalOpen] = useState(false);
  const [dismissedProfileUserId, setDismissedProfileUserId] = useState(null);
  const [completedProfileUserId, setCompletedProfileUserId] = useState(null);
  const allowancePromptPeriodRef = useRef(null);
  const overlayTriggerRef = useRef(null);

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
      setAllowanceModalOpen(true);
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

  const rememberOverlayTrigger = () => {
    if (
      typeof document !== "undefined" &&
      document.activeElement instanceof HTMLElement
    ) {
      overlayTriggerRef.current = document.activeElement;
    }
  };

  const restoreOverlayTrigger = () => {
    if (typeof window === "undefined") return;

    window.requestAnimationFrame(() => {
      const trigger = overlayTriggerRef.current;

      if (trigger?.isConnected) {
        trigger.focus();
      } else {
        document.getElementById("transaction-history")?.focus();
      }
    });
  };

  const handleSelectExpense = (expense) => {
    rememberOverlayTrigger();
    setSelectedExpense(expense);
  };

  const handleCloseExpenseDetail = () => {
    setSelectedExpense(null);
    restoreOverlayTrigger();
  };

  const handleEditFromList = (expense) => {
    rememberOverlayTrigger();
    setEditingExpense(expense);
  };

  const handleEditFromDetail = (expense) => {
    setSelectedExpense(null);
    setEditingExpense(expense);
  };

  const handleCloseEdit = () => {
    setEditingExpense(null);
    restoreOverlayTrigger();
  };

  const handleZoomReceipt = (imageUrl) => {
    setExpenseBehindZoom(selectedExpense);
    setSelectedExpense(null);
    setZoomImage(imageUrl);
  };

  const handleCloseZoom = () => {
    setZoomImage(null);

    if (expenseBehindZoom) {
      setSelectedExpense(expenseBehindZoom);
      setExpenseBehindZoom(null);
    } else {
      restoreOverlayTrigger();
    }
  };

  const handleDelete = async (id) => {
    const expenseToRestore =
      selectedExpense?.id === id ? selectedExpense : null;

    if (expenseToRestore) {
      setSelectedExpense(null);
    } else {
      rememberOverlayTrigger();
    }

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

    if (!result.isConfirmed) {
      if (expenseToRestore) setSelectedExpense(expenseToRestore);
      return;
    }

    try {
      const response = await authenticatedFetch("/api/expenses", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      if (response.ok) {
        removeExpense(id);
        refreshAllowance();
        await Swal.fire(
          "Terhapus!",
          "Pengeluaran berhasil dihapus.",
          "success",
        );
        restoreOverlayTrigger();
      } else {
        const payload = await response.json().catch(() => ({}));
        console.error("Failed deleting expense", payload);
        await Swal.fire("Gagal!", "Gagal menghapus pengeluaran.", "error");
        if (expenseToRestore) setSelectedExpense(expenseToRestore);
      }
    } catch (error) {
      console.error("Failed deleting expense", error);
      await Swal.fire("Gagal!", "Gagal menghapus pengeluaran.", "error");
      if (expenseToRestore) setSelectedExpense(expenseToRestore);
    }
  };

  const handleUpdate = (updatedExpense) => {
    replaceExpense(updatedExpense);
    refreshAllowance();
  };

  const handleCompleteProfile = async (fullName) => {
    const { error } = await supabase.auth.updateUser({
      data: { full_name: fullName.trim() },
    });

    if (error) {
      console.error("Failed to save profile name", error.message);
      throw new Error("Nama belum dapat disimpan. Coba lagi.");
    }

    setCompletedProfileUserId(userId);
    router.refresh();
  };

  const isInitialLoading =
    requestState.expenses.status === "idle" ||
    (requestState.expenses.status === "loading" && !Array.isArray(expenses));
  const hasFullName = Boolean(user?.user_metadata?.full_name?.trim());
  const showProfilePrompt =
    Boolean(userId) &&
    !hasFullName &&
    dismissedProfileUserId !== userId &&
    completedProfileUserId !== userId;
  const baseAllowance = metrics.baseAllowanceDisplay;

  return (
    <>
      <UnifiedDashboardPage
        allowance={allowance}
        availableExpensePeriods={availableExpensePeriods}
        currentAllowancePeriod={currentAllowancePeriod}
        expenses={expenses}
        filteredExpenses={filteredExpenses}
        filters={filters}
        isInitialLoading={isInitialLoading}
        metrics={metrics}
        onCompleteProfile={handleCompleteProfile}
        onDeleteExpense={handleDelete}
        onDismissProfilePrompt={() => setDismissedProfileUserId(userId)}
        onEditAllowance={() => setAllowanceModalOpen(true)}
        onEditExpense={handleEditFromList}
        onFilterChange={updateFilters}
        onRetryAllowance={refreshAllowance}
        onRetryExpenses={refreshExpenses}
        onRetryIncomes={refreshIncomes}
        onSelectExpense={handleSelectExpense}
        requestState={requestState}
        showProfilePrompt={showProfilePrompt}
      />

      {selectedExpense ? (
        <ResponsiveExpenseDetailOverlay
          expense={selectedExpense}
          labels={DETAIL_LABELS}
          onClose={handleCloseExpenseDetail}
          onEdit={handleEditFromDetail}
          onDelete={handleDelete}
          onZoom={handleZoomReceipt}
        />
      ) : null}

      {editingExpense ? (
        <EditExpenseModal
          expense={editingExpense}
          onClose={handleCloseEdit}
          onUpdate={handleUpdate}
        />
      ) : null}

      {zoomImage ? (
        <ImageZoomModal imageUrl={zoomImage} onClose={handleCloseZoom} />
      ) : null}

      <AllowanceModal
        isOpen={allowanceModalOpen}
        onClose={() => setAllowanceModalOpen(false)}
        onSaved={() => {
          setAllowanceModalOpen(false);
          refreshAllowance();
        }}
        initialAmount={allowance && baseAllowance !== null ? baseAllowance : 0}
        initialFrequency={allowance?.frequency || "monthly"}
      />
    </>
  );
}
