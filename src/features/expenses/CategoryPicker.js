// Hallmark · component: category picker · Calm Ledger · controlled presentation only
import FormField from "@/components/ui/FormField";
import { DEFAULT_EXPENSE_CATEGORIES } from "@/lib/finance";

export default function CategoryPicker({
  category,
  categoryRef,
  disabled,
  error,
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
