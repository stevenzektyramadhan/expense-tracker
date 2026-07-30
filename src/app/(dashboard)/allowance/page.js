"use client";

import { useState } from "react";

import Button from "@/components/ui/Button";
import FormField from "@/components/ui/FormField";
import StatusBanner from "@/components/ui/StatusBanner";
import { useAuth } from "@/hooks/useAuth";
import { authenticatedFetch } from "@/lib/authenticatedFetch";
import { formatRupiah, parseRupiah } from "@/lib/utils";

export default function AllowancePage() {
  const { user } = useAuth();
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [amountError, setAmountError] = useState("");
  const [formError, setFormError] = useState("");
  const [saved, setSaved] = useState(false);

  const handleSave = async (event) => {
    event.preventDefault();
    if (!user) return;

    const parsedAmount = parseRupiah(amount);
    if (parsedAmount <= 0) {
      setAmountError("Nominal belum valid. Masukkan jumlah lebih dari Rp0.");
      return;
    }

    setLoading(true);
    setFormError("");
    setSaved(false);
    try {
      const response = await authenticatedFetch("/api/allowances", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: parsedAmount,
          frequency: "monthly",
        }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.error || "Gagal menyimpan uang saku");
      }

      setSaved(true);
    } catch (error) {
      setFormError(
        error.message || "Uang saku belum dapat disimpan. Coba lagi.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto grid w-full max-w-xl gap-5 px-4 sm:px-0">
      <header>
        <h1 className="font-[family-name:var(--font-display-family)] text-2xl font-bold tracking-[-0.025em]">
          Atur uang saku bulanan
        </h1>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">
          Nominal ini menjadi dasar saldo sebelum pendapatan tambahan.
        </p>
      </header>

      <form
        className="grid gap-4 rounded-[var(--radius-prominent)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-[var(--elevation-1)] sm:p-5"
        onSubmit={handleSave}
      >
        {formError ? (
          <StatusBanner tone="error" title="Uang saku belum tersimpan">
            {formError}
          </StatusBanner>
        ) : null}
        {saved ? (
          <StatusBanner tone="success" title="Uang saku tersimpan">
            Ringkasan saldo akan memakai nominal terbaru.
          </StatusBanner>
        ) : null}

        <FormField
          label="Nominal bulanan"
          id="allowance-page-amount"
          required
          error={amountError}
        >
          <input
            type="text"
            inputMode="numeric"
            value={amount}
            onChange={(event) => {
              const numericValue = parseRupiah(event.target.value);
              setAmount(numericValue > 0 ? formatRupiah(numericValue) : "");
              if (amountError) setAmountError("");
              if (formError) setFormError("");
              if (saved) setSaved(false);
            }}
            placeholder="Rp0"
            disabled={loading}
          />
        </FormField>

        <Button
          type="submit"
          fullWidth
          isLoading={loading}
          loadingLabel="Menyimpan…"
        >
          Simpan uang saku
        </Button>
      </form>
    </div>
  );
}
