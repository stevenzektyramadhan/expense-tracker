"use client";

import { Toaster } from "react-hot-toast";
import UpdatePrompt from "@/components/UpdatePrompt";

export default function AppClientProviders() {
  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#fff",
            color: "#363636",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
            borderRadius: "8px",
            padding: "12px 16px",
          },
          success: {
            iconTheme: {
              primary: "#22c55e",
              secondary: "#fff",
            },
          },
          error: {
            iconTheme: {
              primary: "#ef4444",
              secondary: "#fff",
            },
          },
        }}
      />
      <UpdatePrompt />
    </>
  );
}
