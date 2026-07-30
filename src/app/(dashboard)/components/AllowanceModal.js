"use client";

import { useEffect, useRef, useState } from "react";

import Button from "@/components/ui/Button";
import Dialog from "@/components/ui/Dialog";
import FormField from "@/components/ui/FormField";
import StatusBanner from "@/components/ui/StatusBanner";
import { authenticatedFetch } from "@/lib/authenticatedFetch";
import { formatRupiah, parseRupiah } from "@/lib/utils";

export default function AllowanceModal({
  isOpen,
  onClose,
  onSaved,
  initialAmount = 0,
  initialFrequency = "monthly",
}) {
  const [displayAmount, setDisplayAmount] = useState("");
  const [frequency, setFrequency] = useState("monthly");
  const [loading, setLoading] = useState(false);
  const [amountError, setAmountError] = useState("");
  const [formError, setFormError] = useState("");
  const amountInputRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    setDisplayAmount(initialAmount > 0 ? formatRupiah(initialAmount) : "");
    setFrequency(initialFrequency || "monthly");
    setAmountError("");
    setFormError("");
  }, [initialAmount, initialFrequency, isOpen]);

  const handleAmountChange = (event) => {
    const numericValue = parseRupiah(event.target.value);
    setDisplayAmount(numericValue > 0 ? formatRupiah(numericValue) : "");
    if (amountError) setAmountError("");
    if (formError) setFormError("");
  };

  const handleSave = async (event) => {
    event.preventDefault();
    const numericAmount = parseRupiah(displayAmount);

    if (numericAmount <= 0) {
      setAmountError("Nominal belum valid. Masukkan jumlah lebih dari Rp0.");
      return;
    }

    setLoading(true);
    setFormError("");

    try {
      const response = await authenticatedFetch("/api/allowances", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: numericAmount,
          frequency,
        }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.error || "Uang saku belum dapat disimpan.");
      }

      onSaved();
      onClose();
    } catch (error) {
      console.error("Error saving allowance:", error.message);
      setFormError(
        error.message || "Uang saku belum dapat disimpan. Coba lagi.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      preventClose={loading}
      initialFocusRef={amountInputRef}
      size="sm"
      title="Atur uang saku"
      description="Nominal ini menjadi dasar saldo untuk periode yang dipilih."
      footer={
        <>
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={loading}
          >
            Batal
          </Button>
          <Button
            type="submit"
            form="allowance-form"
            isLoading={loading}
            loadingLabel="Menyimpan…"
          >
            Simpan uang saku
          </Button>
        </>
      }
    >
      <form id="allowance-form" className="grid gap-3" onSubmit={handleSave}>
        {formError ? (
          <StatusBanner tone="error" title="Uang saku belum tersimpan">
            {formError}
          </StatusBanner>
        ) : null}

        <FormField
          label="Nominal"
          id="allowance-amount"
          required
          error={amountError}
          helperText="Masukkan jumlah sebelum pendapatan tambahan."
        >
          <input
            ref={amountInputRef}
            type="text"
            inputMode="numeric"
            value={displayAmount}
            onChange={handleAmountChange}
            placeholder="Rp0"
            disabled={loading}
          />
        </FormField>

        <FormField label="Periode" id="allowance-frequency" required>
          <select
            value={frequency}
            onChange={(event) => {
              setFrequency(event.target.value);
              if (formError) setFormError("");
            }}
            disabled={loading}
          >
            <option value="monthly">Bulanan</option>
            <option value="weekly">Mingguan</option>
          </select>
        </FormField>
      </form>
    </Dialog>
  );
}
