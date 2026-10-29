"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { BarChart3, PlusCircle } from "lucide-react";

import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";
import MonthlySummary, {
  MonthlySummarySkeleton,
} from "@/features/reports/MonthlySummary";
import { authenticatedFetch } from "@/lib/authenticatedFetch";
import {
  createExpenseCsv,
  getExpenseCsvFilename,
  getMonthDateRange,
} from "@/lib/csvExport.mjs";
import { formatCurrency, formatDate } from "@/lib/utils";

const SUMMARY_LOAD_ERROR =
  "Ringkasan belum dapat dimuat. Periksa koneksi lalu coba lagi.";
const SUMMARY_AUTH_ERROR =
  "Sesi Anda berakhir. Masuk kembali lalu coba lagi.";
const EXPORT_ERROR =
  "Pengeluaran bulan ini belum dapat diekspor. Periksa koneksi lalu coba lagi.";

const getExistingCurrentMonthKey = () =>
  new Date().toISOString().slice(0, 7);

function getSafeSummaryError({ message = "", status }) {
  if (
    status === 401 ||
    /sesi login|sesi anda berakhir|login ulang|unauthorized|jwt|token/i.test(
      message,
    )
  ) {
    return SUMMARY_AUTH_ERROR;
  }

  return SUMMARY_LOAD_ERROR;
}

function getSafeExportError({ message = "", status }) {
  if (
    status === 401 ||
    /sesi login|sesi anda berakhir|login ulang|unauthorized|jwt|token/i.test(
      message,
    )
  ) {
    return SUMMARY_AUTH_ERROR;
  }

  return EXPORT_ERROR;
}

function normalizeSummaryPayload(payload) {
  if (
    !Array.isArray(payload?.expensesByMonth) ||
    !payload?.categoryByMonth ||
    typeof payload.categoryByMonth !== "object" ||
    Array.isArray(payload.categoryByMonth)
  ) {
    throw new Error(SUMMARY_LOAD_ERROR);
  }

  return {
    monthlyData: payload.expensesByMonth,
    categoryByMonth: payload.categoryByMonth,
  };
}

function resolveSelectedMonth(monthlyData, currentSelection = "") {
  if (monthlyData.some((month) => month.key === currentSelection)) {
    return currentSelection;
  }

  const currentMonthKey = getExistingCurrentMonthKey();
  if (monthlyData.some((month) => month.key === currentMonthKey)) {
    return currentMonthKey;
  }

  return monthlyData[0]?.key || "";
}

