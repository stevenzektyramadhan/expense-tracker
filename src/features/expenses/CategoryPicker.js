// Hallmark · component: category picker · Calm Ledger · controlled presentation only
import FormField from "@/components/ui/FormField";
import { DEFAULT_EXPENSE_CATEGORIES } from "@/lib/finance";

export default function CategoryPicker({
  category,
  categoryRef,
  disabled,
  error,
  frequentCategories = [],
  onChoiceChange,
  onCustomChange,
}) {
  return (
    <section className="bg-[var(--color-surface)] p-4 sm:p-5">
      <FormField
        id="expense-category"
        label="Kategori"
        required
        error={error}
        helperText="Pilih kategori yang paling sesuai."
      >
        <select
          ref={categoryRef}
          name="category"
          value={category.choice}
          onChange={(event) => onChoiceChange(event.target.value)}
          disabled={disabled}
          className="scroll-mb-48"
        >
          {DEFAULT_EXPENSE_CATEGORIES.map((categoryName) => (
            <option key={categoryName} value={categoryName}>
              {categoryName}
            </option>
          ))}
        </select>
      </FormField>

      {frequentCategories.length > 0 ? (
        <div className="mt-3" role="group" aria-label="Kategori yang sering digunakan">
          <p className="mb-2 text-sm font-semibold text-[var(--color-text)]">
            Sering digunakan
          </p>
          <div className="flex flex-wrap gap-2">
            {frequentCategories.map((categoryName) => (
              <button
                key={categoryName}
                type="button"
                aria-pressed={category.choice === categoryName}
                disabled={disabled}
                onClick={() => onChoiceChange(categoryName)}
                className="min-h-11 rounded-[var(--radius-pill)] border border-[var(--color-border-strong)] bg-[var(--color-surface-raised)] px-3 text-sm font-semibold text-[var(--color-text)] transition-colors hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-soft)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)] active:bg-[var(--color-primary-soft)] disabled:cursor-not-allowed disabled:opacity-60 aria-pressed:border-[var(--color-primary)] aria-pressed:bg-[var(--color-primary-soft)] aria-pressed:text-[var(--color-primary-strong)]"
              >
                {categoryName}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {category.choice === "Lainnya" ? (
        <div className="mt-2">
          <FormField
            id="expense-custom-category"
            label="Nama kategori lain"
            helperText="Kosongkan untuk menyimpan sebagai Lainnya."
          >
            <input
              type="text"
              name="customCategory"
              value={category.custom}
              onChange={(event) => onCustomChange(event.target.value)}
              disabled={disabled}
              autoComplete="off"
              placeholder="Contoh: Pendidikan"
              className="scroll-mb-48"
            />
          </FormField>
        </div>
      ) : null}
    </section>
  );
}
