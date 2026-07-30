"use client";

/* Hallmark · pre-emit critique: P5 H5 E5 S5 R5 V5
 * Hallmark · genre: modern-minimal · macrostructure: focused form · design-system: Calm Ledger · designed-as-app
 */
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import IncomeForm, {
  getIncomeRequestError,
} from "@/features/income/IncomeForm";
import { authenticatedFetch } from "@/lib/authenticatedFetch";

const getExistingDefaultDate = () => new Date().toISOString().split("T")[0];

export default function AddIncomePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const initialValues = useMemo(
    () => ({
      amount: "",
      source: "",
      note: "",
      date: getExistingDefaultDate(),
    }),
    [],
  );

  const handleCreate = async (values) => {
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      const response = await authenticatedFetch("/api/incomes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw getIncomeRequestError({
          status: response.status,
          message: payload.error,
          fallback: "Pendapatan belum dapat disimpan. Coba lagi.",
        });
      }

      toast.success("Pendapatan tambahan berhasil disimpan.");
      router.push("/income");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-3xl min-w-0 px-4 sm:px-0">
      <header className="mb-5 min-w-0">
        <h1 className="sr-only min-w-0 font-[family-name:var(--font-display-family)] text-2xl font-bold tracking-[-0.025em] [overflow-wrap:anywhere] md:not-sr-only">
          Tambah pendapatan
        </h1>
        <p className="text-sm text-[var(--color-text-muted)] md:mt-1">
          Catat uang yang menambah saldo dan pilih periode penerimanya.
        </p>
      </header>

      <IncomeForm
        initialValues={initialValues}
        isSubmitting={isSubmitting}
        onSubmit={handleCreate}
        onCancel={() => router.push("/income")}
      />
    </div>
  );
}
