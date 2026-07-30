"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { authenticatedFetch } from "@/lib/authenticatedFetch";
import {
  createDashboardFilters,
  normalizeDashboardFilters,
  selectAvailableExpensePeriods,
  selectDashboardMetrics,
  selectFilteredTransactions,
} from "./dashboardSelectors";

const REQUEST_IDLE = "idle";
const REQUEST_LOADING = "loading";
const REQUEST_SUCCESS = "success";
const REQUEST_MISSING = "missing";
const REQUEST_ERROR = "error";

const createRequestState = (userId, status = REQUEST_IDLE, error = null) => ({
  userId,
  status,
  error,
});

const beginRequest = (requestRef) => {
  requestRef.current.controller?.abort();

  const sequence = requestRef.current.sequence + 1;
  const controller = new AbortController();
  requestRef.current = { sequence, controller };

  return { sequence, controller };
};

const cancelRequest = (requestRef) => {
  requestRef.current.controller?.abort();
  requestRef.current = {
    sequence: requestRef.current.sequence + 1,
    controller: null,
  };
};

const isCurrentRequest = (requestRef, sequence, controller) => {
  return (
    !controller.signal.aborted &&
    requestRef.current.sequence === sequence &&
    requestRef.current.controller === controller
  );
};

const isAbortedRequest = (error, controller) => {
  return controller.signal.aborted || error?.name === "AbortError";
};

const getErrorMessage = (error, fallback) => {
  return error instanceof Error && error.message ? error.message : fallback;
};

const getVisibleRequestState = (requestState, userId) => {
  if (!userId) {
    return { status: REQUEST_IDLE, error: null };
  }

  if (requestState.userId !== userId) {
    return { status: REQUEST_LOADING, error: null };
  }

  return {
    status: requestState.status,
    error: requestState.error,
  };
};

