"use client";

import { useEffect } from "react";
import { Toaster } from "react-hot-toast";
import OfflineBanner from "@/components/OfflineBanner";
import UpdatePrompt from "@/components/UpdatePrompt";

export default function AppClientProviders() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        console.error("Service worker registration failed.");
      });
    }
  }, []);

  return (
    <>
      <Toaster
        position="top-center"
        containerStyle={{
          top: "max(var(--space-md), env(safe-area-inset-top))",
          zIndex: "var(--z-toast)",
        }}
        toastOptions={{
          duration: 4000,
          style: {
            background: "var(--color-surface)",
            color: "var(--color-text)",
            border: "1px solid var(--color-border)",
            boxShadow: "var(--elevation-2)",
            borderRadius: "var(--radius-surface)",
            padding: "var(--space-sm) var(--space-md)",
            fontFamily: "var(--font-body)",
          },
          success: {
            iconTheme: {
              primary: "var(--color-income-strong)",
              secondary: "var(--color-surface)",
            },
          },
          error: {
            iconTheme: {
              primary: "var(--color-expense-strong)",
              secondary: "var(--color-surface)",
            },
          },
        }}
      />
      <OfflineBanner />
      <UpdatePrompt />
    </>
  );
}
