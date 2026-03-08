"use client";

import { useCallback, useMemo, useState, useEffect } from "react";
import Link from "next/link";
import Swal from "sweetalert2";
import toast from "react-hot-toast";
import MobileShell from "@/components/mobile/MobileShell";
import { authenticatedFetch } from "@/lib/authenticatedFetch";
import { formatDate, formatDateForInput, formatRupiah, parseRupiah } from "@/lib/utils";

const getCurrentMonth = () => new Date().getMonth() + 1;
const getCurrentYear = () => new Date().getFullYear();

const toastError = (message) => {
  toast.error(message, {
    style: {
      background: "#1F2937",
      color: "#FFFFFF",
      border: "1px solid #374151",
    },
    iconTheme: {
      primary: "#EF4444",
      secondary: "#FFFFFF",
    },
  });
};

const toastSuccess = (message) => {
  toast.success(message, {
    style: {
      background: "#1F2937",
      color: "#FFFFFF",
      border: "1px solid #374151",
    },
    iconTheme: {
      primary: "#10B981",
      secondary: "#FFFFFF",
    },
  });
};

function EditIncomeModal({ income, onClose, onSaved }) {
  const [formData, setFormData] = useState({
    amount: income.amount,
    source: income.source || "",
    note: income.note || "",
    date: formatDateForInput(income.date),
  });
  const [displayAmount, setDisplayAmount] = useState(formatRupiah(income.amount));
  const [saving, setSaving] = useState(false);

  const handleAmountChange = (e) => {
    const numericValue = parseRupiah(e.target.value);
    setFormData((prev) => ({ ...prev, amount: numericValue || "" }));
    setDisplayAmount(formatRupiah(numericValue));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.amount || !formData.date) {
      toastError("Nominal dan tanggal wajib diisi.");
      return;
    }

    setSaving(true);
    try {
      const response = await authenticatedFetch(`/api/incomes/${income.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: Number(formData.amount),
          source: formData.source,
          note: formData.note,
          date: formData.date,
        }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.error || "Gagal mengubah pendapatan.");
      }

      toastSuccess("Pendapatan berhasil diperbarui.");
      onSaved();
      onClose();
    } catch (err) {
      toastError(err.message || "Gagal mengubah pendapatan.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 text-black">
        <h2 className="text-xl font-semibold mb-4">Edit Pendapatan</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nominal *</label>
            <input
              type="text"
              value={displayAmount}
              onChange={handleAmountChange}
              inputMode="numeric"
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Sumber</label>
            <input
              type="text"
              value={formData.source}
              onChange={(e) => setFormData((prev) => ({ ...prev, source: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tanggal *</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Catatan</label>
            <textarea
              value={formData.note}
              onChange={(e) => setFormData((prev) => ({ ...prev, note: e.target.value }))}
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-300 rounded-lg py-2"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-blue-600 text-white rounded-lg py-2 disabled:bg-gray-400"
            >
              {saving ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function IncomeListPage() {
  const [month, setMonth] = useState(getCurrentMonth());
  const [year, setYear] = useState(getCurrentYear());
  const [incomes, setIncomes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingIncome, setEditingIncome] = useState(null);

  const loadIncomes = useCallback(async () => {
    setLoading(true);
    try {
      const response = await authenticatedFetch(`/api/incomes?month=${month}&year=${year}`);
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload.error || "Gagal memuat pendapatan tambahan.");
      }

      setIncomes(payload.data || []);
    } catch (err) {
      toastError(err.message || "Gagal memuat pendapatan tambahan.");
      setIncomes([]);
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => {
    loadIncomes();
  }, [loadIncomes]);

  const handleDelete = async (income) => {
    const result = await Swal.fire({
      title: "Hapus pendapatan?",
      text: `Pendapatan ${formatRupiah(income.amount)} akan dihapus dan saldo akan disesuaikan.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Ya, hapus",
      cancelButtonText: "Batal",
    });

    if (!result.isConfirmed) return;

    try {
      const response = await authenticatedFetch(`/api/incomes/${income.id}`, {
        method: "DELETE",
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.error || "Gagal menghapus pendapatan.");
      }

      toastSuccess("Pendapatan berhasil dihapus.");
      setIncomes((prev) => prev.filter((item) => item.id !== income.id));
    } catch (err) {
      toastError(err.message || "Gagal menghapus pendapatan.");
    }
  };

  const totalIncome = useMemo(() => incomes.reduce((sum, income) => sum + income.amount, 0), [incomes]);

  const monthOptions = useMemo(
    () => [
      "Januari",
      "Februari",
      "Maret",
      "April",
      "Mei",
      "Juni",
      "Juli",
      "Agustus",
      "September",
      "Oktober",
      "November",
      "Desember",
    ],
    []
  );

  const years = useMemo(() => {
    const current = getCurrentYear();
    return [current - 1, current, current + 1];
  }, []);

  return (
    <>
      <div className="hidden md:block max-w-4xl mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Pendapatan Tambahan</h1>
            <p className="text-gray-600">Riwayat top up budget berdasarkan periode</p>
          </div>
          <Link href="/income/add" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            + Tambah Pendapatan
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow p-4 flex flex-wrap items-end gap-4 text-black">
          <div>
            <label className="text-sm text-gray-600">Bulan</label>
            <select value={month} onChange={(e) => setMonth(Number(e.target.value))} className="block mt-1 border border-gray-300 rounded-lg px-3 py-2">
              {monthOptions.map((monthName, index) => (
                <option key={monthName} value={index + 1}>
                  {monthName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm text-gray-600">Tahun</label>
            <select value={year} onChange={(e) => setYear(Number(e.target.value))} className="block mt-1 border border-gray-300 rounded-lg px-3 py-2">
              {years.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </div>
          <div className="ml-auto text-right">
            <p className="text-sm text-gray-500">Total Pendapatan Tambahan</p>
            <p className="text-2xl font-bold text-green-600">{formatRupiah(totalIncome)}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Memuat data...</div>
          ) : incomes.length === 0 ? (
            <div className="p-8 text-center text-gray-500">Belum ada pendapatan tambahan di periode ini.</div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {incomes.map((income) => (
                <li key={income.id} className="p-4 flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-gray-900">{formatRupiah(income.amount)}</p>
                    <p className="text-sm text-gray-600">{income.source || "Sumber tidak diisi"}</p>
                    <p className="text-xs text-gray-500 mt-1">{formatDate(income.date)}</p>
                    {income.note && <p className="text-sm text-gray-600 mt-2">{income.note}</p>}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingIncome(income)}
                      className="px-3 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(income)}
                      className="px-3 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700"
                    >
                      Hapus
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="md:hidden">
        <MobileShell>
          <div className="p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">Pendapatan Tambahan</h1>
                <p className="text-sm text-gray-400">Top up budget Anda</p>
              </div>
              <Link href="/income/add" className="bg-blue-600 px-3 py-2 rounded-lg text-sm font-semibold">
                + Tambah
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <select value={month} onChange={(e) => setMonth(Number(e.target.value))} className="bg-gray-800 rounded-xl px-4 py-3 text-white outline-none">
                {monthOptions.map((monthName, index) => (
                  <option key={monthName} value={index + 1}>
                    {monthName}
                  </option>
                ))}
              </select>
              <select value={year} onChange={(e) => setYear(Number(e.target.value))} className="bg-gray-800 rounded-xl px-4 py-3 text-white outline-none">
                {years.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </div>

            <div className="bg-gradient-to-r from-green-600 to-emerald-500 rounded-2xl p-5">
              <p className="text-sm text-green-100 mb-1">Total Pendapatan Periode Ini</p>
              <p className="text-3xl font-bold text-white">{formatRupiah(totalIncome)}</p>
            </div>

            <div className="space-y-3">
              {loading && <div className="text-gray-400 text-center py-8">Memuat data...</div>}
              {!loading && incomes.length === 0 && <div className="text-gray-400 text-center py-8">Belum ada pendapatan tambahan.</div>}
              {!loading && incomes.map((income) => (
                <div key={income.id} className="bg-gray-800 rounded-2xl p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-lg font-bold text-white">{formatRupiah(income.amount)}</p>
                      <p className="text-sm text-gray-400">{income.source || "Sumber tidak diisi"}</p>
                      <p className="text-xs text-gray-500 mt-1">{formatDate(income.date)}</p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => setEditingIncome(income)}
                        className="px-3 py-1.5 rounded-lg bg-gray-700 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(income)}
                        className="px-3 py-1.5 rounded-lg bg-red-600 text-sm"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                  {income.note && <p className="text-sm text-gray-300 mt-3">{income.note}</p>}
                </div>
              ))}
            </div>
          </div>
        </MobileShell>
      </div>

      {editingIncome && (
        <EditIncomeModal
          income={editingIncome}
          onClose={() => setEditingIncome(null)}
          onSaved={loadIncomes}
        />
      )}
    </>
  );
}