export default function useDashboardData({ userId }) {
  const [referenceDate] = useState(() => new Date());
  const [filters, setFilters] = useState(() =>
    createDashboardFilters(referenceDate)
  );

  const [allowanceResource, setAllowanceResource] = useState({
    userId: null,
    data: null,
  });
  const [expenseResource, setExpenseResource] = useState({
    userId: null,
    data: null,
  });
  const [incomeResource, setIncomeResource] = useState({
    userId: null,
    data: null,
  });

  const [allowanceRequest, setAllowanceRequest] = useState(() =>
    createRequestState(null)
  );
  const [expenseRequest, setExpenseRequest] = useState(() =>
    createRequestState(null)
  );
  const [incomeRequest, setIncomeRequest] = useState(() =>
    createRequestState(null)
  );

  const allowanceRequestRef = useRef({ sequence: 0, controller: null });
  const expenseRequestRef = useRef({ sequence: 0, controller: null });
  const incomeRequestRef = useRef({ sequence: 0, controller: null });

  const currentAllowancePeriod = useMemo(
    () => ({
      month: referenceDate.getMonth() + 1,
      year: referenceDate.getFullYear(),
    }),
    [referenceDate]
  );

  const loadAllowance = useCallback(async () => {
    if (!userId) return;

    const { sequence, controller } = beginRequest(allowanceRequestRef);
    setAllowanceRequest(createRequestState(userId, REQUEST_LOADING));

    try {
      const response = await authenticatedFetch("/api/allowances", {
        signal: controller.signal,
      });
      const payload = await response.json().catch(() => undefined);

      if (!isCurrentRequest(allowanceRequestRef, sequence, controller)) return;

      if (!response.ok) {
        throw new Error(payload?.error || "Gagal memuat uang saku");
      }

      if (payload === undefined) {
        throw new Error("Respons uang saku tidak valid");
      }

      if (payload === null) {
        setAllowanceResource({ userId, data: null });
        setAllowanceRequest(createRequestState(userId, REQUEST_MISSING));
        return;
      }

      if (typeof payload !== "object" || Array.isArray(payload)) {
        throw new Error("Respons uang saku tidak valid");
      }

      const amount = Number(payload.amount);
      const remaining = Number(payload.remaining);

      if (!Number.isFinite(amount) || !Number.isFinite(remaining)) {
        throw new Error("Respons uang saku tidak valid");
      }

      const normalizedAllowance = { ...payload, amount, remaining };

      setAllowanceResource({ userId, data: normalizedAllowance });
      setAllowanceRequest(createRequestState(userId, REQUEST_SUCCESS));
    } catch (error) {
      if (
        isAbortedRequest(error, controller) ||
        !isCurrentRequest(allowanceRequestRef, sequence, controller)
      ) {
        return;
      }

      console.error("Failed to load allowance", error);
      setAllowanceRequest(
        createRequestState(
          userId,
          REQUEST_ERROR,
          getErrorMessage(error, "Gagal memuat uang saku")
        )
      );
    }
  }, [userId]);

  const loadExpenses = useCallback(async () => {
    if (!userId) return;

    const { sequence, controller } = beginRequest(expenseRequestRef);
    setExpenseRequest(createRequestState(userId, REQUEST_LOADING));

    try {
      const response = await authenticatedFetch("/api/expenses", {
        signal: controller.signal,
      });
      const payload = await response.json().catch(() => null);

      if (!isCurrentRequest(expenseRequestRef, sequence, controller)) return;

      if (!response.ok) {
        throw new Error(payload?.error || "Gagal memuat pengeluaran");
      }

      if (!Array.isArray(payload)) {
        throw new Error("Respons pengeluaran tidak valid");
      }

      setExpenseResource({ userId, data: payload });
      setExpenseRequest(createRequestState(userId, REQUEST_SUCCESS));
    } catch (error) {
      if (
        isAbortedRequest(error, controller) ||
        !isCurrentRequest(expenseRequestRef, sequence, controller)
      ) {
        return;
      }

      setExpenseRequest(
        createRequestState(
          userId,
          REQUEST_ERROR,
          getErrorMessage(error, "Gagal memuat pengeluaran")
        )
      );
    }
  }, [userId]);

  const loadIncomes = useCallback(async () => {
    if (!userId) return;

    const { sequence, controller } = beginRequest(incomeRequestRef);
    setIncomeRequest(createRequestState(userId, REQUEST_LOADING));

    try {
      const response = await authenticatedFetch(
        `/api/incomes?month=${currentAllowancePeriod.month}&year=${currentAllowancePeriod.year}`,
        { signal: controller.signal }
      );
      const payload = await response.json().catch(() => null);

      if (!isCurrentRequest(incomeRequestRef, sequence, controller)) return;

      if (!response.ok) {
        throw new Error(payload?.error || "Gagal memuat pendapatan tambahan");
      }

      if (!Array.isArray(payload?.data)) {
        throw new Error("Respons pendapatan tambahan tidak valid");
      }

      setIncomeResource({ userId, data: payload.data });
      setIncomeRequest(createRequestState(userId, REQUEST_SUCCESS));
    } catch (error) {
      if (
        isAbortedRequest(error, controller) ||
        !isCurrentRequest(incomeRequestRef, sequence, controller)
      ) {
        return;
      }

      console.error("Failed to load incomes", error);
      setIncomeRequest(
        createRequestState(
          userId,
          REQUEST_ERROR,
          getErrorMessage(error, "Gagal memuat pendapatan tambahan")
        )
      );
    }
  }, [currentAllowancePeriod.month, currentAllowancePeriod.year, userId]);

  useEffect(() => {
    setFilters(createDashboardFilters(referenceDate));
  }, [referenceDate, userId]);

  useEffect(() => {
    if (!userId) {
      cancelRequest(allowanceRequestRef);
      setAllowanceResource({ userId: null, data: null });
      setAllowanceRequest(createRequestState(null));
      return undefined;
    }

    setAllowanceResource({ userId, data: null });
    loadAllowance();

    return () => cancelRequest(allowanceRequestRef);
  }, [loadAllowance, userId]);

  useEffect(() => {
    if (!userId) {
      cancelRequest(expenseRequestRef);
      setExpenseResource({ userId: null, data: null });
      setExpenseRequest(createRequestState(null));
      return undefined;
    }

    setExpenseResource({ userId, data: null });
    loadExpenses();

    return () => cancelRequest(expenseRequestRef);
  }, [loadExpenses, userId]);

  useEffect(() => {
    if (!userId) {
      cancelRequest(incomeRequestRef);
      setIncomeResource({ userId: null, data: null });
      setIncomeRequest(createRequestState(null));
      return undefined;
    }

    setIncomeResource({ userId, data: null });
    loadIncomes();

    return () => cancelRequest(incomeRequestRef);
  }, [loadIncomes, userId]);

  const visibleAllowanceRequest = getVisibleRequestState(
    allowanceRequest,
    userId
  );
  const visibleExpenseRequest = getVisibleRequestState(expenseRequest, userId);
  const visibleIncomeRequest = getVisibleRequestState(incomeRequest, userId);

  const allowance =
    allowanceResource.userId === userId ? allowanceResource.data : null;
  const expenses =
    expenseResource.userId === userId ? expenseResource.data : null;
  const additionalIncomes =
    incomeResource.userId === userId ? incomeResource.data : null;

  const updateFilters = useCallback(
    (nextFilters) => {
      setFilters((currentFilters) => {
        const resolvedFilters =
          typeof nextFilters === "function"
            ? nextFilters(currentFilters)
            : { ...currentFilters, ...nextFilters };

        return normalizeDashboardFilters(resolvedFilters, referenceDate);
      });
    },
    [referenceDate]
  );

  const filteredExpenses = useMemo(
    () =>
      visibleExpenseRequest.status === REQUEST_SUCCESS
        ? selectFilteredTransactions(expenses, filters)
        : [],
    [expenses, filters, visibleExpenseRequest.status]
  );

  const availableExpensePeriods = useMemo(
    () => selectAvailableExpensePeriods(expenses, referenceDate),
    [expenses, referenceDate]
  );

  const metrics = useMemo(
    () =>
      selectDashboardMetrics({
        allowance,
        additionalIncomes,
        expenses,
        filteredExpenses,
        allowanceStatus: visibleAllowanceRequest.status,
        incomeStatus: visibleIncomeRequest.status,
        expenseStatus: visibleExpenseRequest.status,
        referenceDate,
      }),
    [
      additionalIncomes,
      allowance,
      expenses,
      filteredExpenses,
      referenceDate,
      visibleAllowanceRequest.status,
      visibleExpenseRequest.status,
      visibleIncomeRequest.status,
    ]
  );

  const removeExpense = useCallback(
    (expenseId) => {
      setExpenseResource((currentResource) => {
        if (
          currentResource.userId !== userId ||
          !Array.isArray(currentResource.data)
        ) {
          return currentResource;
        }

        return {
          ...currentResource,
          data: currentResource.data.filter(
            (expense) => expense.id !== expenseId
          ),
        };
      });
    },
    [userId]
  );

  const replaceExpense = useCallback(
    (updatedExpense) => {
      setExpenseResource((currentResource) => {
        if (
          currentResource.userId !== userId ||
          !Array.isArray(currentResource.data)
        ) {
          return currentResource;
        }

        return {
          ...currentResource,
          data: currentResource.data.map((expense) =>
            expense.id === updatedExpense.id ? updatedExpense : expense
          ),
        };
      });
    },
    [userId]
  );

  const refreshDashboard = useCallback(() => {
    return Promise.all([loadAllowance(), loadExpenses(), loadIncomes()]);
  }, [loadAllowance, loadExpenses, loadIncomes]);

  return {
    allowance,
    expenses,
    additionalIncomes,
    filters,
    updateFilters,
    filteredExpenses,
    availableExpensePeriods,
    currentAllowancePeriod,
    metrics,
    requestState: {
      allowance: visibleAllowanceRequest,
      expenses: visibleExpenseRequest,
      incomes: visibleIncomeRequest,
    },
    refreshAllowance: loadAllowance,
    refreshExpenses: loadExpenses,
    refreshIncomes: loadIncomes,
    refreshDashboard,
    removeExpense,
    replaceExpense,
  };
}
