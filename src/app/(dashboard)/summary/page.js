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

const SUMMARY_LOAD_ERROR =
  "Ringkasan belum dapat dimuat. Periksa koneksi lalu coba lagi.";
const SUMMARY_AUTH_ERROR =
  "Sesi Anda berakhir. Masuk kembali lalu coba lagi.";

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

  useEffect(() => {
    fetchSummaryData();

    return () => {
      activeRequestRef.current?.abort();
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
    />
  );
}
