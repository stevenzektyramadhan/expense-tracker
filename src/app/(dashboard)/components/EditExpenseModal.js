"use client";

import { useRef, useState } from "react";

import Button from "@/components/ui/Button";
import Dialog from "@/components/ui/Dialog";
import FormField from "@/components/ui/FormField";
import StatusBanner from "@/components/ui/StatusBanner";
import CategorySelect from "./CategorySelect";
import { authenticatedFetch } from "@/lib/authenticatedFetch";
import { formatDateForInput } from "@/lib/utils";

export default function EditExpenseModal({ expense, onClose, onUpdate }) {
  const [selectedCategory, setSelectedCategory] = useState(
    expense.category || "Makanan",
  );
  const [customCategory, setCustomCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [amountError, setAmountError] = useState("");
  const [formError, setFormError] = useState("");
  const amountInputRef = useRef(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const amount = Number(event.currentTarget.amount.value);

    if (!Number.isFinite(amount) || amount <= 0) {
      setAmountError("Jumlah belum valid. Masukkan nominal lebih dari Rp0.");
      return;
    }

    // kalau pilih Lainnya + isi kategori custom
    const categoryToSave =
      selectedCategory === "Lainnya" && customCategory.trim() !== ""
        ? customCategory.trim()
        : selectedCategory;

    const updatedData = {
      amount,
      category: categoryToSave, // ✅ pakai ini, bukan dari FormData
      date: event.currentTarget.date.value,
      description: event.currentTarget.description.value,
    };

    setAmountError("");
    setFormError("");
    setLoading(true);

    try {
      const response = await authenticatedFetch("/api/expenses", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: expense.id,
          ...updatedData,
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Gagal update pengeluaran");
      }

      onUpdate(payload);
      onClose();
    } catch (error) {
      setFormError(
        error.message || "Perubahan belum dapat disimpan. Coba lagi.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open
      onClose={onClose}
      preventClose={loading}
      initialFocusRef={amountInputRef}
      title="Edit pengeluaran"
      description="Perubahan jumlah atau tanggal dapat menyesuaikan sisa uang saku."
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
            form="edit-expense-form"
            isLoading={loading}
            loadingLabel="Menyimpan…"
          >
            Simpan perubahan
          </Button>
        </>
      }
    >
      <form
        id="edit-expense-form"
        onSubmit={handleSubmit}
        className="grid gap-3"
      >
        {formError ? (
          <StatusBanner tone="error" title="Perubahan belum tersimpan">
            {formError}
          </StatusBanner>
        ) : null}

        <FormField
          label="Jumlah"
          id="edit-expense-amount"
          required
          error={amountError}
        >
          <input
            ref={amountInputRef}
            type="number"
            name="amount"
            defaultValue={expense.amount}
            min="1"
            step="1"
            inputMode="numeric"
            onChange={() => {
              if (amountError) setAmountError("");
              if (formError) setFormError("");
            }}
            disabled={loading}
          />
        </FormField>

        <CategorySelect
          id="edit-expense-category"
          value={selectedCategory}
          onChange={setSelectedCategory}
          customValue={customCategory}
          onCustomChange={setCustomCategory}
          disabled={loading}
        />

        <FormField label="Tanggal" id="edit-expense-date" required>
          <input
            type="date"
            name="date"
            defaultValue={formatDateForInput(expense.date)}
            required
            disabled={loading}
          />
        </FormField>

        <FormField
          label="Catatan"
          id="edit-expense-description"
          helperText="Opsional. Tambahkan konteks singkat untuk transaksi ini."
        >
          <textarea
            name="description"
            defaultValue={expense.description || ""}
            maxLength={500}
            disabled={loading}
          />
        </FormField>
      </form>
    </Dialog>
  );
}
