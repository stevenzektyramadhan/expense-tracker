"use client";

import { useId } from "react";

import FormField from "@/components/ui/FormField";
import { DEFAULT_EXPENSE_CATEGORIES } from "@/lib/finance";

export default function CategorySelect({
  customValue,
  disabled = false,
  id,
  onChange,
  onCustomChange,
  value,
}) {
  const generatedId = useId();
  const controlId = id || `${generatedId}-category`;
  const showCustomInput = value === "Lainnya";

  return (
    <div className="grid gap-2">
      <FormField label="Kategori" id={controlId} required>
        <select
          name="category"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          disabled={disabled}
        >
        {DEFAULT_EXPENSE_CATEGORIES.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
        </select>
      </FormField>

      {showCustomInput ? (
        <FormField
          label="Nama kategori"
          id={`${controlId}-custom`}
          required
          helperText="Gunakan nama yang singkat dan mudah dikenali."
        >
          <input
            type="text"
            value={customValue}
            onChange={(event) => onCustomChange(event.target.value)}
            placeholder="Contoh: Kesehatan"
            maxLength={80}
            disabled={disabled}
          />
        </FormField>
      ) : null}
    </div>
  );
}
