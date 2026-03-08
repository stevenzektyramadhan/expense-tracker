"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useAuth } from "@/hooks/useAuth";
import { formatRupiah, parseRupiah } from "@/lib/utils";
import { authenticatedFetch } from "@/lib/authenticatedFetch";
import MobileShell from "@/components/mobile/MobileShell";

const toastStyles = {
  style: {
    background: "#1F2937",
    color: "#FFFFFF",
    border: "1px solid #374151",
  },
  iconTheme: {
    primary: "#10B981",
    secondary: "#FFFFFF",
  },
};

export default function AddIncomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({
    amount: "",
    source: "",
    note: "",
    date: new Date().toISOString().split("T")[0],
  });
  const [displayAmount, setDisplayAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setDisplayAmount(formatRupiah(formData.amount));
  }, [formData.amount]);

  const handleAmountChange = (e) => {
    const numericValue = parseRupiah(e.target.value);
    setFormData((prev) => ({
      ...prev,
      amount: numericValue || "",
    }));
    setDisplayAmount(formatRupiah(numericValue));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.amount || !formData.date) {
      toast.error("Nominal dan tanggal wajib diisi.", {
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
      return;
    }

    setSubmitting(true);
    try {
      const response = await authenticatedFetch("/api/incomes", {
        method: "POST",
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
        throw new Error(payload.error || "Gagal menambah pendapatan.");
      }

      toast.success("Pendapatan tambahan berhasil disimpan.", toastStyles);
      router.push("/income");
    } catch (err) {
      console.error("Create income error", err);
      toast.error(err.message || "Gagal menambah pendapatan.", {
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
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    router.push("/login");
    return null;
  }

  return (
    <>
      <div className="hidden md:block max-w-2xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Tambah Pendapatan</h1>
          <p className="text-gray-600">Catat pemasukan tambahan agar saldo budget tetap akurat</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 text-black">
          <div>
            <label htmlFor="amount" className="block text-sm font-medium mb-2">Nominal *</label>
            <input
              id="amount"
              type="text"
              value={displayAmount}
              onChange={handleAmountChange}
              inputMode="numeric"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-lg"
              placeholder="Rp 0"
              required
            />
          </div>

          <div>
            <label htmlFor="source" className="block text-sm font-medium mb-2">Sumber</label>
            <input
              id="source"
              name="source"
              type="text"
              value={formData.source}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="Contoh: Orang tua"
            />
          </div>

          <div>
            <label htmlFor="date" className="block text-sm font-medium mb-2">Tanggal *</label>
            <input
              id="date"
              name="date"
              type="date"
              value={formData.date}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              required
            />
          </div>

          <div>
            <label htmlFor="note" className="block text-sm font-medium mb-2">Catatan</label>
            <textarea
              id="note"
              name="note"
              value={formData.note}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="Opsional"
            />
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.push("/income")}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
            >
              {submitting ? "Menyimpan..." : "Simpan Pendapatan"}
            </button>
          </div>
        </form>
      </div>

      <div className="md:hidden">
        <MobileShell>
          <div className="p-6 space-y-5">
            <h1 className="text-2xl font-bold mb-2">Tambah Pendapatan</h1>
            <p className="text-sm text-gray-400 mb-6">Catat pemasukan tambahan untuk menambah budget</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="bg-gray-800 rounded-2xl p-5">
                <label className="text-sm text-gray-400 mb-3 block">Nominal *</label>
                <input
                  type="text"
                  value={displayAmount}
                  onChange={handleAmountChange}
                  inputMode="numeric"
                  placeholder="Rp 0"
                  className="w-full bg-gray-700 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-blue-500 text-2xl font-bold"
                  required
                />
              </div>

              <div className="bg-gray-800 rounded-2xl p-5">
                <label className="text-sm text-gray-400 mb-3 block">Sumber</label>
                <input
                  name="source"
                  value={formData.source}
                  onChange={handleInputChange}
                  className="w-full bg-gray-700 rounded-xl px-4 py-3 text-white outline-none"
                  placeholder="Contoh: Orang tua"
                />
              </div>

              <div className="bg-gray-800 rounded-2xl p-5">
                <label className="text-sm text-gray-400 mb-3 block">Tanggal *</label>
                <input
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className="w-full bg-gray-700 rounded-xl px-4 py-3 text-white outline-none"
                  required
                />
              </div>

              <div className="bg-gray-800 rounded-2xl p-5">
                <label className="text-sm text-gray-400 mb-3 block">Catatan</label>
                <textarea
                  name="note"
                  value={formData.note}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full bg-gray-700 rounded-xl px-4 py-3 text-white outline-none resize-none"
                  placeholder="Opsional"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => router.push("/income")}
                  className="flex-1 bg-gray-700 text-white rounded-2xl py-4 font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-blue-600 rounded-2xl py-4 font-bold text-white disabled:opacity-60"
                >
                  {submitting ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </MobileShell>
      </div>
    </>
  );
}
