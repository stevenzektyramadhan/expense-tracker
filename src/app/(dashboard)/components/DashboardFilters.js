"use client";

export default function DashboardFilters({
  categories,
  filters,
  currentYear,
  onFilterChange,
}) {
  const month =
    filters.period === "all"
      ? ""
      : String(filters.month).padStart(2, "0");

  const handleChange = (field, value) => {
    if (field === "month") {
      onFilterChange({
        ...filters,
        period: value ? "month" : "all",
        month: value ? Number(value) : filters.month,
        year: value ? currentYear : filters.year,
      });
      return;
    }

    onFilterChange({
      ...filters,
      [field]: value,
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
      <select className="border px-2 py-1 rounded" value={filters.category} onChange={(e) => handleChange("category", e.target.value)}>
        <option value="">Semua Kategori</option>
        {categories.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>

      {/* Search */}
      <input type="text" placeholder="Cari deskripsi..." className="border px-2 py-1 rounded flex-1" value={filters.search} onChange={(e) => handleChange("search", e.target.value)} />

      {/* Sort */}
      <select className="border px-2 py-1 rounded" value={filters.sort} onChange={(e) => handleChange("sort", e.target.value)}>
        <option value="date-desc">Tanggal terbaru</option>
        <option value="date-asc">Tanggal terlama</option>
        <option value="amount-desc">Jumlah terbesar</option>
        <option value="amount-asc">Jumlah terkecil</option>
      </select>
    </div>
  );
}
