// Hallmark · component: expense amount field · Calm Ledger · prominent editable IDR
import FormField from "@/components/ui/FormField";
import { formatRupiah } from "@/lib/utils";

export default function ExpenseAmountField({
  disabled,
  error,
  inputRef,
  onChange,
  value,
}) {
  return (
    <section className="rounded-[var(--radius-prominent)] border border-[var(--color-border)] bg-[var(--color-primary-soft)] p-4 shadow-[var(--elevation-1)] sm:p-5">
      <FormField
        id="expense-amount"
        label="Jumlah"
        required
        error={error}
        helperText="Masukkan nominal pengeluaran."
      >
        <input
          ref={inputRef}
          type="text"
          name="amount"
          value={formatRupiah(value)}
          onChange={onChange}
          inputMode="numeric"
          enterKeyHint="next"
          autoComplete="off"
          disabled={disabled}
          placeholder="Rp 0"
          className="min-h-16 scroll-mb-48 bg-[var(--color-surface)] px-4 font-[family-name:var(--font-display-family)] text-[clamp(2rem,9vw,3rem)] font-bold leading-none tracking-[-0.04em] [font-feature-settings:'tnum'_1,'lnum'_1] [font-variant-numeric:tabular-nums_lining-nums]"
        />
      </FormField>
    </section>
  );
}
