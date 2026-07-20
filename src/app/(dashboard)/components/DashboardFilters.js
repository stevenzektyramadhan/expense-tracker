"use client";

import Button from "@/components/ui/Button";
import FormField from "@/components/ui/FormField";

const getPeriodName = ({ month, year }) => {
  return new Date(year, month - 1, 1).toLocaleDateString("id-ID", {
    month: "long",
    year: "numeric",
  });
};

export default function DashboardFilters({
  categories,
  filters,
  availableExpensePeriods,
  hasActiveFilters,
  onFilterChange,
  onReset,
}) {
  const selectedPeriod =
    filters.period === "all"
      ? "all"
      : `${filters.year}-${String(filters.month).padStart(2, "0")}`;

  const handlePeriodChange = (value) => {
    if (value === "all") {
      onFilterChange({ period: "all" });
      return;
    }

    const [year, month] = value.split("-").map(Number);
    onFilterChange({ period: "month", month, year });
  };

  return (
    <section
      className="rounded-[var(--radius-surface)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-[var(--elevation-1)] sm:p-5"
      aria-labelledby="dashboard-filters-title"
    >
      <div className="mb-3 flex items-center justify-between gap-4">
        <div>
          <h2
            id="dashboard-filters-title"
            className="font-[family-name:var(--font-display-family)] text-base font-bold"
          >
            Filter transaksi
          </h2>
          <p className="mt-0.5 text-sm text-[var(--color-text-muted)]">
            Cari dan urutkan riwayat pengeluaran.
          </p>
        </div>
        {hasActiveFilters ? (
          <Button size="compact" variant="quiet" onClick={onReset}>
            Reset
          </Button>
        ) : null}
      </div>

      <div className="grid min-w-0 gap-2 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1.35fr_1fr]">
        <FormField label="Periode">
          <select
            value={selectedPeriod}
            onChange={(event) => handlePeriodChange(event.target.value)}
          >
            <option value="all">Semua Bulan</option>
            {availableExpensePeriods.map((period) => (
              <option key={period.key} value={period.key}>
                {getPeriodName(period)}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="Kategori">
          <select
            value={filters.category}
            onChange={(event) =>
              onFilterChange({ category: event.target.value })
            }
          >
            <option value="">Semua Kategori</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="Cari transaksi">
          <input
            type="search"
            value={filters.search}
            onChange={(event) => onFilterChange({ search: event.target.value })}
            placeholder="Deskripsi atau kategori"
          />
        </FormField>

        <FormField label="Urutkan">
          <select
            value={filters.sort}
            onChange={(event) => onFilterChange({ sort: event.target.value })}
          >
            <option value="date-desc">Tanggal terbaru</option>
            <option value="date-asc">Tanggal terlama</option>
            <option value="amount-desc">Jumlah terbesar</option>
            <option value="amount-asc">Jumlah terkecil</option>
          </select>
        </FormField>
      </div>
    </section>
  );
}
