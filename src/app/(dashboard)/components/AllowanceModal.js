"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { formatRupiah, parseRupiah } from "@/lib/utils";
import Swal from "sweetalert2";

// =============================================================================
// ALLOWANCE MODAL - Set/Update Budget with IDR Auto-Formatting & Frequency
// =============================================================================
// This modal handles setting the monthly/weekly budget (Uang Saku) with:
// - Live currency formatting (e.g., "Rp 100.000")
// - Frequency selection (weekly or monthly)

export default function AllowanceModal({ 
  userId, 
  isOpen, 
  onClose, 
  onSaved, 
  initialAmount = 0,
  initialFrequency = "monthly" 
}) {
  // displayAmount: formatted string shown in input (e.g., "Rp 100.000")
  const [displayAmount, setDisplayAmount] = useState("");
  const [frequency, setFrequency] = useState("monthly");
  const [loading, setLoading] = useState(false);

  // Pre-fill the input when modal opens with existing budget data
  useEffect(() => {
    if (isOpen) {
      setDisplayAmount(initialAmount > 0 ? formatRupiah(initialAmount) : "");
      setFrequency(initialFrequency || "monthly");
    }
  }, [isOpen, initialAmount, initialFrequency]);

  if (!isOpen) return null;

  // Handle input change with live formatting
  const handleAmountChange = (e) => {
    const rawValue = e.target.value;
    // Parse to get clean integer, then format for display
    const numericValue = parseRupiah(rawValue);
    // Format back to Rupiah display (handles empty/0 gracefully)
    setDisplayAmount(formatRupiah(numericValue));
  };

  const handleSave = async () => {
    // Parse the display value back to integer for submission
    const numericAmount = parseRupiah(displayAmount);
    
    if (numericAmount <= 0) {
      Swal.fire("Input Salah", "Nominal harus lebih dari 0", "warning");
      return;
    }

    setLoading(true);
    try {
      const month = new Date().getMonth() + 1;
      const year = new Date().getFullYear();

      // cek apakah sudah ada allowance bulan ini
      const { data: existing } = await supabase
        .from("allowances")
        .select("*")
        .eq("user_id", userId)
        .eq("month", month)
        .eq("year", year)
        .maybeSingle();

      let result;
      if (existing) {
        result = await supabase
          .from("allowances")
          .update({
            amount: numericAmount,
            remaining: numericAmount,
            frequency: frequency, // Save selected frequency
          })
          .eq("id", existing.id);
      } else {
        result = await supabase.from("allowances").insert([
          {
            user_id: userId,
            month,
            year,
            amount: numericAmount,
            remaining: numericAmount,
            frequency: frequency, // Save selected frequency
          },
        ]);
      }

      if (result.error) throw result.error;

      Swal.fire("Berhasil", "Uang saku berhasil diatur!", "success");
      onSaved();
      onClose();
    } catch (err) {
      console.error("Error saving allowance:", err.message);
      Swal.fire("Error", "Gagal menyimpan uang saku", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-black font-bold mb-4">Atur Uang Saku</h2>
        
        {/* Frequency Dropdown */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Pilih Periode
          </label>
          <select
            value={frequency}
            onChange={(e) => setFrequency(e.target.value)}
            className="w-full border border-gray-300 text-black rounded-lg p-2 bg-white"
          >
            <option value="monthly">Bulanan</option>
            <option value="weekly">Mingguan</option>
          </select>
        </div>

        {/* Amount Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nominal
          </label>
          <input 
            type="text" 
            inputMode="numeric"
            value={displayAmount} 
            onChange={handleAmountChange} 
            className="w-full border border-gray-300 text-black rounded-lg p-2" 
            placeholder="Rp 0" 
          />
        </div>

        <div className="flex justify-end gap-2">
          <button 
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700" 
            onClick={onClose}
          >
            Batal
          </button>
          <button 
            onClick={handleSave} 
            disabled={loading} 
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </div>
    </div>
  );
}
