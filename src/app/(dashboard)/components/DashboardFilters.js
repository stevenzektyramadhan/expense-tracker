"use client";

import { useState } from "react";
import { ChevronDown, SlidersHorizontal } from "lucide-react";

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
  const [isOpenOnMobile, setIsOpenOnMobile] = useState(false);

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

  const isPeriodFilterActive = filters.period === "all";
  const isCategoryFilterActive = Boolean(filters.category);
  const isSortFilterActive = filters.sort !== "date-desc";

  const secondaryFilterCount =
    (isPeriodFilterActive ? 1 : 0) +
    (isCategoryFilterActive ? 1 : 0) +
    (isSortFilterActive ? 1 : 0);

  return (
    <section
      className="rounded-[var(--radius-surface)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-[var(--elevation-1)] sm:p-5"
      aria-labelledby="dashboard-filters-title"
    >
      <div className="mb-2 flex items-center justify-between gap-4 sm:mb-3">
        <div>
          <h2
            id="dashboard-filters-title"
            className="font-[family-name:var(--font-display-family)] text-base font-bold"
          >
            Filter transaksi
          </h2>
          <p className="hidden text-sm text-[var(--color-text-muted)] sm:mt-0.5 sm:block">
            Cari dan urutkan riwayat pengeluaran.
          </p>
        </div>
        {hasActiveFilters ? (
          <Button
            size="compact"
            variant="quiet"
            onClick={onReset}
            className="hidden sm:inline-flex"
          >
            Reset
          </Button>
        ) : null}
      </div>

      <div className="grid min-w-0 gap-2 sm:grid-cols-2 lg:grid-cols-[1.35fr_1fr_1fr_1fr]">
        <FormField label="Cari transaksi">
          <input
            type="search"
            value={filters.search}
            onChange={(event) => onFilterChange({ search: event.target.value })}
            placeholder="Deskripsi atau kategori"
          />
        </FormField>

        {/* Mobile toggle bar */}
        <div className="flex items-center justify-between gap-2 sm:hidden">
          <Button
            type="button"
            size="compact"
            variant="secondary"
            onClick={() => setIsOpenOnMobile((prev) => !prev)}
            aria-expanded={isOpenOnMobile}
            aria-controls="dashboard-secondary-filters"
          >
            <SlidersHorizontal className="size-4" aria-hidden="true" />
            <span>Opsi filter</span>
            {secondaryFilterCount > 0 ? (
              <span className="rounded-[var(--radius-pill)] bg-[var(--color-primary)] px-1.5 py-0.5 text-[0.6875rem] font-bold leading-none text-[var(--color-on-primary)]">
                {secondaryFilterCount}
              </span>
            ) : null}
            <ChevronDown
              className={`size-4 transition-transform duration-[var(--motion-standard)] ${
                isOpenOnMobile ? "rotate-180" : ""
              }`}
              aria-hidden="true"
            />
          </Button>

          {hasActiveFilters ? (
            <Button size="compact" variant="quiet" onClick={onReset}>
              Reset
            </Button>
          ) : null}
        </div>

        {/* Secondary filters */}
        <div
          id="dashboard-secondary-filters"
          className={`${
            isOpenOnMobile ? "grid" : "hidden"
          } min-w-0 gap-2 sm:contents`}
        >
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
      </div>
    </section>
  );
}
