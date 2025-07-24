"use client";
import { useState } from "react";

export default function DashboardFilters({ categories, onFilterChange }) {
  const [month, setMonth] = useState("");
  const [category, setCategory] = useState("");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("date-desc");

  const handleChange = (field, value) => {
    if (field === "month") setMonth(value);
    if (field === "category") setCategory(value);
    if (field === "search") setSearch(value);
    if (field === "sort") setSort(value);

    onFilterChange({
      month: field === "month" ? value : month,
      category: field === "category" ? value : category,
      search: field === "search" ? value : search,
      sort: field === "sort" ? value : sort,
    });
  };

  return (
    <div className="bg-white p-4 rounded-lg text-black shadow flex flex-wrap gap-4">
      {/* Filter Bulan */}
      <select className="border px-2 py-1 rounded" value={month} onChange={(e) => handleChange("month", e.target.value)}>
        <option value="">Semua Bulan</option>
        {["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"].map((name, idx) => {
          const monthVal = String(idx + 1).padStart(2, "0");
          return (
            <option key={monthVal} value={monthVal}>
              {name}
            </option>
          );
        })}
      </select>

      {/* Filter Kategori */}
      <select className="border px-2 py-1 rounded" value={category} onChange={(e) => handleChange("category", e.target.value)}>
        <option value="">Semua Kategori</option>
        {categories.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>

      {/* Search */}
      <input type="text" placeholder="Cari deskripsi..." className="border px-2 py-1 rounded flex-1" value={search} onChange={(e) => handleChange("search", e.target.value)} />

      {/* Sort */}
      <select className="border px-2 py-1 rounded" value={sort} onChange={(e) => handleChange("sort", e.target.value)}>
        <option value="date-desc">Tanggal terbaru</option>
        <option value="date-asc">Tanggal terlama</option>
        <option value="amount-desc">Jumlah terbesar</option>
        <option value="amount-asc">Jumlah terkecil</option>
      </select>
    </div>
  );
}
