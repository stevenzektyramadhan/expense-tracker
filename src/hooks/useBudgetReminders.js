"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  getBudgetReminderDecision,
  getBudgetReminderStorageKeys,
  isBudgetReminderOptedIn,
} from "@/features/dashboard/budgetReminderState";

const readSentKeys = (storage, userId) => {
  try {
    const value = storage.getItem(getBudgetReminderStorageKeys(userId).sent);
    const parsed = value ? JSON.parse(value) : [];
    return Array.isArray(parsed) ? parsed.filter((key) => typeof key === "string") : [];
  } catch {
    return [];
  }
};

const writeSentKey = (storage, userId, key) => {
  try {
    const keys = readSentKeys(storage, userId);
    if (!keys.includes(key)) {
      storage.setItem(
        getBudgetReminderStorageKeys(userId).sent,
        JSON.stringify([...keys, key]),
      );
    }
  } catch {
    return;
  }
};

export default function useBudgetReminders({
  budgets,
  month,
  requestStatus,
  userId,
  year,
}) {
  const [environment, setEnvironment] = useState({
    optedIn: false,
    permission: "default",
    supported: false,
  });
  const [isEnabling, setIsEnabling] = useState(false);
  const inFlightKeys = useRef(new Set());

  useEffect(() => {
    let storage;
    let supported = false;
    try {
      storage =
        typeof window !== "undefined" &&
        "Notification" in window &&
        "serviceWorker" in navigator
          ? window.localStorage
          : null;
      supported = Boolean(storage);
    } catch {
      supported = false;
    }

    if (!supported || !userId) {
      setEnvironment({ optedIn: false, permission: "default", supported });
      return;
    }

    setEnvironment({
      optedIn: isBudgetReminderOptedIn(storage, userId),
      permission: window.Notification.permission,
      supported: true,
    });
  }, [userId]);

  const enable = useCallback(async () => {
    if (
      !environment.supported ||
      requestStatus !== "success" ||
      !userId ||
      isEnabling
    ) return false;
    setIsEnabling(true);

    try {
      const permission = await window.Notification.requestPermission();
      if (permission !== "granted") {
        setEnvironment((current) => ({ ...current, permission }));
        return false;
      }

      window.localStorage.setItem(
        getBudgetReminderStorageKeys(userId).optIn,
        "enabled",
      );
      setEnvironment({ optedIn: true, permission, supported: true });
      return true;
    } catch {
      return false;
    } finally {
      setIsEnabling(false);
    }
  }, [environment.supported, isEnabling, requestStatus, userId]);

  const stop = useCallback(() => {
    try {
      if (!userId || typeof window === "undefined") return;
      const storage = window.localStorage;
      const keys = getBudgetReminderStorageKeys(userId);
      storage.removeItem(keys.optIn);
      storage.removeItem(keys.sent);
    } catch {
      return;
    }
    setEnvironment((current) => ({ ...current, optedIn: false }));
    inFlightKeys.current.clear();
  }, [userId]);

  useEffect(() => {
    if (
      !environment.supported ||
      !environment.optedIn ||
      environment.permission !== "granted" ||
      requestStatus !== "success" ||
      !userId ||
      !Array.isArray(budgets)
    ) {
      return undefined;
    }

    let disposed = false;
    const storage = window.localStorage;
    const sentKeys = readSentKeys(storage, userId);

    const notify = async () => {
      try {
        const registration = await navigator.serviceWorker.ready;
        if (disposed) return;

        for (const budget of budgets) {
          const decision = getBudgetReminderDecision({
            budgets: [budget],
            month,
            optedIn: true,
            permission: "granted",
            requestStatus: "success",
            sentKeys,
            supported: true,
            userId,
            year,
          });
          if (!decision.eligible || inFlightKeys.current.has(decision.key)) continue;

          inFlightKeys.current.add(decision.key);
          try {
            await registration.showNotification(decision.title, {
              body: decision.body,
              tag: decision.tag,
            });
            writeSentKey(storage, userId, decision.key);
          } catch {
            inFlightKeys.current.delete(decision.key);
          }
        }
      } catch {
        return;
      }
    };

    notify();
    return () => {
      disposed = true;
    };
  }, [budgets, environment.optedIn, environment.permission, environment.supported, month, requestStatus, userId, year]);

  return {
    enable,
    isEnabling,
    isSupported: environment.supported,
    optedIn: environment.optedIn,
    permission: environment.permission,
    stop,
  };
}