export default function SummaryPage() {
  const [summaryData, setSummaryData] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [loadState, setLoadState] = useState({
    status: "loading",
    message: "",
  });
  const activeRequestRef = useRef(null);
  const exportRequestRef = useRef(null);
  const adviceRequestRef = useRef(null);
  const [exportState, setExportState] = useState({
    status: "idle",
    message: "",
  });
  const [adviceByMonth, setAdviceByMonth] = useState({});
  const [adviceState, setAdviceState] = useState({
    status: "idle",
    message: "",
  });
  const [budgetActionState, setBudgetActionState] = useState({
    status: "idle",
    message: "",
  });

  const fetchSummaryData = useCallback(async () => {
    activeRequestRef.current?.abort();
    const controller = new AbortController();
    activeRequestRef.current = controller;
    setLoadState({ status: "loading", message: "" });

    try {
      const response = await authenticatedFetch("/api/summary", {
        signal: controller.signal,
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          getSafeSummaryError({
            message: payload.error,
            status: response.status,
          }),
        );
      }

      const normalizedData = normalizeSummaryPayload(payload);
      if (controller.signal.aborted) return;

      setSummaryData(normalizedData);
      setSelectedMonth((currentSelection) =>
        resolveSelectedMonth(normalizedData.monthlyData, currentSelection),
      );
      setLoadState({ status: "success", message: "" });
    } catch (error) {
      if (controller.signal.aborted || error?.name === "AbortError") return;

      setLoadState({
        status: "error",
        message: getSafeSummaryError({
          message: error instanceof Error ? error.message : "",
        }),
      });
    } finally {
      if (activeRequestRef.current === controller) {
        activeRequestRef.current = null;
      }
    }
  }, []);

  const exportSelectedMonth = useCallback(async () => {
    if (!selectedMonth) return;

    exportRequestRef.current?.abort();
    const controller = new AbortController();
    exportRequestRef.current = controller;
    setExportState({ status: "loading", message: "" });

    try {
      const { startDate, endDate } = getMonthDateRange(selectedMonth);
      const query = new URLSearchParams({ startDate, endDate });
      const response = await authenticatedFetch(`/api/expenses?${query}`, {
        signal: controller.signal,
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          getSafeExportError({
            message: payload?.error,
            status: response.status,
          }),
        );
      }

      if (!Array.isArray(payload)) {
        throw new Error(EXPORT_ERROR);
      }

      const csv = createExpenseCsv(payload, formatDate, formatCurrency);
      const blob = new Blob(["\uFEFF", csv], {
        type: "text/csv;charset=utf-8",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = getExpenseCsvFilename(selectedMonth);
      link.click();
      URL.revokeObjectURL(url);

      if (!controller.signal.aborted) {
        setExportState({ status: "success", message: "" });
      }
    } catch (error) {
      if (controller.signal.aborted || error?.name === "AbortError") return;

      setExportState({
        status: "error",
        message: getSafeExportError({
          message: error instanceof Error ? error.message : "",
        }),
      });
    } finally {
      if (exportRequestRef.current === controller) {
        exportRequestRef.current = null;
      }
    }
  }, [selectedMonth]);

  const requestMonthAdvice = useCallback(async () => {
    if (!selectedMonth) return;

    adviceRequestRef.current?.abort();
    const controller = new AbortController();
    adviceRequestRef.current = controller;
    setAdviceState({ status: "loading", message: "" });

    try {
      const query = new URLSearchParams({ month: selectedMonth });
      const response = await authenticatedFetch(
        `/api/summary/advice?${query}`,
        { signal: controller.signal },
      );
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          getSafeSummaryError({
            message: payload?.error,
            status: response.status,
          }),
        );
      }

      if (!controller.signal.aborted) {
        setAdviceByMonth((prev) => ({ ...prev, [selectedMonth]: payload }));
        setAdviceState({ status: "success", message: "" });
      }
    } catch (error) {
      if (controller.signal.aborted || error?.name === "AbortError") return;

      setAdviceState({
        status: "error",
        message:
          error instanceof Error && error.message
            ? error.message
            : "Analisis AI belum dapat dimuat. Coba lagi.",
      });
    } finally {
      if (adviceRequestRef.current === controller) {
        adviceRequestRef.current = null;
      }
    }
  }, [selectedMonth]);

  const applySuggestedBudget = useCallback(
    async (action) => {
      if (!action?.category || !action?.suggestedAmount) return;

      setBudgetActionState({ status: "loading", message: "" });
      try {
        const response = await authenticatedFetch("/api/budgets", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            year: action.year,
            month: action.month,
            category: action.category,
            amount: action.suggestedAmount,
          }),
        });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(
            payload?.error || "Batas anggaran belum dapat disimpan.",
          );
        }

        setBudgetActionState({
          status: "success",
          message: `Batas anggaran ${action.category} (${formatCurrency(action.suggestedAmount)}/bulan) berhasil diterapkan.`,
        });
        await requestMonthAdvice();
      } catch (error) {
        setBudgetActionState({
          status: "error",
          message:
            error instanceof Error && error.message
              ? error.message
              : "Batas anggaran belum dapat disimpan. Coba lagi.",
        });
      }
    },
    [requestMonthAdvice],
  );

  useEffect(() => {
    fetchSummaryData();

    return () => {
      activeRequestRef.current?.abort();
      exportRequestRef.current?.abort();
      adviceRequestRef.current?.abort();
    };
  }, [fetchSummaryData]);

  const selectedMonthData = useMemo(
    () =>
      summaryData?.monthlyData.find((month) => month.key === selectedMonth) ||
      null,
    [selectedMonth, summaryData],
  );

  const selectedCategories = useMemo(() => {
    if (!summaryData || !selectedMonthData) return [];

    const selectedTotal = Number(selectedMonthData.total || 0);
    const categoryData = summaryData.categoryByMonth[selectedMonth];
    if (!Array.isArray(categoryData)) return [];

    return categoryData
      .map((category) => {
        const amount = Number(category.amount || 0);

        return {
          name: category.name || "Lainnya",
          amount,
          percentage:
            selectedTotal > 0 ? (amount / selectedTotal) * 100 : 0,
        };
      })
      .sort((first, second) => second.amount - first.amount);
  }, [selectedMonth, selectedMonthData, summaryData]);

  if (loadState.status === "loading") {
    return <MonthlySummarySkeleton />;
  }

  if (loadState.status === "error") {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 sm:px-0">
        <ErrorState
          title="Ringkasan belum dimuat"
          description={loadState.message}
          action={
            <Button variant="secondary" onClick={fetchSummaryData}>
              Coba lagi
            </Button>
          }
        />
      </div>
    );
  }

  if (!summaryData?.monthlyData.length) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 sm:px-0">
        <EmptyState
          icon={BarChart3}
          title="Belum ada data pengeluaran"
          description="Catat pengeluaran pertama untuk melihat ringkasan bulanan dan peringkat kategori."
          action={
            <Link href="/add" className="ui-button" data-variant="primary">
              <PlusCircle className="size-4" aria-hidden="true" />
              Tambah pengeluaran
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <MonthlySummary
      categories={selectedCategories}
      monthlyData={summaryData.monthlyData}
      selectedMonth={selectedMonth}
      selectedMonthData={selectedMonthData}
      onMonthChange={setSelectedMonth}
      onExport={exportSelectedMonth}
      isExporting={exportState.status === "loading"}
      exportError={exportState.status === "error" ? exportState.message : ""}
      advice={adviceByMonth[selectedMonth] || null}
      onRequestAdvice={requestMonthAdvice}
      isLoadingAdvice={adviceState.status === "loading"}
      adviceError={adviceState.status === "error" ? adviceState.message : ""}
      onApplyBudgetAction={applySuggestedBudget}
      isApplyingBudget={budgetActionState.status === "loading"}
      budgetActionFeedback={budgetActionState}
    />
  );
}
