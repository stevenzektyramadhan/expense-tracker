"use client";

import { useState, useEffect } from "react";
import { DEFAULT_EXPENSE_CATEGORIES } from "@/lib/finance";

export default function CategorySelect({ value, onChange, customValue, onCustomChange }) {
  const [showCustomInput, setShowCustomInput] = useState(value === "Lainnya");

  useEffect(() => {
    setShowCustomInput(value === "Lainnya");
  }, [value]);

  return (
    <div>
      <label className="block text-sm font-medium mb-1">Kategori</label>

      {/* Dropdown */}
      <select name="category" value={value} onChange={(e) => onChange(e.target.value)} className="w-full max-w-full border rounded px-2 py-1 bg-white">
        {DEFAULT_EXPENSE_CATEGORIES.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </select>

      {/* Custom kategori muncul jika pilih Lainnya */}
      {showCustomInput && <input type="text" placeholder="Tulis kategori lain..." className="mt-2 w-full border rounded px-2 py-1" value={customValue} onChange={(e) => onCustomChange(e.target.value)} />}
    </div>
  );
}
