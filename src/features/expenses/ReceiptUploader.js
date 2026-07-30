"use client";

// Hallmark · component: receipt uploader · Calm Ledger · local preview without server cleanup claims
import { useEffect, useRef } from "react";
import Image from "next/image";
import { ImagePlus, Trash2 } from "lucide-react";
import Button from "@/components/ui/Button";

export default function ReceiptUploader({
  compressionWarning,
  disabled,
  error,
  onRemove,
  onSelect,
  previewUrl,
  receipt,
}) {
  const inputRef = useRef(null);
  const helpId = "expense-receipt-help";
  const errorId = "expense-receipt-error";

  useEffect(() => {
    if (!receipt && inputRef.current) {
      inputRef.current.value = "";
    }
  }, [receipt]);

  const handleChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!onSelect(file)) {
      event.target.value = "";
    }
  };

  const handleRemove = () => {
    if (inputRef.current) {
      inputRef.current.value = "";
    }
    onRemove();
  };

  return (
    <div className="min-w-0">
      <div className="flex flex-col gap-2">
        <label
          htmlFor="expense-receipt"
          className="text-sm font-semibold text-[var(--color-text)]"
        >
          Struk
        </label>
        <p
          id={helpId}
          className="text-sm leading-5 text-[var(--color-text-muted)]"
        >
          Gambar opsional, maksimal 15 MB sebelum diproses.
        </p>
      </div>

      <input
        ref={inputRef}
        id="expense-receipt"
        type="file"
        accept="image/*"
        onChange={handleChange}
        disabled={disabled}
        aria-describedby={`${helpId} ${errorId}`}
        aria-invalid={Boolean(error) || undefined}
        className="sr-only"
      />

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="secondary"
          onClick={() => inputRef.current?.click()}
          disabled={disabled}
        >
          <ImagePlus className="size-4" aria-hidden="true" />
          {receipt ? "Ganti struk" : "Pilih struk"}
        </Button>

        {receipt ? (
          <Button
            type="button"
            variant="quiet"
            onClick={handleRemove}
            disabled={disabled}
          >
            <Trash2 className="size-4" aria-hidden="true" />
            Hapus struk
          </Button>
        ) : null}
      </div>

      <p
        id={errorId}
        className="mt-1 min-h-5 text-sm leading-5 text-[var(--color-expense-strong)]"
        role={error ? "alert" : undefined}
      >
        {error || <span aria-hidden="true">&nbsp;</span>}
      </p>

      {receipt && previewUrl ? (
        <figure className="mt-2 grid min-w-0 grid-cols-[5rem_minmax(0,1fr)] items-center gap-3 rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-surface-subtle)] p-3">
          <div className="relative aspect-square overflow-hidden rounded-[var(--radius-control)] bg-[var(--color-surface)]">
            <Image
              src={previewUrl}
              alt={`Pratinjau struk ${receipt.name}`}
              fill
              sizes="80px"
              unoptimized
              className="object-cover"
            />
          </div>
          <figcaption className="min-w-0">
            <span className="block break-words text-sm font-semibold text-[var(--color-text)]">
              {receipt.name}
            </span>
            <span className="mt-1 block text-xs text-[var(--color-text-muted)]">
              Struk akan diunggah saat pengeluaran disimpan.
            </span>
          </figcaption>
        </figure>
      ) : null}

      {compressionWarning ? (
        <p
          className="mt-3 rounded-[var(--radius-control)] bg-[var(--color-warning-soft)] px-3 py-2 text-sm text-[var(--color-warning-strong)]"
          role="status"
        >
          {compressionWarning}
        </p>
      ) : null}
    </div>
  );
}
