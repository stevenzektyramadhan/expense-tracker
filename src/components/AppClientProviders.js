"use client";

import { Toaster } from "react-hot-toast";
import UpdatePrompt from "@/components/UpdatePrompt";

export default function AppClientProviders() {
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
      <UpdatePrompt />
    </>
  );
}
