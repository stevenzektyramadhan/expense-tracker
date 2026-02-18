"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { formatRupiah, parseRupiah } from "@/lib/utils";
import CategorySelect from "../components/CategorySelect";
import Swal from "sweetalert2";
import toast from "react-hot-toast";
import MobileAddExpense from "@/components/mobile/MobileAddExpense";

export default function AddExpensePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({
    amount: "",
    category: "Makanan",
    date: new Date().toISOString().split("T")[0],
    description: "",
  });

  // ✅ Tambah state khusus kategori
  const [selectedCategory, setSelectedCategory] = useState("Makanan");
  const [customCategory, setCustomCategory] = useState("");

  const [receipt, setReceipt] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // ✅ State untuk display format Rupiah (terpisah dari formData.amount)
  const [displayAmount, setDisplayAmount] = useState("");

  // ✅ Sync displayAmount ketika formData.amount berubah (misal saat initial load)
  useEffect(() => {
    setDisplayAmount(formatRupiah(formData.amount));
  }, [formData.amount]);

  // ✅ Handler khusus untuk input amount dengan auto-format
  const handleAmountChange = (e) => {
    const inputValue = e.target.value;
    
    // Parse ke angka bersih (hapus Rp, titik, dll)
    const numericValue = parseRupiah(inputValue);
    
    // Update formData dengan angka bersih (untuk API)
    setFormData((prev) => ({
      ...prev,
      amount: numericValue || "",  // Simpan "" jika 0 untuk validasi required
    }));
    
    // Update display dengan format Rupiah
    setDisplayAmount(formatRupiah(numericValue));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setReceipt(file);
    }
  };

  const uploadReceipt = async () => {
    if (!receipt) return null;

    setUploading(true);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append("file", receipt);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formDataUpload,
      });

      if (!response.ok) throw new Error("Upload failed");

      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error("Error uploading receipt:", error);
      alert("Gagal upload struk. Silakan coba lagi.");
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setSubmitting(true);

    if (formData.amount === "" || formData.category === "" || formData.date === "") {
      toast.error("Mohon lengkapi semua field wajib.", {
        style: {
          background: '#1F2937',
          color: '#FFFFFF',
          border: '1px solid #374151',
        },
        iconTheme: {
          primary: '#EF4444',
          secondary: '#FFFFFF',
        },
      });
      setSubmitting(false);
      return;
    }

    // ✅ selalu definisikan default dulu
    let receiptUrl = null;

    // ✅ upload hanya kalau ada file struk
    if (receipt) {
      receiptUrl = await uploadReceipt();
      if (!receiptUrl) {
        toast.error("Struk gagal diupload. Coba lagi.", {
          style: {
            background: '#1F2937',
            color: '#FFFFFF',
            border: '1px solid #374151',
          },
          iconTheme: {
            primary: '#EF4444',
            secondary: '#FFFFFF',
          },
        });
        setSubmitting(false);
        return;
      }
    }

    try {
      // ✅ Kirim data ke API /api/expenses
      // API sudah menangani insert expense + update allowance dalam satu transaksi
      const response = await fetch("/api/expenses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: parseFloat(formData.amount),
          category: selectedCategory === "Lainnya" ? customCategory || "Lainnya" : selectedCategory,
          date: formData.date,
          description: formData.description,
          receipt_url: receiptUrl, // ✅ aman meskipun null
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        // Handle specific error messages from API
        throw new Error(result.error || "Gagal menyimpan pengeluaran");
      }

      // ✅ Sukses! Transaksi expense + allowance sudah ditangani API
      toast.success("Pengeluaran berhasil disimpan!", {
        style: {
          background: '#1F2937',
          color: '#FFFFFF',
          border: '1px solid #374151',
        },
        iconTheme: {
          primary: '#10B981',
          secondary: '#FFFFFF',
        },
      });

      router.push("/");
    } catch (err) {
      console.error("Error saving expense:", err.message);
      toast.error(err.message || "Gagal menyimpan pengeluaran.", {
        style: {
          background: '#1F2937',
          color: '#FFFFFF',
          border: '1px solid #374151',
        },
        iconTheme: {
          primary: '#EF4444',
          secondary: '#FFFFFF',
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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Tambah Pengeluaran</h1>
          <p className="text-gray-600">Catat pengeluaran baru Anda</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 text-black">
          {/* Amount */}
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-black mb-2">
              Jumlah Pengeluaran *
            </label>
            <input
              type="text"
              id="amount"
              name="amount"
              value={displayAmount}
              onChange={handleAmountChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
              placeholder="Rp 0"
              inputMode="numeric"
              required
            />
          </div>

          {/* ✅ Category pakai reusable */}
          <CategorySelect value={selectedCategory} onChange={setSelectedCategory} customValue={customCategory} onCustomChange={setCustomCategory} />

          {/* Date */}
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-black mb-2">
              Tanggal *
            </label>
            <input type="date" id="date" name="date" value={formData.date} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" required />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-black mb-2">
              Deskripsi
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Masukkan deskripsi pengeluaran (opsional)"
            />
          </div>

          {/* Receipt Upload */}
          <div>
            <label htmlFor="receipt" className="block text-sm font-medium text-black mb-2">
              Upload Struk (Opsional)
            </label>
            <input
              type="file"
              id="receipt"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {receipt && <p className="mt-2 text-sm text-black">File dipilih: {receipt.name}</p>}
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <button type="button" onClick={() => router.push("/")} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
              Batal
            </button>
            <button type="submit" disabled={submitting || uploading} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors">
              {submitting ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Menyimpan...
                </span>
              ) : (
                "Simpan Pengeluaran"
              )}
            </button>
          </div>
        </form>
      </div>

      <div className="md:hidden">
        <MobileAddExpense
          formData={formData}
          setFormData={setFormData}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          customCategory={customCategory}
          setCustomCategory={setCustomCategory}
          onFileChange={handleFileChange}
          receipt={receipt}
          onSubmit={handleSubmit}
          onCancel={() => router.push("/")}
          submitting={submitting}
          uploading={uploading}
        />
      </div>
    </>
  );
}
