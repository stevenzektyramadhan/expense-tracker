"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { authenticatedFetch } from "@/lib/authenticatedFetch";
import { getOwnedBudgetData } from "./categoryBudgetPresentation";

const createRequest = (status = "idle", error = null) => ({ status, error });

const getErrorMessage = (error, fallback) =>
  error instanceof Error && error.message ? error.message : fallback;

export default function useCategoryBudgets({
  month,
  year,
  userId,
  expenseRevision = "",
}) {
  const [budgetResource, setBudgetResource] = useState({
    userId: null,
    data: null,
  });
  const [request, setRequest] = useState(createRequest());
  const [mutation, setMutation] = useState(createRequest());
  const requestRef = useRef({ controller: null, sequence: 0 });
  const mutationInFlightRef = useRef(false);
  const lastRevisionRef = useRef(expenseRevision);

  const loadBudgets = useCallback(
    async ({ preserveExisting = false } = {}) => {
      if (!userId) return;

      requestRef.current.controller?.abort();
      const controller = new AbortController();
      const sequence = requestRef.current.sequence + 1;
      requestRef.current = { controller, sequence };
      if (!preserveExisting) {
        setRequest(createRequest("loading"));
      }

      try {
        const response = await authenticatedFetch(
          `/api/budgets?month=${month}&year=${year}`,
          { signal: controller.signal },
        );
        const payload = await response.json().catch(() => null);

        if (
          controller.signal.aborted ||
          requestRef.current.sequence !== sequence
        ) {
          return;
        }

        if (!response.ok) {
          throw new Error(payload?.error || "Gagal memuat anggaran kategori.");
        }

        if (!Array.isArray(payload?.data)) {
          throw new Error("Respons anggaran kategori tidak valid.");
        }

        setBudgetResource({ userId, data: payload.data });
        setRequest(createRequest("success"));
      } catch (error) {
        if (
          controller.signal.aborted ||
          requestRef.current.sequence !== sequence ||
          error?.name === "AbortError"
        ) {
          return;
        }

        console.error("Failed to load category budgets", error);
        setRequest(
          createRequest(
            "error",
            getErrorMessage(error, "Gagal memuat anggaran kategori."),
          ),
        );
      }
    },
    [month, userId, year],
  );

  useEffect(() => {
    setBudgetResource({ userId, data: null });
    setMutation(createRequest());
    lastRevisionRef.current = expenseRevision;

    if (!userId) {
      requestRef.current.controller?.abort();
      setRequest(createRequest());
      return undefined;
    }

    loadBudgets();
    return () => requestRef.current.controller?.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadBudgets, userId]);

  useEffect(() => {
    if (!userId) return;
    if (lastRevisionRef.current === expenseRevision) return;
    lastRevisionRef.current = expenseRevision;
    loadBudgets({ preserveExisting: true });
  }, [expenseRevision, loadBudgets, userId]);

  const saveBudget = useCallback(
    async ({ category, amount }) => {
      if (mutationInFlightRef.current) return;
      mutationInFlightRef.current = true;
      setMutation(createRequest("loading"));

      try {
        const response = await authenticatedFetch("/api/budgets", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ month, year, category, amount }),
        });
        const payload = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(payload?.error || "Anggaran belum dapat disimpan.");
        }

        await loadBudgets();
        setMutation(createRequest("success"));
        return payload;
      } catch (error) {
        const message = getErrorMessage(
          error,
          "Anggaran belum dapat disimpan. Coba lagi.",
        );
        setMutation(createRequest("error", message));
        throw new Error(message);
      } finally {
        mutationInFlightRef.current = false;
      }
    },
    [loadBudgets, month, year],
  );

  const deleteBudget = useCallback(
    async (id) => {
      if (mutationInFlightRef.current) return;
      mutationInFlightRef.current = true;
      setMutation(createRequest("loading"));

      try {
        const response = await authenticatedFetch("/api/budgets", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        });
        const payload = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(payload?.error || "Anggaran belum dapat dihapus.");
        }

        await loadBudgets();
        setMutation(createRequest("success"));
      } catch (error) {
        const message = getErrorMessage(
          error,
          "Anggaran belum dapat dihapus. Coba lagi.",
        );
        setMutation(createRequest("error", message));
        throw new Error(message);
      } finally {
        mutationInFlightRef.current = false;
      }
    },
    [loadBudgets],
  );

  return {
    budgets: getOwnedBudgetData(budgetResource, userId),
    deleteBudget,
    isMutating: mutation.status === "loading",
    mutationError: mutation.status === "error" ? mutation.error : null,
    loadBudgets,
    request,
    saveBudget,
  };
}
