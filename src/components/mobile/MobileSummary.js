"use client";

import MobileShell from "./MobileShell";

const getCategoryColor = (category) => {
  const colors = {
    Transportasi: "bg-blue-500",
    Makanan: "bg-green-500",
    Belanja: "bg-purple-500",
    Hiburan: "bg-pink-500",
    Kesehatan: "bg-red-500",
    Lainnya: "bg-gray-500",
  };
  return colors[category] || "bg-gray-500";
};

const formatCurrency = (amount) => new Intl.NumberFormat("id-ID").format(amount || 0);

export default function MobileSummary({ monthlyData = [], selectedMonth, onMonthChange, currentMonthData }) {
  const selectedLabel = monthlyData.find((m) => m.key === selectedMonth)?.label || "Semua Bulan";

  return (
    <MobileShell>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-8">Ringkasan Bulanan</h1>

        <div className="mb-6">
          <label className="text-sm text-gray-400 mb-3 block">Pilih Bulan</label>
          <select
            value={selectedMonth}
            onChange={(e) => onMonthChange(e.target.value)}
            className="w-full bg-gray-800 rounded-xl px-4 py-3 text-white outline-none"
          >
            {monthlyData.map((month) => (
              <option key={month.key} value={month.key}>
                {month.label}
              </option>
            ))}
          </select>
        </div>

        <div className="bg-gray-800 rounded-3xl p-6 mb-6">
          <h3 className="text-xl font-bold mb-2">{selectedLabel}</h3>
          <p className="text-sm text-gray-400 mb-6">Pengeluaran per Kategori</p>

          {currentMonthData.categories.length > 0 ? (
            <div className="space-y-4 mb-6">
              {currentMonthData.categories.map((cat, idx) => (
                <div key={cat.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 ${getCategoryColor(cat.name)} rounded-full`} />
                    <span className="text-white">{cat.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-white">Rp {formatCurrency(cat.amount)}</div>
                    <div className="text-sm text-gray-400">{cat.percentage}%</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-8">Tidak ada data untuk periode ini</p>
          )}

          <div className="border-t border-gray-700 pt-4">
            <div className="flex justify-between items-center">
              <span className="font-bold text-white">Total:</span>
              <span className="font-bold text-purple-400 text-xl">Rp {formatCurrency(currentMonthData.total)}</span>
            </div>
          </div>

          <div className="mt-8">
            <p className="text-sm text-gray-400 mb-4">Visualisasi</p>
            <div className="flex items-center justify-center py-8">
              {currentMonthData.categories.length > 0 ? (
                <div className="w-48 h-48 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                  <div className="text-center text-white">
                    <div className="text-3xl font-bold">{currentMonthData.categories.length}</div>
                    <div className="text-sm opacity-90">Kategori</div>
                  </div>
                </div>
              ) : (
                <div className="w-48 h-48 rounded-full bg-gray-700 flex items-center justify-center">
                  <div className="text-center text-gray-400">
                    <div className="text-sm">Tidak ada data</div>
                  </div>
                </div>
              )}
            </div>
            {currentMonthData.categories.length > 0 && (
              <div className="text-center mt-4">
                <div className="inline-flex items-center gap-2 bg-gray-700 rounded-lg px-4 py-2">
                  <div className={`w-3 h-3 ${getCategoryColor(currentMonthData.categories[0].name)} rounded-sm`} />
                  <span className="text-sm text-white">{currentMonthData.categories[0].name}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-gray-800 rounded-3xl p-6">
          <h3 className="text-lg font-bold mb-4">Ringkasan Semua Bulan</h3>
          <div className="space-y-3">
            {monthlyData.map((item) => (
              <div key={item.key} className="flex justify-between items-center py-3 border-b border-gray-700 last:border-b-0">
                <span className="text-gray-300">{item.label}</span>
                <span className="font-bold text-white">Rp {formatCurrency(item.total)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </MobileShell>
  );
}
